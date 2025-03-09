import { messages } from '../lang/en/messages.js';

class utils {
  static setUserFacingString() {
    document.getElementById("welcome").innerHTML = messages.welcome;
    document.getElementById("redirectLoginSignup").innerHTML = messages.redirectLoginSignup;
    document.getElementById("login").innerHTML = messages.login;
    document.getElementById("signup").innerHTML = messages.signup;
  }
}
utils.setUserFacingString();