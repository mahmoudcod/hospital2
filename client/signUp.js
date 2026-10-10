document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const errorContainer = document.getElementById('error-container');

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorContainer.innerHTML = ''; // Clear previous errors

    const username = signupForm.username.value;
    const password = signupForm.password.value;

    try {
      await window.electron.signUp(username, password);
      alert('User signed up successfully!');
      // You can redirect the user or perform any other actions here
    } catch (error) {
      showError(error);
    }
    clearForm()
  });

  function clearForm(){
    signupForm.reset()
  }

  function showError(message) {
    const errorElement = document.createElement('p');
    errorElement.textContent = message;
    errorContainer.appendChild(errorElement);
  }
});
