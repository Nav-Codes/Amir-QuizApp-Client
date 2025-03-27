import { common } from '../lang/en/messages.js';
import { login } from '../lang/en/messages.js';

class utils {
  static setUserFacingString() {
    document.getElementById("welcome").innerHTML = login.welcome;
    document.getElementById("formEmail").innerHTML = login.formEmail;
    document.getElementById("formPassword").innerHTML = login.formPassword;
    document.getElementById("login").innerHTML = common.login;
    document.getElementById("signup").innerHTML = common.signup;
    document.getElementById("home").innerHTML = common.home;
  }
  static buildLoginPage(postEndpoint) {
    const page = new loginPage(postEndpoint);
    loginPage.submissionLogic(postEndpoint);
  }
}

class loginPage {
  constructor(postEndpoint) {
    this.postEndpoint = postEndpoint;
  }
  static submissionLogic(postEndpoint) {
    document.addEventListener("DOMContentLoaded", () => {
      const loginForm = document.getElementById("loginForm");

      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
          const response = await fetch(postEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.role === "teacher") {
              window.location.href = "teacherMain.html";
            } else if (data.user.role === "student") {
              window.location.href = "studentMain.html";
            } else {
              this.printError(login.unknownRole);
            }
          } else {
            this.printError(login.loginFailed + data.message);
          }
        } catch (error) {
          console.error("Error:", error);
          this.printError(login.loginFailed + error);
        }
      });
    });
  }

  static printError(message) {
    const errorDiv = document.getElementById("error");
    if (message) {
      errorDiv.innerHTML = message;
      errorDiv.classList.add("show"); 
    } else {
      errorDiv.classList.remove("show"); 
    }
  }
  
}

utils.setUserFacingString();
utils.buildLoginPage("https://dolphin-app-nxbr6.ondigitalocean.app/LoginStuff/login");