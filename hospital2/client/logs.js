async function displayCure() {
  try {
    const cures = await electron.getTrackingData();
    console.log(cures);

    const display = document.getElementsByClassName('display')[0];

    const tables = {};

    cures.forEach(cure => {
      
      const cureType = JSON.parse(cure.cureType);
      const cureNames = JSON.parse(cure.cureName);
      const codes = JSON.parse(cure.code);
      const quantities = JSON.parse(cure.quantty);
      const date = cure.date;
      const userName = cure.username

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
  } catch (error) {
    console.error(error);
  }
}

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

displayCure();
