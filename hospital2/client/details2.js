
const getTrackingDataById = async (patientId) => {
  try {
    const trackingData = await electron.getTrackingData();
    const matchingData = trackingData.find((data) => data.id == patientId);

    if (!matchingData) {
      console.log(`Matching data not found for patientId: ${patientId}`);
      throw new Error('Matching patient data not found.');
    }

    return matchingData;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
};
let editPatientDetails;
// Function to display detailed patient information
const displayPatientDetails = async () => {
  const patientId = window.location.hash.substring(1);


  try {
    // Get tracking data for the specified patient
    const trackingData = await getTrackingDataById(patientId);
       if (!trackingData) {
      throw new Error('Patient data or cureType not available.');
    }

    const isAdmin = await electron.getUserRole();
    const cureTypeArray = JSON.parse(trackingData.cureType);
    const cureNameArray = JSON.parse(trackingData.cureName);
    const quanttyArray = JSON.parse(trackingData.quantty);
    const codeArray = JSON.parse(trackingData.code); 



    // Organize data by cureType
    const organizedData = {};
    cureTypeArray.forEach((type, index) => {
      if (!organizedData[type]) {
        organizedData[type] = [];
      }
      organizedData[type].push({
        name: cureNameArray[index],
        quantty: quanttyArray[index],
        code: codeArray[index], 
      });
    });
    

    
    // Display the detailed information in the container
    patientDetailsContainer.innerHTML = `
          <button onclick="printPatientDetails()">Print</button>
      ${isAdmin ? '<button id="red" onclick="deletePatientDetails()">Delete</button>' : ''}
      ${isAdmin ? '<button onclick="editPatientDetails()">Edit</button>' : ''}

    <div class="container">
    <p><span>${trackingData.date}</span></p>

      <div class="patient-details">
        <div class="left-column">
          <p> اسم الطبيب:<span>${trackingData.doctorName}</span></p>
          <p>اسم المريض: <span>${trackingData.patientName}</span></p>
          <p> دكتور التخدير: <span>${trackingData.anesthesiaDoctor}</span></p>
         <p>  التمريض: <span>${trackingData.nursing}</span></p>
           <p>الاجهزة:
          <span>${trackingData.devices}</span></p>
        </div>
        <div class="right-column">
        <p>  رقم التذكرة: <span>${trackingData.ticketNumber}</span></p>
<p>  غرفة العمليات: <span>${trackingData.operationRoomNumber}</span></p>
          <p>  تصنيف العملية: <span>${trackingData.operationCategory}</span></p>
           <p>نوع العملية: <span>${trackingData.operationType}</span></p>
          <p>زمن العملية: <span>${trackingData.operationTime}</span></p>
        </div>
      </div>
      ${Object.keys(organizedData).map(type => `
        <table border="1">
          <tr>
            <th><span>${type}</span></th>
            <th>الكود</th> 
            <th>الكمية</th>
            <th>السعر</th>
          </tr>
          ${organizedData[type].map(item => `
            <tr>
              <td><span>${item.name}</span></td>
              <td><span>${item.code}</span></td> 
              <td><span>${item.quantty}</span></td>
              <td><span></span></td>
            </tr>
          `).join('')}
        </table>
      `).join('')}
      </div>
    `;
  } catch (error) {
      electron.messageMain('send-alert','error 40!')
    // Handle the error gracefully, e.g., display an error message to the user
    patientDetailsContainer.innerHTML = `<p>Error fetching patient details for patientId: ${patientId}</p>`;

  }
editPatientDetails = async () => {
  try {
    const patientId = window.location.hash.substring(1);

    // Get tracking data for the specified patient
    const trackingData = await getTrackingDataById(patientId);
    const cures = await electron.getAllCures();
  const cureTypeArray = JSON.parse(trackingData.cureType);
    const cureNameArray = JSON.parse(trackingData.cureName);
    const quanttyArray = JSON.parse(trackingData.quantty);
    const codeArray = JSON.parse(trackingData.code); 

    // Organize data by cureType
    const organizedData = {};
    cureTypeArray.forEach((type, index) => {
      if (!organizedData[type]) {
        organizedData[type] = [];
      }
      organizedData[type].push({
        nameA: cureNameArray[index],
        quantty: quanttyArray[index],
        code: codeArray[index], // Include the item code
      });
    });
    // Organize cures data similar to patient tracking information
    const organizedCures = {};
    cures.forEach((cure,index) => {
      if (!organizedCures[cure.type]) {
        organizedCures[cure.type] = [];
      }
      organizedCures[cure.type].push({
        ...organizedData,
         nameA: cureNameArray[index],
        quantty: quanttyArray[index],
        code: codeArray[index], // Include the item code
        id: cure.id,
        name: cure.name,
        stock: cure.stock,
      });
    });
    
    
 

    // Combine patient tracking information and cures data for display
    const combinedData = Object.assign({}, trackingData);
    combinedData.cures = organizedCures;
    

     patientDetailsContainer.innerHTML = `
      <form id="editForm">
        <!-- Add input fields for each piece of data -->
        <label for="doctorName">اسم الطبيب:</label>
        <input type="text" id="doctorName" value="${trackingData.doctorName}" required>
        <label for="patientName">اسم المريض:</label>
        <input type="text" id="patientName" value="${trackingData.patientName}" required>
        <label for="anesthesiaDoctor"> طبيب التخدير:</label>
        <input type="text" id="anesthesiaDoctor" value="${trackingData.anesthesiaDoctor}" required>
        <label for="nursing"> التمريض:</label>
        <input type="text" id="nursing" value="${trackingData.nursing}" required>
        <label for="operationRoomNumber"> رقم غرفة العمليات:</label>
        <input type="text" id="operationRoomNumber" value="${trackingData.operationRoomNumber}" required>
        <label for="ticketNumber"> تذكرة:</label>
        <input type="text" id="ticketNumber" value="${trackingData.ticketNumber}" required>
      
        <label for="operationCategory"> تصنيف العملية:</label>
        <input type="text" id="operationCategory" value="${trackingData.operationCategory}" required>
        <label for="operationTime">وقت العملية:</label>
        <input type="text" id="operationTime" value="${trackingData.operationTime}" required>
        <label for="operationType">نوع العملية:</label>
        <input type="text" id="operationType" value="${trackingData.operationType}" required>
        
        <div id="devices">
          <input type="checkbox" id="dialer" name="devices" value="دايليرمي">
          <label for="dialer">دايليرمي</label>
          
          <input type="checkbox" id="monitor" name="devices" value="مونيتور">
          <label for="monitor">مونيتور</label>
          
          <input type="checkbox" id="ventilator" name="devices" value="فنتيليتور">
          <label for="ventilator">فنتيليتور</label>
          
          <input type="checkbox" id="endoscope" name="devices" value="مناظير">
          <label for="endoscope">مناظير</label>
          
          <input type="checkbox" id="exhaust" name="devices" value="شفاط">
          <label for="exhaust">شفاط</label>
          
          <input type="checkbox" id="lightSource" name="devices" value="مصدر الإضاءة">
          <label for="lightSource">مصدر الإضاءة</label>
        </div>
      
         <div id="curesSection">
          ${Object.keys(combinedData.cures).map(type => `
         
            <table border="1" class="${trackingData.cureType.includes(type) ? 'existing' : 'non-existing'}">
              <tr>
                <th><span>${type}</span></th>
                <th>الكود</th> 
                <th>الكمية</th>
                <th>السعر</th>
                <th>اضافة</th>
              </tr>
              ${combinedData.cures[type].map(item => `
                   <p style=display:none>   ${id.push(item.id)}  <p>
                   <p style=display:none>   ${stock.push(item.stock)}  <p>
                   <p style=display:none>   ${quantty.push(item.quantty)}  <p>

                <tr>
                  <td><input disabled  type="text" value="${item.name}"></td>
                  <td><input type="text" value="${item.code || ''}"></td> 
                  <td><input class ='quantty' type="number" placeholder="${item.stock || ""}" min=${0} max=${item.stock} value="${item.quantty || ""}"></td>
                  <td><input disabled type="text" value=""></td>
                  <td><input type="checkbox" ${trackingData.cureType.includes(type) ? 'checked' : ''} name="deleteRow" value="delete"></td>
                </tr>
              `).join('')}
            </table>
          `).join('')}
        </div>
        
        <button type="button" onclick="savePatientDetails()">Save</button>
      </form>
    `;

    // Apply styles for existing and non-existing cures
    const existingTables = document.querySelectorAll('.existing');
    existingTables.forEach(table => {
      table.style.backgroundColor = 'lightsteelblue'; // Change to the desired color
    });

    const nonExistingTables = document.querySelectorAll('.non-existing');
    nonExistingTables.forEach(table => {
      table.style.backgroundColor = 'white'; // Change to the desired color
    });
  } catch (error) {
      electron.messageMain('send-alert','error editing the data!')
    // Handle the error gracefully, e.g., display an error message to the user
    patientDetailsContainer.innerHTML = `<p>Error editing patient details for patientId: ${patientId}</p>`;
  }
};

let id = []
let stock = []
let quantty =  []


function getSelectedDevices() {
  const deviceCheckboxes = document.querySelectorAll('input[name="devices"]:checked');
  const selectedDevices = Array.from(deviceCheckboxes).map((checkbox) => checkbox.value);
  return selectedDevices;
}
savePatientDetails = async () => {
  try {
    const patientId = window.location.hash.substring(1);

    // Retrieve the values from the input fields
    const updatedData = {
      doctorName: document.getElementById('doctorName').value,
      patientName: document.getElementById('patientName').value,
      anesthesiaDoctor: document.getElementById('anesthesiaDoctor').value,
      nursing: document.getElementById('nursing').value,
      ticketNumber: document.getElementById('ticketNumber').value,
      operationTime: document.getElementById('operationTime').value,
      operationCategory: document.getElementById('operationCategory').value,
      operationType: document.getElementById('operationType').value,
      operationRoomNumber: document.getElementById('operationRoomNumber').value,
      devices: getSelectedDevices().join(","),
    };

  // Retrieve the updated cure table data
    const updatedCureData = {};
    document.querySelectorAll('table').forEach(table => {
      const type = table.querySelector('th span').innerText;

      updatedCureData[type] = [];
      table.querySelectorAll('tr:not(:first-child)').forEach(row => {
        const cells = row.querySelectorAll('td');
        const name = cells[0].querySelector('input').value;
        const code = cells[1].querySelector('input').value;
        const quantty = cells[2].querySelector('input').value;
        const isSelected = cells[4].querySelector('input[type="checkbox" ]').checked;

        if (!isSelected) {
          // Skip rows marked for deletion
          return;
        }

        updatedCureData[type].push({ name, code, quantty });
      });
    });

    // Convert the cure data to arrays for JSON serialization
    const cureTypeArray = [];
    const cureNameArray = [];
    const quanttyArray = [];
    const codeArray = [];
    const cureIdArray = []; // New array to store cure IDs

    Object.keys(updatedCureData).forEach(type => {
      updatedCureData[type].forEach(item => {
        cureTypeArray.push(type);
        cureNameArray.push(item.name);
        quanttyArray.push(item.quantty);
        codeArray.push(item.code);
        cureIdArray.push(item.id); 
      });
    });

    updatedData.cureType = cureTypeArray;
    updatedData.cureName = cureNameArray;
    updatedData.quantty = quanttyArray;
    updatedData.code = codeArray;

// Iterate through updatedCureData and handle stock updates
for (let i = 0; i < id.length; i++) {
  const cureId = id[i];
  const newQuantty = parseInt(quanttyArray[i]);
  let  oldQuantty = parseInt(quantty[i]);

  // Validate that newQuantty is non-negative
  if (newQuantty < 0 || isNaN(newQuantty)) {
      electron.messageMain('send-alert','somthing went wrong!')
  } else {
    // Check if oldQuantty is available
    if (isNaN(oldQuantty)) {
        oldQuantty = 0 
    }

    const quanttyChange = newQuantty - oldQuantty;

    if (quanttyChange !== 0) {
      const oldStock = parseInt(stock[i]);
      let newStock;

      if (quanttyChange > 0) {
        // Quantity increased, decrease stock
        newStock = oldStock - quanttyChange;
      } else {
        // Quantity decreased, increase stock
        newStock = oldStock + Math.abs(quanttyChange);
      }

      if (newStock >= 0) {
        console.log(`Updating stock for cureId: ${cureId} to ${newStock}`);
        await window.electron.editCureQuantity(cureId, newStock);
        await window.electron.updateTrackingData(patientId, updatedData);
        window.location.href = `veiw.html`;
      } else {
        console.log(`Invalid operation for cureId: ${cureId}, not enough stock`);
      }
    }
  }
}
  } catch (error) {
    console.error('Error saving patient details:', error);
  }
};

};
const deletePatientDetails = async () => {
  const patientId = window.location.hash.substring(1);
  if (confirm('Are you sure you want to delete this patient record?')) {
    try {
      const isAdmin = await electron.getUserRole();

      if ( isAdmin) {
        const successMessage = await electron.deleteTrackingData(patientId);
window.location.href = `veiw.html#${patientId}`;
      } else {
        throw new Error('You do not have permission to delete tracking data.');
      }
    } catch (error) {
  electron.messageMain('send-alert','Error deleting patient details. Please try again.');
      // Handle the error gracefully, e.g., display an error message to the user
    }
  }
};


const printPatientDetails = () => {
  window.print();
};

document.addEventListener('DOMContentLoaded', displayPatientDetails);

   