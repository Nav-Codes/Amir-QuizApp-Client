// FOR NAV: DELETE ALL THIS CODE LATER WHEN YOU WORK ON IT
// THIS WAS ONLY TO TEST BRYANS CODE

function logout(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    fetch('https://king-prawn-app-7exk8.ondigitalocean.app/LoginStuff/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(response => { 
        if (response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "index.html";
        }
        else {
          this.printError(`${errorMessages.logoutFailed} ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        this.printError(`${errorMessages.logoutError} ${error.message}`);
      });
  }

document.getElementById("logout").addEventListener("click", (e) => logout(e));
