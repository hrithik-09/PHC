
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
    if (brandName.length > 1) {
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
  };

  createEntryRow(); // Create the first entry row
});








