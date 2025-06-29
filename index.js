import express, { query } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import multer from "multer";
import xlsx from "xlsx"
import {format} from "date-fns"
import fs from 'fs';
import json2xls from "json2xls";
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(json2xls.middleware);

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
      maxAge:1000*60*60*24,
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());


db.connect();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {  
    res.render("home.ejs", { path: req.path });
  } else {
    res.redirect("/login"); // Redirect to login page if not authenticated
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs", { path: req.path });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login"); // Redirect to login page after logout
  });
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// Passport configuration
passport.use(
  "local",
  new Strategy(async (username, password, done) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;

        const isMatch = await bcrypt.compare(password, storedHashedPassword);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } else {
        return done(null, false, { message: "User not found" });
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id); // Use the user ID for serialization
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      done(null, result.rows[0]);
    } else {
      done(new Error("User not found"));
    }
  } catch (err) {
    console.error("Error during deserialization:", err);
    done(err);
  }
});

app.get("/home", async(req, res) => {
  try {
    res.render("home.ejs", {  
    path:req.path
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

app.get("/medicine", async(req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;
  const searchQuery = req.query.query || ''; 

  try {
    let queryText = "SELECT COUNT(*) FROM health_center_medicine";
    let queryParams = [];
    if (searchQuery) {
      queryText += " WHERE medicine_name ILIKE $1 OR brand_name ILIKE $1 OR pack_size_label ILIKE $1 OR manufacturer_name ILIKE $1";
      queryParams.push(`%${searchQuery}%`);
    }
    const totalResult = await db.query(queryText, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    queryText = "SELECT * FROM health_center_medicine";
    queryParams = [limit, offset];
    if (searchQuery) {
      queryText += " WHERE medicine_name ILIKE $3 OR brand_name ILIKE $3 OR pack_size_label ILIKE $3 OR manufacturer_name ILIKE $3";
      queryParams.push(`%${searchQuery}%`);
    }
    queryText += " LIMIT $1 OFFSET $2";
    const result = await db.query(queryText, queryParams);
    const items = result.rows;

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
    res.render("medicine.ejs", {
      item: items,
      limit: limit,
      currentPage: page,
      totalPages: totalPages,
      searchQuery: searchQuery ,
      path:req.path
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});


app.get("/stock", async(req, res) => {
  // console.log(req.path);
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;
  const searchQuery = req.query.query || ''; 
  // console.log(searchQuery);
  try {
    let queryText = "SELECT COUNT(*) FROM health_center_stock_entry s JOIN health_center_medicine m ON s.medicine_id_id=m.id";
    let queryParams = [];
    if (searchQuery) {
      queryText += " WHERE medicine_name ILIKE $1 OR brand_name ILIKE $1 OR pack_size_label ILIKE $1 or date::text ILIKE $1 or expiry_date::text ILIKE $1 or supplier ILIKE $1";
      queryParams.push(`%${searchQuery}%`);
    }
    const totalResult = await db.query(queryText, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    queryText = "SELECT * FROM health_center_stock_entry s JOIN health_center_medicine m ON s.medicine_id_id=m.id";
    queryParams = [limit, offset];
    if (searchQuery) {
      queryText += " WHERE medicine_name ILIKE $3 OR brand_name ILIKE $3 OR pack_size_label ILIKE $3 or date::text ILIKE $3 or expiry_date::text ILIKE $3 or supplier ILIKE $3";
      queryParams.push(`%${searchQuery}%`);
    }
    queryText += " LIMIT $1 OFFSET $2";
    const result = await db.query(queryText, queryParams);
    const items = result.rows.map(item => ({
      id:item.id,
      quantity:item.quantity,
      supplier:item.supplier,
      medicine_id_id:item.medicine_id_id,
      expiry_date: format(new Date(item.expiry_date), 'yyyy-MM-dd'),
      date: format(new Date(item.date), 'yyyy-MM-dd'),
      brand_name:item.brand_name,
      medicine_name:item.medicine_name,
      constituents:item.constituents,
      manufacturer_name:item.manufacturer_name,
      pack_size_label:item.pack_size_label
    }));
    // console.log(items);
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
    res.render("stock.ejs", {
      item: items,
      limit: limit,
      currentPage: page,
      totalPages: totalPages,
      searchQuery: searchQuery,
      path:req.path
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});
app.get("/stock_status", async(req, res) => {
  // console.log(req.path);
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;
  const searchQuery = req.query.query || ''; 

  try {
    let queryText = "SELECT COUNT(*) FROM health_center_stock_entry s JOIN health_center_medicine m ON s.medicine_id_id=m.id";
    let queryParams = [];
    if (searchQuery) {
      queryText += " WHERE medicine_name ILIKE $1 OR brand_name ILIKE $1 OR pack_size_label ILIKE $1 or date::text ILIKE $1 or expiry_date::text ILIKE $1 or supplier ILIKE $1";
      queryParams.push(`%${searchQuery}%`);
    }
    const totalResult = await db.query(queryText, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    queryText = "SELECT * FROM health_center_stock_entry s JOIN health_center_medicine m ON s.medicine_id_id=m.id";
    queryParams = [limit, offset];
    if (searchQuery) {
      queryText += " WHERE medicine_name ILIKE $3 OR brand_name ILIKE $3 OR pack_size_label ILIKE $3 or date::text ILIKE $3 or expiry_date::text ILIKE $3 or supplier ILIKE $3";
      queryParams.push(`%${searchQuery}%`);
    }
    queryText += " LIMIT $1 OFFSET $2";
    const result = await db.query(queryText, queryParams);
    const items = result.rows.map(item => ({
      id:item.id,
      quantity:item.quantity,
      supplier:item.supplier,
      medicine_id_id:item.medicine_id_id,
      expiry_date: format(new Date(item.expiry_date), 'yyyy-MM-dd'),
      date: format(new Date(item.date), 'yyyy-MM-dd'),
      brand_name:item.brand_name,
      medicine_name:item.medicine_name,
      constituents:item.constituents,
      manufacturer_name:item.manufacturer_name,
      pack_size_label:item.pack_size_label
    }));
    // console.log(items);
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
    res.render("stock_status.ejs", {
      item: items,
      limit: limit,
      currentPage: page,
      totalPages: totalPages,
      searchQuery: searchQuery,
      path:req.path
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});


app.post('/add-medicine', async (req, res) => {
  // console.log(req);
  const { medicine_name, brand_name, manufacturer_name, constituents, pack_size_label } = req.body;
  try {
    await db.query(
      'INSERT INTO health_center_medicine (medicine_name, brand_name, manufacturer_name, constituents, pack_size_label) VALUES ($1, $2, $3, $4, $5)',
      [medicine_name, brand_name, manufacturer_name, constituents, pack_size_label]
    );
    res.redirect("/medicine");
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to add medicine' });
  }
});

app.get('/autocomplete', async (req, res) => {
  const brandName = req.query.brand_name;
  console.log(req.query);
  try {
    const result = await db.query(
      "SELECT brand_name, medicine_name, manufacturer_name, pack_size_label FROM health_center_medicine WHERE brand_name ILIKE $1 LIMIT 100",
      [`%${brandName}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).send('Error fetching suggestions');
  }
});


app.post('/add-stocks', async (req, res) => {
  const { brand_name, expiry_date, entry_date, quantity, supplier, medicine_name, manufacturer_name, pack_size_label } = req.body;

  try {
    for (let i = 0; i < brand_name.length; i++) {
      const res1 = await db.query(
        "SELECT id FROM health_center_medicine WHERE brand_name = $1 AND medicine_name = $2 AND manufacturer_name = $3 AND pack_size_label = $4",
        [brand_name[i], medicine_name[i], manufacturer_name[i], pack_size_label[i]]
      );
      const id = res1.rows[0].id;

      const result = await db.query(
        'INSERT INTO health_center_stock_entry (quantity, supplier, expiry_date, medicine_id_id, date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [quantity[i], supplier[i], expiry_date[i], id, entry_date[i]]
      );

      const newId = result.rows[0].id;
      await db.query(
        'INSERT INTO health_center_stock (quantity_left, stock_id_id) VALUES ($1, $2)',
        [quantity[i], newId]
      );
    }
    res.redirect("/stock");
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to add Stock' });
  }
});

app.post('/upload-medicine', upload.single('excel-file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    for (const row of rows) {
      const { medicine_name, brand_name, manufacturer_name, constituents, pack_size_label } = row;
      const query = `
        INSERT INTO health_center_medicine (medicine_name, brand_name, manufacturer_name, constituents, pack_size_label)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await db.query(query, [medicine_name, brand_name, manufacturer_name, constituents, pack_size_label]);
    }

    res.redirect('/medicine'); // Redirect to the homepage or another relevant page
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});
app.post('/upload-stock', upload.single('excel-file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    for (const row of rows) {
      
        const { medicine_name, brand_name, manufacturer_name, pack_size_label,quantity, expiry_date } = row;
        const res1 = await db.query(
          "SELECT id FROM health_center_medicine WHERE brand_name = $1 AND medicine_name = $2 AND manufacturer_name = $3 AND pack_size_label = $4",
          [brand_name, medicine_name, manufacturer_name, pack_size_label]
        );
        const id = res1.rows[0].id;
  
        const result = await db.query(
          'INSERT INTO health_center_stock_entry (quantity, supplier, expiry_date, medicine_id_id, date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [quantity, supplier, expiry_date, id, entry_date]
        );
  
        const newId = result.rows[0].id;
        await db.query(
          'INSERT INTO health_center_stock (quantity, expiry_date, stock_id_id, medicine_id_id) VALUES ($1, $2, $3, $4)',
          [quantity, expiry_date, newId, id]
        );

    

    res.redirect('/stock'); // Redirect to the homepage or another relevant page
  }
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});


app.get("/patient", async(req, res) => {
  // console.log(req.path);
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;
  const searchQuery = req.query.query || ''; 
  // console.log(searchQuery);
  try {
    let queryText = "SELECT COUNT(*) FROM health_center_prescription p JOIN health_center_doctor d ON p.doctor_id_id=d.id";
    let queryParams = [];
    if (searchQuery) {
      queryText += " WHERE user_id_id ILIKE $1 OR patient_name ILIKE $1 OR doctor_name ILIKE $1 or date::text ILIKE $1";
      queryParams.push(`%${searchQuery}%`);
    }
    const totalResult = await db.query(queryText, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    queryText = "SELECT p.*,d.doctor_name FROM health_center_prescription p JOIN health_center_doctor d ON p.doctor_id_id=d.id";
    queryParams = [limit, offset];
    if (searchQuery) {
      queryText += " WHERE user_id_id ILIKE $3 OR patient_name ILIKE $3 OR doctor_name ILIKE $3 or date::text ILIKE $3 ";
      queryParams.push(`%${searchQuery}%`);
    }

    queryText += " LIMIT $1 OFFSET $2";
    const result = await db.query(queryText, queryParams);
    // console.log(result.rows);
    const items = result.rows.map(item => ({
      prescription_id:item.id,
      user_id_id:item.user_id_id,
      patient_name:item.patient_name,
      doctor_name:item.doctor_name,
      date: format(new Date(item.date), 'yyyy-MM-dd'),
    }));
    // console.log(items);
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
    res.render("patient.ejs", {
      item: items,
      limit: limit,
      currentPage: page,
      totalPages: totalPages,
      searchQuery: searchQuery,
      path:req.path
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

app.get('/autocompletedoctor', async (req, res) => {
  const doctorName = req.query.doctor_name;
  // console.log(req.query);
  try {
    const result = await db.query(
      "SELECT doctor_name FROM health_center_doctor WHERE doctor_name ILIKE $1 LIMIT 100",
      [`%${doctorName}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).send('Error fetching suggestions');
  }
});


app.post('/add-patient-log', async (req, res) => {
  const {
    visit_date,
    doctor_name,
    patient_id,
    patient_name,
    age,
    relation,
    dependent_relation,
    ailment,
    test,
    suggestion,
    medicine_name,
    manufacturer_name,
    pack_size_label,
    quantity,
    days,
    times
  } = req.body;
  console.log(req.body);
  
  const l=visit_date.length;
  try {
    for (let i = 0; i < l; i++) {
      const res1 = await db.query("SELECT id FROM health_center_doctor WHERE doctor_name=$1",[doctor_name[i]]);
      const doctor_id=res1.rows[0].id;
      const res2=await db.query("INSERT INTO health_center_prescription (details,date,test,suggestions,doctor_id_id,user_id_id,patient_name,relation,relationship,age) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id",[ailment[i],visit_date[i],test[i],suggestion[i],doctor_id,patient_id[i],patient_name[i],relation[i],dependent_relation[i],age[i]]);
      const pres_id=res2.rows[0].id;
      // console.log(pres_id);
      try {
        for (let j = 0; j < medicine_name[i].length; j++) {
          const med_id=await db.query("SELECT id FROM health_center_medicine WHERE brand_name=$1 AND manufacturer_name=$2 AND pack_size_label=$3",[medicine_name[i][j],manufacturer_name[i][j],pack_size_label[i][j]]);
          // console.log(med_id.rows[0]);
          const res3=await db.query("INSERT INTO health_center_prescribed_medicine (quantity,days,times,medicine_id_id,prescription_id_id,prescribed_date,prescribed_by) VALUES ($1,$2,$3,$4,$5,$6,$7)",[quantity[i][j],days[i][j],times[i][j],med_id.rows[0].id,pres_id,visit_date[i],doctor_id]);
        } 
      } catch (error) {
        console.log(error);
      }
    }
    res.redirect("/patient");
  } catch (error) {
    console.log(error);
    
  }
});

app.get('/prescription/:id', async (req, res) => {
  const prescriptionId = req.params.id;
  try {
    // console.log(prescriptionId);
    const prescription = await db.query("SELECT * FROM health_center_prescription p JOIN health_center_doctor d on p.doctor_id_id=d.id WHERE p.id=$1", [prescriptionId]);
    const medicines = await db.query("SELECT p.*,m.brand_name FROM health_center_prescribed_medicine p JOIN health_center_medicine m ON p.medicine_id_id=m.id WHERE prescription_id_id=$1", [prescriptionId]);
    // console.log(prescription.rows);
    res.json({
      doctor_name: prescription.rows[0].doctor_name,
      patient_name: prescription.rows[0].patient_name,
      age: prescription.rows[0].age,
      medicines: medicines.rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching prescription data");
  }
});


app.post('/update-medicine', async (req, res) => {
  const { prescription_id, brand_name, manufacturer_name, pack_size_label, quantity, days, times } = req.body;
  // console.log(req.body);
  try {
    const result1 = await db.query('SELECT id FROM health_center_medicine WHERE brand_name = $1 AND manufacturer_name=$2 AND pack_size_label=$3', [brand_name,manufacturer_name,pack_size_label]);
    const medicine_id = result1.rows[0].id;
    const result = await db.query(
      "INSERT INTO health_center_prescribed_medicine (quantity, days, times, medicine_id_id, prescription_id_id,prescribed_date) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *",
      [quantity, days, times, medicine_id, prescription_id,new Date()]
    );
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving medicine');
  }
});



app.post('/prescribed_medicine/:id', async (req, res) => {
  const prescriptionId = req.params.id;
  const { revoked_status } = req.body;
  
  try {
    const prescription = await db.query(
      "UPDATE health_center_prescribed_medicine SET medicine_revoked=$1, revoked_date=$2 WHERE id=$3",
      [revoked_status, new Date(), prescriptionId]
    );
    res.status(200).send("Ok");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating prescription data");
  }
});

app.get('/search-prescriptions', async (req, res) => {
  const { term, field } = req.query;
  // console.log(req.query);
  if (!term || !field) {
    return res.status(400).json({ error: 'Missing search term or field' });
  }

  const query = `SELECT p.*,d.doctor_name FROM health_center_prescription p JOIN health_center_doctor d ON p.doctor_id_id=d.id WHERE ${field} ILIKE $1`; 
  const values = [`%${term}%`];

  try {
    const result = await db.query(query, values);
    // console.log("hello");
    // console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/notifications", async(req, res) => {
  // console.log(req.path);
  try {
    
    res.render("notifications.ejs", {
      path:req.path
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

app.get('/total-patients-today', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const query = `
      SELECT COUNT(*) as total_patients
      FROM health_center_prescription
      WHERE date >= $1 AND date <= $2
    `;
    const result = await db.query(query, [startOfDay, endOfDay]);
    const totalPatients = result.rows[0].total_patients;
    // console.log(totalPatients);
    res.json({ totalPatients });
  } catch (error) {
    console.error('Error fetching total patients today:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/total-patients', async (req, res) => {
  try {
    const { startDate, endDate, doctorId } = req.query;
    let params = [];
    let conditions = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`date <= $${params.length}`);
    }
    if (doctorId) {
      params.push(doctorId);
      conditions.push(`doctor_id_id = $${params.length}`);
    }

    let query = `
      SELECT COUNT(*) as total_patients
      FROM health_center_prescription
    `;
    if (conditions.length > 0) {
      query += 'WHERE ' + conditions.join(' AND ');
    }

    const result = await db.query(query, params);
    const totalPatients = result.rows[0].total_patients;

    res.json({ totalPatients });
  } catch (error) {
    console.error('Error fetching total patients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/total-medicine', async (req, res) => {
  try {
    const { entryDate, expiryDate } = req.query;
    let params = [];
    let conditions = [];

    if (entryDate) {
      params.push(entryDate);
      conditions.push(`date >= $${params.length}`);
    }
    if (expiryDate) {
      params.push(expiryDate);
      conditions.push(`expiry_date <= $${params.length}`);
    }

    let query = `
      SELECT COUNT(*) as medicinecount
      FROM health_center_stock h JOIN health_center_stock_entry hs on h.stock_id_id=hs.id
    `;
    if (conditions.length > 0) {
      query += 'WHERE ' + conditions.join(' AND ');
    }

    const result = await db.query(query, params);
    const medicinecount = result.rows[0].medicinecount;

    res.json({ medicinecount });
  } catch (error) {
    console.error('Error fetching total patients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/medicine-with-low-stock', async (req, res) => {
  try {
    const result = await db.query(`SELECT COUNT(*) as totalcount
      FROM health_center_stock h where quantity_left<=50`);
    const totalcount = result.rows[0].totalcount;

    res.json({ totalcount });
  } catch (error) {
    console.error('Error fetching total patients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/medicine-with-expiry', async (req, res) => {
  try {
    const result = await db.query(`
  SELECT COUNT(*) as totalcount
  FROM health_center_stock h
  JOIN health_center_stock_entry hs ON h.stock_id_id = hs.id
  WHERE hs.expiry_date < NOW() + INTERVAL '2 months'
`);
    const totalcount = result.rows[0].totalcount;

    res.json({ totalcount });
  } catch (error) {
    console.error('Error fetching total patients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to export patient data to Excel
app.get('/export-patients', async (req, res) => {
  try {
    const { startDate, endDate, doctorId } = req.query;
    let params = [];
    let conditions = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`p.date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`p.date <= $${params.length}`);
    }
    if (doctorId) {
      params.push(doctorId);
      conditions.push(`p.doctor_id_id = $${params.length}`);
    }

    let query = `
      SELECT p.user_id_id AS PatientId, p.patient_name AS PatientName, p.age AS Age, 
             p.relation AS Relation, p.relationship AS Relationship, p.details AS Symptoms, 
             d.doctor_name AS DoctorName, p.date AS VisitDate 
      FROM health_center_prescription p
      JOIN health_center_doctor d ON p.doctor_id_id = d.id
    `;

    if (conditions.length > 0) {
      query += 'WHERE ' + conditions.join(' AND ');
    }

    const result = await db.query(query, params);

    const filePath = 'patients.xlsx';
    fs.writeFileSync(filePath, json2xls(result.rows), 'binary');

    res.download(filePath, 'patients.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
      fs.unlinkSync(filePath); // Delete file after download
    });
  } catch (error) {
    console.error('Error exporting patients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/export-stock', async (req, res) => {
  try {
    const { entryDate, expiryDate } = req.query;
    let params = [];
    let conditions = [];

    if (entryDate) {
      params.push(entryDate);
      conditions.push(`hs.date >= $${params.length}`);
    }
    if (expiryDate) {
      params.push(expiryDate);
      conditions.push(`hs.expiry_date <= $${params.length}`);
    }

    let query = `
      SELECT * 
      FROM health_center_stock h
      JOIN health_center_stock_entry hs ON h.stock_id_id = hs.id
      JOIN health_center_medicine hm ON hs.medicine_id_id = hm.id
    `;

    if (conditions.length > 0) {
      query += 'WHERE ' + conditions.join(' AND ');
    }

    const result = await db.query(query, params);

    const filePath = 'stocks.xlsx';
    fs.writeFileSync(filePath, json2xls(result.rows), 'binary');

    res.download(filePath, 'stocks.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
      fs.unlinkSync(filePath); // Delete file after download
    });
  } catch (error) {
    console.error('Error exporting stock:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/export-low-count-stock', async (req, res) => {
  try {
    
    const result = await db.query(`
      SELECT * 
      FROM health_center_stock h
      JOIN health_center_stock_entry hs ON h.stock_id_id = hs.id
      JOIN health_center_medicine hm ON hs.medicine_id_id = hm.id
    `);

    const filePath = 'stocks_with_low_count.xlsx';
    fs.writeFileSync(filePath, json2xls(result.rows), 'binary');

    res.download(filePath, 'stocks_with_low_count.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
      fs.unlinkSync(filePath); // Delete file after download
    });
  } catch (error) {
    console.error('Error exporting stock:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/export-near-expiry-medicine', async (req, res) => {
  try {
    
    const result = await db.query(`
      SELECT * 
      FROM health_center_stock h
      JOIN health_center_stock_entry hs ON h.stock_id_id = hs.id
      JOIN health_center_medicine hm ON hs.medicine_id_id = hm.id
      WHERE hs.expiry_date < NOW() + INTERVAL '2 months' 
    `);

    const filePath = 'near-expiry-medicine.xlsx';
    fs.writeFileSync(filePath, json2xls(result.rows), 'binary');

    res.download(filePath, 'near-expiry-medicine.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
      fs.unlinkSync(filePath); // Delete file after download
    });
  } catch (error) {
    console.error('Error exporting stock:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/doctors', async (req, res) => {
  try {
    const result = await db.query('SELECT id, doctor_name FROM health_center_doctor');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
