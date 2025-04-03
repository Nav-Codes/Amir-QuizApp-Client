import { common } from '../lang/en/messages.js';
import { home } from '../lang/en/messages.js';

class utils {
  static setUserFacingString() {
    document.getElementById("welcome").innerHTML = home.welcome;
    document.getElementById("redirectLoginSignup").innerHTML = home.redirectLoginSignup;
    document.getElementById("login").innerHTML = common.login;
    document.getElementById("signup").innerHTML = common.signup;
    document.getElementById("description").innerHTML = home.description;
    const params = new URLSearchParams(window.location.search);
    if (params.has("error")) {
        const errorCode = params.get("error");
        console.error(`Error: ${errorCode}`);
        document.getElementById("statusCode").innerHTML = `${common.statusCode}${errorCode}`;
    }
  }
}
utils.setUserFacingString();