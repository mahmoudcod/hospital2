let currentPage = 1;
let isPaginationMode = true; // Variable to track current mode

const rowsPerPage = 5; // Number of rows to display per page

document.addEventListener('DOMContentLoaded', async () => {
  // Function to display cure data
  async function displayCure() {
    try {
      const cures = await electron.getTrackingData();
      const display = document.getElementsByClassName('display')[0];
      display.innerHTML = ''; // Clear previous data

      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;

      const tables = {};

      cures.slice(startIndex, endIndex).forEach(cure => {
        const cureType = JSON.parse(cure.cureType);
        const cureNames = JSON.parse(cure.cureName);
        const codes = JSON.parse(cure.code);
        const quantities = JSON.parse(cure.quantty);
        const date = cure.date;
        const userName = cure.username;

        cureType.forEach((type, index) => {
          if (!tables[type]) {
            const table = document.createElement('table');
            tables[type] = table;

            const headerRow = table.insertRow();
            const headerCellName = headerRow.insertCell(0);
            const headerCellCode = headerRow.insertCell(1);
            const headerCellQuantity = headerRow.insertCell(2);
            const headerCellUserName = headerRow.insertCell(3);

            headerCellName.textContent = type;
            headerCellCode.textContent = 'Code';
            headerCellQuantity.textContent = 'Quantity';
            headerCellUserName.textContent = 'Username';

            display.appendChild(table);
          }

          const row = tables[type].insertRow();
          const dataCellName = row.insertCell(0);
          const dataCellCode = row.insertCell(1);
          const dataCellQuantity = row.insertCell(2);
          const dataCellUserName = row.insertCell(3);

          dataCellName.textContent = cureNames[index];
          dataCellCode.textContent = codes[index];
          dataCellQuantity.textContent = quantities[index];
          dataCellUserName.textContent = userName;
          row.setAttribute('data-date', date); // Add a data attribute for date
        });
      });

      if (isPaginationMode) {
        const totalPages = Math.ceil(cures.length / rowsPerPage);
        displayPaginationButtons(currentPage, totalPages);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Function to filter by date
  function filterByDate() {
    const inputDate = document.getElementById('filterDate').value;
    const inputDateFormat = new Date(inputDate);

    const rows = document.querySelectorAll('[data-date]');
    rows.forEach(row => {
      const rowDate = new Date(row.getAttribute('data-date'));
      // Check if the date part of both dates is the same
      if (rowDate.toDateString() === inputDateFormat.toDateString()) {
        row.style.display = ''; // Show the row if it matches the input date
      } else {
        row.style.display = 'none'; // Hide the row if it doesn't match the input date
      }
    });
  }

  // Function to filter by cure name
  function filterByCureName() {
    const inputCureName = document.getElementById('filterCureName').value.toLowerCase();
    const rows = document.querySelectorAll('[data-date]');
    rows.forEach(row => {
      const cureName = row.cells[0].textContent.toLowerCase(); // Get cure name from the first cell
      if (cureName.includes(inputCureName)) {
        row.style.display = ''; // Show the row if it matches the input cure name
      } else {
        row.style.display = 'none'; // Hide the row if it doesn't match the input cure name
      }
    });
  }

  // Function to go to a specific page
  function goToPage(page) {
    currentPage = page;
    displayCure();
  }

  // Function to toggle between pagination and filtering modes
  function toggleMode() {
    isPaginationMode = !isPaginationMode;
    displayCure();
  }

  // Function to display pagination buttons
// Function to display pagination buttons
function displayPaginationButtons(currentPage, totalPages) {
  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add('pagination');

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    goToPage(currentPage - 1);
  });
  paginationContainer.appendChild(prevButton);

  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(pageIndicator);

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    goToPage(currentPage + 1);
  });
  paginationContainer.appendChild(nextButton);

  const trackingDataContainer = document.getElementById('trackingDataContainer');

  // Remove existing pagination container before adding a new one
  const existingPaginationContainer = trackingDataContainer.querySelector('.pagination');
  if (existingPaginationContainer) {
    trackingDataContainer.removeChild(existingPaginationContainer);
  }

  trackingDataContainer.appendChild(paginationContainer);
}


  // Add event listeners
  document.getElementById('filterCureName').addEventListener('keyup', filterByCureName);

  // Call displayCure to initially display cures
  displayCure();
});
