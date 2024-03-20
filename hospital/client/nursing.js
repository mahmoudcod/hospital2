document.addEventListener('DOMContentLoaded', () => {
  const nursingDetailsContainer = document.getElementById('nursingDetailsContainer');
    const printButton = document.getElementById('printButton');
  const getNursingDetails = async (nursing) => {
    try {
      const trackingData = await electron.getTrackingData();

      const filteredData = trackingData.filter((data) => data.nursing.toLowerCase() === nursing.toLowerCase());

      if (filteredData.length === 0) {
        nursingDetailsContainer.innerHTML = '<p>No data available for this nursing.</p>';
        return;
      }

      filteredData.forEach((data) => {
        const patientLink = createPatientLink(data);
        nursingDetailsContainer.appendChild(patientLink);
      });
    } catch (error) {
      console.error('Error fetching nursing details:', error);
    }
  };

  const createPatientLink = (data) => {
    const patientLinkContainer = document.createElement('div');
    const patientLink = document.createElement('h3');
    const patientId = data.id;

    patientLink.innerHTML = ` <p>دكتور: ${data.doctorName}</p>          <p> التمريض: ${data.nursing} </p>              <p> نوع العملية: ${data.operationType} </p>                      <small> ${data.date}</small>`;
    patientLink.id = patientId;
    patientLink.classList.add('patient-link');

    patientLinkContainer.appendChild(patientLink);


    patientLink.addEventListener('click', () => {
      // You can add a navigation to a detailed view if needed
      // window.location.href = `details2.html#${patientId}`;
    });

    return patientLinkContainer;
  };

  printButton.addEventListener('click', () => {
    printNursingDetails();
  });

  const printNursingDetails = () => {
    // Open the print dialog for the nursing details container
    window.print();
  };

  // Extract nursing name from the URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const nursingName = urlParams.get('nursing');

  if (nursingName) {
    // Display nursing details for the specified nursing
    getNursingDetails(nursingName);
  } else {
    nursingDetailsContainer.innerHTML = '<p>No nursing specified.</p>';
  }
});
