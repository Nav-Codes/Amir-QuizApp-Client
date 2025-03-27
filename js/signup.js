import { common } from "../lang/en/messages.js";
import { signup } from "../lang/en/messages.js";

class utils {
  static setUserFacingString() {
    document.getElementById("welcome").innerHTML = signup.welcome;
    document.getElementById("formName").innerHTML = signup.formName;
    document.getElementById("formEmail").innerHTML = signup.formEmail;
    document.getElementById("formPassword").innerHTML = signup.formPassword;
    document.getElementById("formConfirmPassword").innerHTML = signup.formConfirmPassword;
    document.getElementById("signup").innerHTML = common.signup;
    document.getElementById("login").innerHTML = common.login;
    document.getElementById("home").innerHTML = common.home;
  }
  static buildSignupPage(postEndpoint) {
    const page = new signupPage(postEndpoint);
    signupPage.submissionLogic(postEndpoint);
  }
}

class signupPage {
  constructor(postEndpoint) {
    this.postEndpoint = postEndpoint;
  }
  static submissionLogic(postEndpoint) {
    document.addEventListener("DOMContentLoaded", () => {
      const signupForm = document.getElementById("signupForm");

      signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
          this.printError(signup.passwordMismatch);
          return;
        }

        try {
          const response = await fetch(postEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem("token", data.token);
            // localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.user.role);
            if (data.user.role === "student") {
              window.location.href = "studentMain.html";
            } else {
              this.printError(signup.unknownRole);
            }
          } else {
            this.printError(signup.signupFailed + data.message);
          }
        } catch (error) {
          console.error("Error:", error);
          this.printError(signup.signupFailed + error);
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
utils.buildSignupPage("https://dolphin-app-nxbr6.ondigitalocean.app/signup");