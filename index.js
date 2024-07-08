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

const app = express();
const port = 3000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  console.log(searchQuery);
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
        'INSERT INTO health_center_stock (quantity, expiry_date, stock_id_id, medicine_id_id) VALUES ($1, $2, $3, $4)',
        [quantity[i], expiry_date[i], newId, id]
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
  console.log(searchQuery);
  try {
    let queryText = "SELECT COUNT(*) FROM health_center_prescription p JOIN health_center_doctor d ON p.doctor_id_id=d.id";
    let queryParams = [];
    if (searchQuery) {
      queryText += " WHERE user_id_id ILIKE $1 OR patient_name ILIKE $1 OR doctor_name ILIKE $1 or date::text ILIKE $1";
      queryParams.push(`%${searchQuery}%`);
    }
    const totalResult = await db.query(queryText, queryParams);
    const totalItems = parseInt(totalResult.rows[0].count);

    queryText = "SELECT * FROM health_center_prescription p JOIN health_center_doctor d ON p.doctor_id_id=d.id";
    queryParams = [limit, offset];
    if (searchQuery) {
      queryText += " WHERE user_id_id ILIKE $3 OR patient_name ILIKE $3 OR doctor_name ILIKE $3 or date::text ILIKE $3 ";
      queryParams.push(`%${searchQuery}%`);
    }
    queryText += " LIMIT $1 OFFSET $2";
    const result = await db.query(queryText, queryParams);
    const items = result.rows.map(item => ({
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// app.use(
//   session({
//     resave: false,
//     saveUninitialized: true,
//     cookie:{
//       maxAge:1000*60*60*24,
//     }
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());
// app.get("/", (req, res) => {
//   res.render("home.ejs");
// });

app.get("/", (req, res) => {
  res.render("login.ejs");
});

// app.get("/register", (req, res) => {
//   res.render("register.ejs");
// });

// app.get("/logout", (req, res) => {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     res.redirect("/");
//   });
// });

//TODO: Add a get route for the submit button
// app.get("/submit",function(req,res){
//   if (req.isAuthenticated()) {
//     res.render("submit.ejs");
//   }
//   else
//   {
//     res.render("/login");
//   }
// })
//Think about how the logic should work with authentication.


// app.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/secrets",
//     failureRedirect: "/login",
//   })
// );



//TODO: Create the post route for submit.
// app.post("/submit",async function(req,res){
//   const secret=req.body.secret;
//   console.log(req.user);
//   try {
//     await db.query("UPDATE users SET secret =$1 where email=$2",[secret,req.user.email])
//     res.redirect("/secrets");
//   } catch (err) {
//     console.log(err);
//   }
// })
//Handle the submitted data and add it to the database

// passport.use(
//   "local",
//   new Strategy(async function verify(username, password, cb) {
//     try {
//       const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
//         username,
//       ]);
//       if (result.rows.length > 0) {
//         const user = result.rows[0];
//         const storedHashedPassword = user.password;
//         bcrypt.compare(password, storedHashedPassword, (err, valid) => {
//           if (err) {
//             console.error("Error comparing passwords:", err);
//             return cb(err);
//           } else {
//             if (valid) {
//               return cb(null, user);
//             } else {
//               return cb(null, false);
//             }
//           }
//         });
//       } else {
//         return cb("User not found");
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   })
// );


// passport.serializeUser((user, cb) => {
//   cb(null, user);
// });

// passport.deserializeUser((user, cb) => {
//   cb(null, user);
// });