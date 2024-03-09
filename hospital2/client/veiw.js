document.addEventListener('DOMContentLoaded', () => {
  const trackingDataContainer = document.getElementById('trackingDataContainer');
  const searchInput = document.getElementById('searchInput');
  const selectedMonth = document.getElementById('monthSelect');
  const itemsPerPage = 15; // Adjust the number of items per page as needed
  let currentPage = 1;

 const createPatientLink = (data) => {
  const patientLinkContainer = document.createElement('div');
  const patientLink = document.createElement('h3');
  const patientId = data.id;

  patientLink.textContent = `${data.doctorName} -${data.nursing} -${data.operationType}  - ${data.patientName}`;
  patientLink.id = patientId;
  patientLink.classList.add('patient-link');
   const userInfoContainer = document.createElement('div');
  userInfoContainer.classList.add('user-info-container');
  const userSpan = document.createElement('span');
  userSpan.textContent = `Added by: ${data.username}`;
  userSpan.classList.add('user-info');
  patientLink.appendChild(userSpan);
    patientLinkContainer.appendChild(patientLink);
  patientLinkContainer.appendChild(userInfoContainer);

  patientLink.addEventListener('click', () => {
    window.location.href = `details2.html#${patientId}`;
  });

 return patientLinkContainer;
};


  const populateMonthSelect = () => {
    const months = [
      'Select Month', 'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];

    months.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = month.toLowerCase();
      option.textContent = month;
      selectedMonth.appendChild(option);
    });
  };

  const displayPaginationButtons = (totalPages) => {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination');

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.addEventListener('click', () => {
        currentPage = i;
        displayTrackingData();
      });
      paginationContainer.appendChild(button);
    }

    trackingDataContainer.appendChild(paginationContainer);
  };

  const displayTrackingData = async () => {
    try {
      const trackingData = await electron.getTrackingData();

      trackingDataContainer.innerHTML = '';

      if (!Array.isArray(trackingData)) {
        trackingDataContainer.innerHTML = '<p>Invalid tracking data format.</p>';
        return;
      }

      if (trackingData.length === 0) {
        trackingDataContainer.innerHTML = '<p>No tracking data available.</p>';
        return;
      }

      const searchTerm = searchInput.value.toLowerCase();
      const selectedMonthValue = selectedMonth.value.toLowerCase();

    if (selectedMonthValue === 'select month') {
      // If "Select Month" is chosen, display all data without filtering by month
      const filteredData = trackingData.filter((data) => {
        return (
          data.ticketNumber.toLowerCase().includes(searchTerm) ||
          data.patientName.toLowerCase().includes(searchTerm) ||
          data.nursing.toLowerCase().includes(searchTerm)
        );
      });

      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      if (totalPages > 1) {
        // Display navigation buttons
        displayPaginationButtons(totalPages);
      }

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentData = filteredData.slice(startIndex, endIndex);

      if (currentData.length === 0) {
        trackingDataContainer.innerHTML = '<p>No matching results on this page.</p>';
        return;
      }

      currentData.forEach((data) => {
        const patientLink = createPatientLink(data);
        trackingDataContainer.appendChild(patientLink);
      });
    } else {
      // Filter data based on both the selected month and the search term
     const filteredData = trackingData.filter((data) => {
      const dataMonth = new Date(data.date).toLocaleString('en-US', { month: 'long' }).toLowerCase();
      return (
        (data.ticketNumber.toLowerCase().includes(searchTerm) ||
        data.patientName.toLowerCase().includes(searchTerm) ||
        data.nursing.toLowerCase().includes(searchTerm)) &&
        dataMonth.includes(selectedMonthValue)
      );
    });

    // Count occurrences of nursing in the filtered data
    const nursingCount = {};
    filteredData.forEach((data) => {
      const nursing = data.nursing.toLowerCase();
      nursingCount[nursing] = (nursingCount[nursing] || 0) + 1;
    });

   const displayNursingDetails = (nursing) => {
  window.location.href = `nursing.html?nursing=${encodeURIComponent(nursing)}`;
};

// Display nursing count
const nursingCountContainer = document.createElement('div');
nursingCountContainer.classList.add('nursing-count-container');
trackingDataContainer.appendChild(nursingCountContainer);

for (const [nursing, count] of Object.entries(nursingCount)) {
  const nursingCountItem = document.createElement('p');
  nursingCountItem.textContent = `${nursing}: ${count}`;
  nursingCountItem.classList.add('nursing-count-item');
  nursingCountContainer.appendChild(nursingCountItem);

  // Add click event listener to each nursing count item
  nursingCountItem.addEventListener('click', () => {
    displayNursingDetails(nursing);
  });
}



      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      if (totalPages > 1) {
        // Display navigation buttons
        displayPaginationButtons(totalPages);
      }

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentData = filteredData.slice(startIndex, endIndex);

      if (currentData.length === 0) {
        trackingDataContainer.innerHTML = '<p>No matching results on this page.</p>';
        return;
      }

      currentData.forEach((data) => {
        const patientLink = createPatientLink(data);
        trackingDataContainer.appendChild(patientLink);
      });
    }
   } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  searchInput.addEventListener('input', () => {
    currentPage = 1; // Reset to the first page when searching
    displayTrackingData();
  });

  selectedMonth.addEventListener('change', () => {
    currentPage = 1; // Reset to the first page when changing the month
    displayTrackingData();
  });

  // Populate the month select dropdown
  populateMonthSelect();

  displayTrackingData();
});
