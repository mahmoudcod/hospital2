// formSubmission.js
// Arrays to store cure types, names, codes, and quantities globally
let cureTypes = [];
let cureNames = [];
let cureCodes = [];
let cureQuantities = [];
let initializStock 
// Helper function to get selected devices
function getSelectedDevices() {
  const deviceCheckboxes = document.querySelectorAll('input[name="devices"]:checked');
  const selectedDevices = Array.from(deviceCheckboxes).map((checkbox) => checkbox.value);
  return selectedDevices;
}

// Function to fetch and display cure data in tables by type
async function displayCureData() {
  try {
    // Call the getAllCures function from the context bridge
    const cures = await window.electron.getAllCures();

    // Group cures by type
    const curesByType = {};
    cures.forEach((cure) => {
      const type = cure.type;
      if (!curesByType[type]) {
        curesByType[type] = [];
      }
      curesByType[type].push(cure);
    });
 
    // Get the container element where tables will be appended
    const container = document.getElementById('cureTablesContainer');
    container.innerHTML = ''; // Clear existing content

    // Create tables for each cure type
    for (const type in curesByType) {
      const typeTable = document.createElement('table');
      typeTable.id = `table${type}`; // Set an id for the table

      // Create table headers
      const headerRow = typeTable.insertRow(0);
      const headers = ['Select', type, 'Code', 'Quantity']; // Added 'Select' header
      headers.forEach((headerText, index) => {
        const cell = headerRow.insertCell(index);
        cell.textContent = headerText;
      });

      // Fill the table with cure data for the current type
  // Fill the table with cure data for the current type
curesByType[type].forEach((cure, rowIndex) => {
  const row = typeTable.insertRow(rowIndex + 1);
  row.dataset.type = cure.name;
  row.dataset.name = type;
  row.dataset.cureId = cure.id; // Assuming cure has an 'id' property
  row.dataset.stock = cure.stock; // Assuming cure has a 'stock' property

  // Checkbox for row selection
const cellCheckbox = row.insertCell(0);
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.addEventListener('change', function () {
  toggleInputFields(row, checkbox.checked);
  // Remove the call to updateDataArrays(); // Remove this line
});
cellCheckbox.appendChild(checkbox);

  // Create the cell for the cure name
  const cellName = row.insertCell(1);
  cellName.textContent = cure.name;

  // Create input for code (initially hidden)
  const cellCode = row.insertCell(2);
  const inputCode = document.createElement('input');
  inputCode.type = 'text';
  inputCode.placeholder = 'Enter Code';
  inputCode.classList.add('code-input');
  inputCode.addEventListener('input', function () {
    cureCodes[rowIndex] = inputCode.value;
  });
  cellCode.appendChild(inputCode);
  inputCode.style.display = 'none'; // Initially hide the code input

// Create input for quantity (initially hidden)
const cellQuantity = row.insertCell(3);
const inputQuantity = document.createElement('input');
inputQuantity.type = 'number';
inputQuantity.placeholder = `Stock ${cure.stock}`;
inputQuantity.classList.add('quantity-input');
inputQuantity.addEventListener('input', function () {
  const enteredValue = parseInt(inputQuantity.value, 10);
  const stock = cure.stock;

  if (!isNaN(enteredValue) && enteredValue >= 0 && enteredValue <= stock) {
    cureQuantities[rowIndex] = enteredValue;
  } else {
    // Display an error message or handle the input validation as needed
    electron.messageMain('send-alert',`Please enter a valid quantity between 0 and ${stock}`);
    // Reset the input value to the previous valid value
    inputQuantity.value = cureQuantities[rowIndex] || '';
  }
});

cellQuantity.appendChild(inputQuantity);
inputQuantity.style.display = 'none'; // Initially hide the quantity input
});

      // Append the table to the container
      container.appendChild(typeTable);
    }
  } catch (error) {
    console.error('Error displaying cure data:', error);
  }
}

const user = window.electron.getUserInfo();
// Function to toggle input fields based on checkbox state
function toggleInputFields(row, isChecked) {
  const codeInput = row.querySelector('.code-input');
  const quantityInput = row.querySelector('.quantity-input');

  if (isChecked) {
    // If checkbox is checked, show the code and quantity inputs
    codeInput.style.display = 'inline-block';
    quantityInput.style.display = 'inline-block';
    quantityInput.setAttribute('required', 'required'); 
  } else {
    // If checkbox is unchecked, hide the code and quantity inputs
    codeInput.style.display = 'none';
    quantityInput.style.display = 'none';
    quantityInput.removeAttribute('required'); // Remove required attribute
  }
}

// Event listener for form submission
document.getElementById('inputForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevent the default form submission
    // Update the data arrays based on selected rows
    updateDataArrays();

    // Update the stock using electron.editCureQuantity
    for (let i = 0; i < cureQuantities.length; i++) {
      const cureId = document.querySelector(`#cureTablesContainer tr[data-type="${cureNames[i]}"][data-name="${cureTypes[i]}"]`).dataset.cureId;
      const newStock = parseInt(document.querySelector(`#cureTablesContainer tr[data-type="${cureNames[i]}"][data-name="${cureTypes[i]}"]`).dataset.stock, 10) - cureQuantities[i];
      try {
        // Call the editCureQuantity function from the context bridge
        await window.electron.editCureQuantity(cureId, newStock);
      } catch (error) {
        console.error('Error editing cure quantity:', error);
      }
    }


  const formData = {
    code: cureCodes,
    doctorName: document.getElementById('doctorName').value,
    patientName: document.getElementById('patientName').value,
    anesthesiaDoctor: document.getElementById('anesthesiaDoctor').value,
    nursing: document.getElementById('nursing').value,
    ticketNumber: document.getElementById('ticketNumber').value,
    operationTime: document.getElementById('operationTime').value,
    operationCategory: document.getElementById('operationCategory').value,
    operationType: document.getElementById('operationType').value,
    operationRoomNumber: document.getElementById('operationRoomNumber').value,
    username: user.username,
    devices: getSelectedDevices(),
    cureTypes: cureTypes,
    cureNames: cureNames,
    quantty: cureQuantities,
  };

  try {



 
    // Call the addTrackingData function from the context bridge
    const result = await window.electron.addTrackingData(formData, cureTypes, cureNames);
    // Clear the form fields after submitting
    document.getElementById('inputForm').reset();

    await displayCureData();
  } catch (error) {
    console.error('Error submitting form:', error);
  }
  const formIds = await window.electron.getTrackingData();

  // Get the ID of the last submitted form (assuming it's the latest in the array)
  const formId = formIds[formIds.length - 1];
  // window.location.href = `details2.html#${formId.id}`;

  cureTypes = [];
  cureNames = [];
  cureCodes = [];
  cureQuantities = [];
         // Update the stock using electron.editCureQuantity
      
});

document.getElementById('cureTablesContainer').addEventListener('change', function (event) {
  const selectedCheckbox = event.target;
  const selectedRow = selectedCheckbox.closest('tr');
  if (selectedRow) {
    const selectedType = selectedRow.dataset.type;
    const selectedName = selectedRow.dataset.name;


    // Update the data arrays based on the selected rows
    updateDataArrays();
  }
});

// Function to update data arrays based on selected rows
async function updateDataArrays() {
  // Clear the arrays
  cureTypes = [];
  cureNames = [];
  cureCodes = [];
  cureQuantities = [];

  // Iterate through rows to populate arrays
  const allRows = document.querySelectorAll('#cureTablesContainer tr');
  for (const row of allRows) {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked) {
      const type = row.dataset.name;
      const name = row.dataset.type;

      // Use unique input elements for each row
      const codeInput = row.querySelector('.code-input');
      const quantityInput = row.querySelector('.quantity-input');

      const code = codeInput.value;
      let quantity = parseInt(quantityInput.value, 10);

      cureTypes.push(type);
      cureNames.push(name);
      cureCodes.push(code);
      cureQuantities.push(quantity);
    }
  }
}

// Call the updateDataArrays function initially to set the initial state
updateDataArrays();

// Call the displayCureData function when the page loads
window.onload = displayCureData;