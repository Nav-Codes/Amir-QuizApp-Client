import { common } from '../lang/en/messages.js';
import { logout } from '../lang/en/messages.js';

class utils {
  static setUserFacingString() {
    document.getElementById("logoutMessage").innerHTML = logout.logoutMessage;
    document.getElementById("loginAgain").innerHTML = logout.loginAgain;
    document.getElementById("home").innerHTML = common.home
  }
  static buildLoginPage(postEndpoint) {
    const page = new loginPage(postEndpoint);
    loginPage.submissionLogic();
  }
}

utils.setUserFacingString();