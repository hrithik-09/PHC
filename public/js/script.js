
document.addEventListener('DOMContentLoaded', () => {
  const getCellValue = (row, index) => row.children[index].innerText || row.children[index].textContent;

  const comparer = (index, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
  )(getCellValue(asc ? a : b, index), getCellValue(asc ? b : a, index));

  document.querySelectorAll('.sort-button').forEach(button => {
    button.addEventListener('click', () => {
      const table = button.closest('.medicines-area-wrapper');
      const rows = Array.from(table.querySelectorAll('.medicines-row'));
      const index = Array.from(button.closest('.medicines-header').children).indexOf(button.parentElement);
      const asc = !button.classList.contains('asc');

      rows.sort(comparer(index, asc));
      rows.forEach(row => table.appendChild(row));

      button.classList.toggle('asc', asc);
      button.classList.toggle('desc', !asc);
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const getCellValue = (row, index) => row.children[index].innerText || row.children[index].textContent;

  const comparer = (index, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
  )(getCellValue(asc ? a : b, index), getCellValue(asc ? b : a, index));

  document.querySelectorAll('.sort-button').forEach(button => {
    button.addEventListener('click', () => {
      const table = button.closest('.stocks-area-wrapper');
      const rows = Array.from(table.querySelectorAll('.stocks-row'));
      const index = Array.from(button.closest('.stocks-header').children).indexOf(button.parentElement);
      const asc = !button.classList.contains('asc');

      rows.sort(comparer(index, asc));
      rows.forEach(row => table.appendChild(row));

      button.classList.toggle('asc', asc);
      button.classList.toggle('desc', !asc);
    });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const getCellValue = (row, index) => row.children[index].innerText || row.children[index].textContent;

  const comparer = (index, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
  )(getCellValue(asc ? a : b, index), getCellValue(asc ? b : a, index));

  document.querySelectorAll('.sort-button').forEach(button => {
    button.addEventListener('click', () => {
      const table = button.closest('.patients-area-wrapper');
      const rows = Array.from(table.querySelectorAll('.patients-row'));
      const index = Array.from(button.closest('.patients-header').children).indexOf(button.parentElement);
      const asc = !button.classList.contains('asc');

      rows.sort(comparer(index, asc));
      rows.forEach(row => table.appendChild(row));

      button.classList.toggle('asc', asc);
      button.classList.toggle('desc', !asc);
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  const searchBar = document.getElementById('search-bar');
  const medicinesArea = document.getElementById('medicines-area');
  const medicinesRows = document.getElementById('medicines-rows');

  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const query = searchBar.value;
    fetch(`/medicine?query=${encodeURIComponent(query)}`)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newmedicinesRows = doc.getElementById('medicines-rows').innerHTML;
        const paginationControls = doc.querySelector('.pagination-controls').innerHTML;
        medicinesRows.innerHTML = newmedicinesRows;
        document.querySelector('.pagination-controls').innerHTML = paginationControls;
      });
  });
});


document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  const searchBar = document.getElementById('search-bar');
  const patientsArea = document.getElementById('patients-area');
  const patientsRows = document.getElementById('patients-rows');

  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const query = searchBar.value;
    fetch(`/patient?query=${encodeURIComponent(query)}`)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newpatientsRows = doc.getElementById('patients-rows').innerHTML;
        const paginationControls = doc.querySelector('.pagination-controls').innerHTML;
        patientsRows.innerHTML = newpatientsRows;
        document.querySelector('.pagination-controls').innerHTML = paginationControls;
      });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  const searchBar = document.getElementById('search-bar');
  const stocksArea = document.getElementById('stocks-area');
  const stocksRows = document.getElementById('stocks-rows');
  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const query = searchBar.value;
    fetch(`/stock?query=${encodeURIComponent(query)}`)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newpatientsRows = doc.getElementById('stocks-rows').innerHTML;
        const paginationControls = doc.querySelector('.pagination-controls').innerHTML;
        patientsRows.innerHTML = newpatientsRows;
        document.querySelector('.pagination-controls').innerHTML = paginationControls;
      });
  });
});


document.addEventListener('DOMContentLoaded', function() {
  function openPopup() {
    document.getElementById('popupForm').style.display = 'flex';
  }

  function closePopup() {
    document.getElementById('popupForm').style.display = 'none';
  }

  document.querySelector('.app-content-headerButton').addEventListener('click', openPopup);
  document.querySelector('.close-btn').addEventListener('click', closePopup);

  window.addEventListener('click', function(event) {
    const popupForm = document.getElementById('popupForm');
    if (event.target == popupForm) {
      closePopup();
    }
  });

  function createEntryRow() {
    const entryContainer = document.createElement('div');
    entryContainer.className = 'entry-row';

    entryContainer.innerHTML = `
      <label for="brand_name">Brand Name:</label>
      <input type="text" class="brand_name" name="brand_name[]" onkeyup="fetchSuggestions(this)" required>
      <div class="suggestions"></div>
      
      <label for="expiry_date">Expiry Date:</label>
      <input type="date" name="expiry_date[]" required>
      
      <label for="entry_date">Entry Date:</label>
      <input type="date" name="entry_date[]" required>
      
      <label for="quantity">Quantity:</label>
      <input type="text" name="quantity[]" required>
      
      <label for="supplier">Supplier:</label>
      <input type="text" name="supplier[]" required>
      
      <label for="medicine_name">Medicine Name:</label>
      <input type="text" name="medicine_name[]" required>
      
      <label for="manufacturer_name">Manufacturer Name:</label>
      <input type="text" name="manufacturer_name[]" required>
      
      <label for="pack_size_label">Pack Size Label:</label>
      <input type="text" name="pack_size_label[]" required>
      
      <button type="button" class="remove-entry-btn">Remove</button>
    `;

    entryContainer.querySelector('.remove-entry-btn').addEventListener('click', () => {
      entryContainer.remove();
    });

    document.getElementById('entries-container').appendChild(entryContainer);
  }

  document.getElementById('add-entry-btn').addEventListener('click', createEntryRow);

  window.fetchSuggestions = function(input) {
    const brandName = input.value;
    if (brandName.length > 0) {
      fetch(`/autocomplete?brand_name=${brandName}`)
        .then(response => response.json())
        .then(data => {
          const suggestions = input.nextElementSibling;
          suggestions.innerHTML = '';
          data.forEach(item => {
            const suggestion = document.createElement('div');
            suggestion.innerText = item.brand_name;
            suggestion.onclick = () => {
              input.value = item.brand_name;
              const entryRow = input.closest('.entry-row');
              entryRow.querySelector('input[name="medicine_name[]"]').value = item.medicine_name;
              entryRow.querySelector('input[name="manufacturer_name[]"]').value = item.manufacturer_name;
              entryRow.querySelector('input[name="pack_size_label[]"]').value = item.pack_size_label;
              suggestions.innerHTML = '';
            };
            suggestions.appendChild(suggestion);
          });
        });
    }
    else
      {
          const suggestions = input.nextElementSibling;
          suggestions.innerHTML = '';
          const suggestion = document.createElement('div');
          suggestion.innerText = item.brand_name;
          suggestion.onclick = () => {
          input.value = item.brand_name;
          const entryRow = input.closest('.entry-row');
          entryRow.querySelector('input[name="medicine_name[]"]').value = '';
          entryRow.querySelector('input[name="manufacturer_name[]"]').value = '';
          entryRow.querySelector('input[name="pack_size_label[]"]').value = '';
          suggestions.innerHTML = '';
          };
          suggestions.appendChild(suggestion);
      }
  };

  createEntryRow(); // Create the first entry row
});

document.addEventListener('DOMContentLoaded', function() {
  function openPopup() {
    document.getElementById('popupForm').style.display = 'flex';
  }

  function closePopup() {
    document.getElementById('popupForm').style.display = 'none';
  }

  document.querySelector('.app-content-headerButton').addEventListener('click', openPopup);
  document.querySelector('.close-btn').addEventListener('click', closePopup);

  window.addEventListener('click', function(event) {
    const popupForm = document.getElementById('popupForm');
    if (event.target == popupForm) {
      closePopup();
    }
  });

  let entryIndex = 0;

function createEntryRow() {
  const entryContainer = document.createElement('div');
  entryContainer.className = 'entry-row';
  entryContainer.dataset.index = entryIndex;

  entryContainer.innerHTML = `
    <label for="visit_date">Visit Date:</label>
    <input type="date" name="visit_date[]" required>
  
    <label for="doctor_name">Doctor Name:</label>
    <input type="text" class="doctor_name" name="doctor_name[]" onkeyup="fetchdoctorSuggestions(this)" required>
    <div class="suggestions"></div>

    <label for="patient_id">Patient ID:</label>
    <input type="text" name="patient_id[]" required>
    
    <label for="patient_name">Patient Name:</label>
    <input type="text" name="patient_name[]" required>
    
    <div class="inline-fields">
      <input type="text" placeholder="Age" name="age[]" required>

      <select name="relation[]" required onchange="toggleDependentRelation(this)">
        <option value="Self">Self</option>
        <option value="Dependent">Dependent</option>
      </select>

      <div class="dependent-relation-container" style="display: none;">
        <select name="dependent_relation[]">
          <option value="Spouse">Spouse</option>
          <option value="Child">Child</option>
          <option value="Sister">Sister</option>
          <option value="Brother">Brother</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Mother-in-law">Mother-in-law</option>
          <option value="Father-in-law">Father-in-law</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>

    <label for="ailment">Ailment:</label>
    <input type="text" name="ailment[]" required>
    
    <label for="test">Test(If Needed):</label>
    <input type="text" name="test[]" required>

    <label for="suggestion">Suggestion:</label>
    <input type="text" name="suggestion[]" required>

    <div class="medicines-container">
      <h3>Medicines</h3>
      <button type="button" class="add-medicine-btn">Add Medicine</button>
    </div>
    
    <button type="button" class="remove-entry-btn">Remove Entry</button>
  `;

  entryContainer.querySelector('.remove-entry-btn').addEventListener('click', () => {
    entryContainer.remove();
  });

  entryContainer.querySelector('.add-medicine-btn').addEventListener('click', () => {
    const entryIndex = entryContainer.dataset.index;
    const medicinesContainer = entryContainer.querySelector('.medicines-container');
    const medicineRow = document.createElement('div');
    medicineRow.className = 'medicine-row';

    medicineRow.innerHTML = `
      <label for="medicine_name">Medicine Name:</label>
      <input type="text" class="medicine_name" name="medicine_name[${entryIndex}][]" onkeyup="fetchMedSuggestions(this)" required>
      <div class="suggestions"></div>

      <div class="inline-fields">
        <input type="text" class="manufacturer_name" placeholder= "Manufacturer" name="manufacturer_name[${entryIndex}][]" required>
        <input type="text" class="pack_size_label" placeholder="Pack Size Label" name="pack_size_label[${entryIndex}][]" required>
      </div>

      <div class="inline-fields">
        <input type="text" placeholder="Quantity" name="quantity[${entryIndex}][]" required>
        <input type="text" placeholder="Days" name="days[${entryIndex}][]" required>
        <input type="text" placeholder="Times" name="times[${entryIndex}][]" required>
      </div>
      
      <button type="button" class="remove-medicine-btn">Remove Medicine</button>
    `;

    medicineRow.querySelector('.remove-medicine-btn').addEventListener('click', () => {
      medicineRow.remove();
    });

    medicinesContainer.appendChild(medicineRow);
  });

  document.getElementById('entries-container').appendChild(entryContainer);
  entryIndex++;
}

  document.getElementById('add-patient-entry-btn').addEventListener('click', createEntryRow);

  window.fetchMedSuggestions = function(input) {
    const brandName = input.value;
    if (brandName.length > 0) {
        fetch(`/autocomplete?brand_name=${brandName}`)
            .then(response => response.json())
            .then(data => {
                const suggestions = input.nextElementSibling;
                suggestions.innerHTML = '';
                data.forEach(item => {
                    const suggestion = document.createElement('div');
                    suggestion.innerText = item.brand_name;
                    suggestion.onclick = () => {
                        input.value = item.brand_name;
                        const medicineRow = input.closest('.medicine-row');
                        const manufacturerInput = medicineRow.querySelector('.manufacturer_name');
                        const packSizeInput = medicineRow.querySelector('.pack_size_label');
                        manufacturerInput.value = item.manufacturer_name;
                        packSizeInput.value = item.pack_size_label;
                        suggestions.innerHTML = '';
                    };
                    suggestions.appendChild(suggestion);
                });
            });
    } else {
        const suggestions = input.nextElementSibling;
        suggestions.innerHTML = '';
    }
};




  window.fetchdoctorSuggestions = function(input) {
    const doctorName = input.value;
    if (doctorName.length > 0) {
      fetch(`/autocompletedoctor?doctor_name=${doctorName}`)
        .then(response => response.json())
        .then(data => {
          const suggestions = input.nextElementSibling;
          suggestions.innerHTML = '';
          data.forEach(item => {
            const suggestion = document.createElement('div');
            suggestion.innerText = item.doctor_name;
            suggestion.onclick = () => {
              input.value = item.doctor_name;
              const entryRow = input.closest('.entry-row');
              suggestions.innerHTML = '';
            };
            suggestions.appendChild(suggestion);
          });
        });
    }
    else
      {
          const suggestions = input.nextElementSibling;
          suggestions.innerHTML = '';
          const suggestion = document.createElement('div');
          suggestion.innerText = item.brand_name;
          suggestion.onclick = () => {
          input.value = item.brand_name;
          const entryRow = input.closest('.entry-row');
          suggestions.innerHTML = '';
          };
          suggestions.appendChild(suggestion);
      }
  };
  window.toggleDependentRelation = function(selectElement) {
    const dependentRelationContainer = selectElement.parentElement.querySelector('.dependent-relation-container');
    if (selectElement.value === 'Dependent') {
      dependentRelationContainer.style.display = 'block';
    } else {
      dependentRelationContainer.style.display = 'none';
    }
  }
  createEntryRow(); // Create the first entry row
});



window.fetchextraMedSuggestions = function(input) {
  const brandName = input.value;
  if (brandName.length > 0) {
      fetch(`/autocomplete?brand_name=${brandName}`)
          .then(response => response.json())
          .then(data => {
              const suggestions_extra = input.nextElementSibling;
              suggestions_extra.innerHTML = '';
              data.forEach(item => {
                  const suggestion = document.createElement('div');
                  suggestion.innerText = item.brand_name;
                  suggestion.onclick = () => {
                      input.value = item.brand_name;
                      const medicineRow = input.closest('.medicine-row');
                      const manufacturerInput = medicineRow.querySelector('.new_manufacturer_name');
                      const packSizeInput = medicineRow.querySelector('.new_pack_size_label');
                      manufacturerInput.value = item.manufacturer_name;
                      packSizeInput.value = item.pack_size_label;
                      suggestions_extra.innerHTML = '';
                  };
                  suggestions_extra.appendChild(suggestion);
              });
          });
  } else {
      const suggestions_extra = input.nextElementSibling;
      suggestions_extra.innerHTML = '';
  }
};

async function fetchPrescriptionData(prescriptionId) {
  const response = await fetch(`/prescription/${prescriptionId}`);
  const data = await response.json();
  return data;
}
function printPrescription() {
    window.print();
}

function fillPrescriptionPopup(data) {
  document.querySelector('.doctor-details').innerText = `Doctor: ${data.doctor_name}`;
  document.querySelector('.patient-details').innerText = `Patient: ${data.patient_name}`;
  document.querySelector('.patient-age-details').innerText = `Age: ${data.age}`;
  
  const tbody = document.querySelector('.medicines-table tbody');
  tbody.innerHTML = '';
  
  data.medicines.forEach(med => {
    if (med.revoked_date == null)
      med.revoked_date = '';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${med.brand_name}</td>
      <td>${med.quantity}</td>
      <td>${med.days}</td>
      <td>${med.times}</td>
      <td><input type="checkbox" class="revoke-checkbox" data-id="${med.id}" ${med.medicine_revoked ? 'checked disabled' : ''}></td>
      <td>${med.revoked_date}</td>
    `;
    if (med.medicine_revoked) {
      row.classList.add('revoked');
    }
    tbody.appendChild(row);
  });

  document.querySelectorAll('.revoke-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      if (event.target.checked) {
        const row = event.target.closest('tr');
        row.classList.add('revoked');
        event.target.disabled = true;
        // Add your API call here to update the revoke status in the database
      }
    });
  });
}



function openAddMedicinePopup(prescriptionId) {
  document.querySelector('.prescription_id').value = prescriptionId;
  console.log(prescriptionId);
  document.getElementById('addMedicinePopup').style.display = 'block';
}

function closeAddMedicinePopup() {
  document.getElementById('addMedicinePopup').style.display = 'none';
}

async function saveNewMedicine() {
  const prescriptionId = document.querySelector('.prescription_id').value;
  const medicineName = document.querySelector('.new_medicine_name').value;
  const manufacturerName = document.querySelector('.new_manufacturer_name').value;
  const packSizeLabel = document.querySelector('.new_pack_size_label').value;
  const quantity = document.querySelector('input[name="new_quantity"]').value;
  const days = document.querySelector('input[name="new_days"]').value;
  const times = document.querySelector('input[name="new_times"]').value;
  // console.log(prescriptionId);
  // console.log(medicineName);
  // console.log(manufacturerName);
  // console.log(packSizeLabel);
  // console.log(quantity);
  // console.log(days);
  // console.log(times);
  const response = await fetch('/update-medicine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prescription_id: prescriptionId,
      brand_name: medicineName,
      manufacturer_name: manufacturerName,
      pack_size_label: packSizeLabel,
      quantity: quantity,
      days: days,
      times: times
    })
  });

  if (response.ok) {
    const newMedicine = await response.json();
    const tbody = document.querySelector('.medicines-table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${medicineName}</td>
      <td>${newMedicine.quantity}</td>
      <td>${newMedicine.days}</td>
      <td>${newMedicine.times}</td>
      <td><input type="checkbox" class="revoke-checkbox" data-id="${newMedicine.id}"></td>
      <td></td>
    `;
    tbody.appendChild(row);
    closeAddMedicinePopup();
  } else {
    alert('Failed to save medicine');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const presPopup = document.getElementById('prescriptionPopup');
  const addMedPopup = document.getElementById('addMedicinePopup');
  const closeBtn = document.querySelector('.prescription-close-btn');
  const addMedicineCloseBtn = document.querySelector('.add-medicine-close-btn');
  const viewPrescriptionBtns = document.querySelectorAll('.view-prescription-btn');
  const addMoreMedicineBtn = document.querySelector('.add-more-medicine-btn');
  const saveMedicineBtn = document.querySelector('.save-medicine-btn');
  document.querySelector('.print-btn').addEventListener('click', () => {
        printPrescription();
      });
  viewPrescriptionBtns.forEach(button => {
    button.addEventListener('click', async () => {
      const prescriptionId = button.getAttribute('data-id');
      const prescriptionData = await fetchPrescriptionData(prescriptionId);
      fillPrescriptionPopup(prescriptionData);
      presPopup.style.display = 'block';
      addMedicineCloseBtn.onclick = () => {
        addMedPopup.style.display = 'none';
      }
    
      addMoreMedicineBtn.onclick = () => {
        const prescriptionId = button.getAttribute('data-id');
        openAddMedicinePopup(prescriptionId);
      }
    
      saveMedicineBtn.onclick = () => {
        saveNewMedicine();
      }
    });
  });

  closeBtn.onclick = () => {
    presPopup.style.display = 'none';
  }

  

  window.onclick = (event) => {
    if (event.target == presPopup) {
      presPopup.style.display = 'none';
    } else if (event.target == addMedPopup) {
      addMedPopup.style.display = 'none';
    }
  }
});





















































// async function fillPrescriptionPopup(data) {
//   document.querySelector('.doctor-details').innerText = `Doctor: ${data.doctor_name}`;
//   document.querySelector('.patient-details').innerText = `Patient: ${data.patient_name}, Age: ${data.age}`;
  
//   const tbody = document.querySelector('.medicines-table tbody');
//   tbody.innerHTML = '';
  
//   data.medicines.forEach(med => {
//     if (med.revoked_date == null) med.revoked_date = '';
//     const row = document.createElement('tr');
//     row.innerHTML = `
//       <td>${med.brand_name}</td>
//       <td>${med.quantity}</td>
//       <td>${med.days}</td>
//       <td>${med.times}</td>
//       <td><input type="checkbox" ${med.medicine_revoked ? 'checked' : ''}></td>
//       <td>${med.revoked_date}</td>
//     `;
//     row.querySelector('input[type="checkbox"]').addEventListener('change', () => {
//       if (row.querySelector('input[type="checkbox"]').checked) {
//         row.style.textDecoration = 'line-through';
//         row.querySelector('input[type="checkbox"]').disabled = true;
//       }
//     });
//     tbody.appendChild(row);
//   });
// }



// document.addEventListener('DOMContentLoaded', () => {
//   const pres_popup = document.getElementById('prescriptionPopup');
//   const closeBtn = document.querySelector('.prescription-close-btn');
//   const viewPrescriptionBtns = document.querySelectorAll('.view-prescription-btn');
  
//   viewPrescriptionBtns.forEach(button => {
//     button.addEventListener('click', async () => {
//       const prescriptionId = button.getAttribute('data-id');
//       const prescriptionData = await fetchPrescriptionData(prescriptionId);
//       fillPrescriptionPopup(prescriptionData);
//       pres_popup.style.display = 'block';
//     });
//   });
  
//   closeBtn.onclick = () => {
//     pres_popup.style.display = 'none';
//   }
  
//   window.onclick = (event) => {
//     if (event.target == pres_popup) {
//       pres_popup.style.display = 'none';
//     }
//   }
  
//   document.querySelector('.download-btn').addEventListener('click', () => {
//     downloadPrescription();
//   });
  
  
//   document.querySelector('.add-medicine-btn').addEventListener('click', () => {
//     // Logic to open another popup to add more medicine entries
//   });
// });


function printPrescription() {
  window.print();
}
document.querySelector('.print-btn').addEventListener('click', () => {
  printPrescription();
});






