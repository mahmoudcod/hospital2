

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
const displayPatientDetails = async () => {
  const patientId = window.location.hash.substring(1);

  try {
    // Get tracking data for the specified patient
    const trackingData = await getTrackingDataById(patientId);
    if (!trackingData) {
      throw new Error('Patient data not available.');
    }

    const isAdmin = await electron.getUserRole();
    const cureTypeArray = JSON.parse(trackingData.cureType);
    const cureNameArray = JSON.parse(trackingData.cureName);
    const quanttyArray = JSON.parse(trackingData.quantty);
    const codeArray = JSON.parse(trackingData.code);

    const organizedData = {};

    // Organize data by cureType if cureTypeArray is not empty
    if (cureTypeArray.length > 0) {
      cureTypeArray.forEach((type, index) => {
        if (!organizedData[type]) {
          organizedData[type] = [];
        }
        organizedData[type].push({
          name: cureNameArray[index],
          quantty: quanttyArray[index],
          code: codeArray[index], // Include the item code
        });
      });
    }

    const patientDetailsContainer = document.getElementById('patientDetailsContainer');
    if (!patientDetailsContainer) {
      throw new Error('Patient details container not found.');
    }

    let tablesHTML = '';

    // Check if organizedData is empty before rendering the tables
    if (Object.keys(organizedData).length !== 0) {
      tablesHTML = Object.keys(organizedData).map(type => `
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
      `).join('');
    } else {
      // Handle the case where organizedData is empty
      tablesHTML = '<p>No organized data available.</p>';
    }

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
        ${tablesHTML}
      </div>
    `;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    // Handle the error gracefully, e.g., display an error message to the user
    patientDetailsContainer.innerHTML = `<p>Error fetching patient details for patientId: ${patientId}</p>`;
  }
};


 editPatientDetails = async () => {
  try {
    const patientId = window.location.hash.substring(1);

    // Get tracking data for the specified patient
    const trackingData = await getTrackingDataById(patientId);

    // Disable the edit button after clicking to prevent multiple clicks
    const editButton = document.querySelector('button[onclick="editPatientDetails()"]');
    if (editButton) {
      editButton.disabled = true;
    }

    // Replace the display container with input fields for editing
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

        <button type="button" onclick="savePatientDetails()">Save</button>
      </form>
    `;
  } catch (error) {
    console.error('Error editing patient details:', error);
    // Handle the error gracefully, e.g., display an error message to the user
    patientDetailsContainer.innerHTML = `<p>Error editing patient details for patientId: ${patientId}</p>`;
  }
};

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

    // Perform the save operation, e.g., using an electron API
    await window.electron.updateTrackingData(patientId, updatedData);

    // Optionally, you can redirect or update the UI after successful save
    window.location.href = `veiw.html`;
  } catch (error) {
    console.error('Error saving patient details:', error);
    // Handle the error gracefully, e.g., display an error message to the user
electron.messageMain('send-alert','Error saving patient details. Please try again.');
  }
};

const deletePatientDetails = async () => {
  const patientId = window.location.hash.substring(1);
  if (confirm('Are you sure you want to delete this patient record?')) {
    try {
      electron.messageMain('send-alert','sucsses!')
      const isAdmin = await electron.getUserRole();

      if ( isAdmin) {
        const successMessage = await electron.deleteTrackingData(patientId);
        
        // Optionally, you can redirect or update the UI after successful deletion
        // For example, redirecting to a different page:
        window.location.href = 'veiw.html';
      } else {
        throw new Error('You do not have permission to delete tracking data.');
      }
    } catch (error) {
      console.error('Error deleting patient details:', error);
      // Handle the error gracefully, e.g., display an error message to the user
  electron.messageMain('send-alert','Error deleting patient details. Please try again.');
    }
  }
};

const printPatientDetails = () => {
  window.print();
};
document.addEventListener('DOMContentLoaded', displayPatientDetails);
