
document.addEventListener('DOMContentLoaded', async () => {
  const cureNameInput = document.getElementById('cureName');
  const cureTypeSelect = document.getElementById('cureType');
  const cureQuantityInput = document.getElementById('cureQuantty');
  const saveButton = document.getElementById('saveButton');
  const tablesContainer = document.getElementById('tablesContainer');
  let editingCureId = null; // Variable to store the ID of the cure being edited


let oldVal

  displayDataTables(await electron.getAllCures());

  // Function to display data in tables
  function displayDataTables(allCures) {
    // Clear previous tables
    tablesContainer.innerHTML = '';
    // Create tables based on cure type
    const cureTypes = Array.from(new Set(allCures.map(cure => cure.type)));
    cureTypes.forEach(cureType => {
      const cureTypeCures = allCures.filter(cure => cure.type === cureType);

      if (cureTypeCures.length > 0) {
        const table = document.createElement('table');
        table.innerHTML = `<thead><tr><th>${cureType}</th><th>stock</th><th>Action</th></tr></thead>`;
        const tbody = document.createElement('tbody');
 const isAdmin =  electron.getUserRole();
        cureTypeCures.forEach(cure => {
           oldVal  = cure.stock

          const row = document.createElement('tr');
          row.innerHTML = `
          <td>${cure.name}</td> <td>${cure.stock}</td><td>
           ${isAdmin ? `<button class="deleteButton" data-cure-id="${cure.id}">Delete</button> `: ""}
<button class="editButton" data-cure-id="${cure.id}">Edit</button></td>
          `;
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tablesContainer.appendChild(table);
      }
    });

    // Add click event listener for delete buttons
    const deleteButtons = document.querySelectorAll('.deleteButton');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const cureId = button.getAttribute('data-cure-id');
        if (confirm('Are you sure you want to delete this cure?')) { 
          try {
            await electron.deleteCure(cureId);
            // Update the displayed data after deletion
            displayDataTables(await electron.getAllCures());
           electron.messageMain('send-alert','Cure deleted successfully');
          } catch (error) {
            console.error(error);
           electron.messageMain('send-alert','Error deleting cure: ' + error.message);
          }
        }
      });
    });
// Add click event listener for edit buttons
const editButtons = document.querySelectorAll('.editButton');
editButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const cureId = button.getAttribute('data-cure-id');

    const cureToEdit = allCures.find(cure => cure.id == cureId);

    if (!cureToEdit) {
      console.error(`Cure not found for editing with ID: ${cureId}`);
      return;
    }

    // Log the cure data for debugging purposes
    console.log('Cure to edit:', cureToEdit);
    
    // Fill the input fields with the cure data for editing
    cureNameInput.value = cureToEdit.name || '';
    cureTypeSelect.value = cureToEdit.type || '';
    cureQuantityInput.value = cureToEdit.stock || '';
    
oldVal =  cureToEdit.stock
    // Check if the current user is an admin
    const isAdmin = await electron.getUserRole();

    // Disable cureNameInput and cureTypeSelect for non-admin users
    cureNameInput.disabled = !isAdmin;
    cureTypeSelect.disabled = !isAdmin;

// Check if the user is not an admin and the stock value is being decreased
// if (!isAdmin) {
//   const currentStockValue = parseInt(cureQuantityInput.value, 10) || 0;
//   const newStockValue = cureToEdit.stock;

//   if (currentStockValue < newStockValue) {
//    electron.messageMain('send-alert','Non-admin users are not allowed to decrease the stock value.');
//     // Reset the input field to the current stock value
//     cureQuantityInput.value = cureToEdit.stock || '';
//     return;
//   }
// }



    // Set the editingCureId to the current cure being edited
    editingCureId = cureId;
  });
});


  }

    saveButton.addEventListener('click', async () => {
    // Validate input fields
    if (cureNameInput.value.trim() === '' || cureTypeSelect.value.trim() === '' || cureQuantityInput.value.trim() === '') {
     electron.messageMain('send-alert','Please fill out all fields.');
      return;
    }

    const isAdmin = await electron.getUserRole();

    try {
      if (!isAdmin && editingCureId) {
        // If not admin and editing, only allow increasing the quantity
        if (parseInt(cureQuantityInput.value) < oldVal) {
         electron.messageMain('send-alert','Non-admin users are not allowed to decrease quantity.');
         location.reload()
          return;
        }
      }

      const cureData = {
        name: cureNameInput.value,
        type: cureTypeSelect.value,
        stock: cureQuantityInput.value,
        userId: electron.getUserID(),
        date: new Date().toISOString(),
      };

      if (editingCureId) {
        // If editing, call the editCure function instead of addCure
        await electron.editCure(editingCureId, cureData.name, cureData.type, cureData.stock, cureData.userId, cureData.date);
       electron.messageMain('send-alert','Cure edited successfully');
        editingCureId = null; // Reset the editingCureId after editing is complete
        location.reload()
      } else {
        // If not editing, call the addCure function
        await electron.addCure(cureData.name, cureData.type, cureData.stock, cureData.userId, cureData.date);
       electron.messageMain('send-alert','Cure added successfully');
       
      }

      // Update the displayed data after submitting
      displayDataTables(await electron.getAllCures());

      // Clear input fields after submission
      cureNameInput.value = '';
      cureQuantityInput.value = '';
    } catch (error) {
      console.error(error);
     electron.messageMain('send-alert','Error adding/editing cure: ' + error.message);
    }
  });
});
