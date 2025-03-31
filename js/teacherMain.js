import { common } from '../lang/en/messages.js';
import { teacherMain } from '../lang/en/messages.js';
import { errorMessages } from '../lang/en/messages.js';
import { commonEndpoints } from './endpoints.js';
class utils {
  static checkAuth(tokenEndpoint) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role || role !== "teacher") {
      console.log('No token or role found, redirecting to index.html');
      window.location.href = "index.html";
      return;
    }
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role })
    })
      .then(response => {
        if (!response.ok) {
          console.error('Error: Response not OK');
          window.location.href = "index.html";
          return;
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        window.location.href = "index.html";
      });
  }

  static checkAPIUsage() {
    fetch(`${commonEndpoints.singleAPIUsage}?token=${localStorage.getItem("token")}`, {
      method: "GET"
    })
      .then(response => {
        document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
        return response.json()
      })
      .then(data => {
        let apiCalls = document.getElementById("totalAPI");
        apiCalls.insertAdjacentText("beforeend", common.apiCallsRemaining);
        apiCalls.insertAdjacentText("beforeend", data.callsRemaining);
        if (data.limitReached) {
          apiCalls.insertAdjacentText("beforeend", common.maxAPIcalls);
        }
      })
      .catch(error => {
        console.log(error);
        utils.printError(error);
      })
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

  static setteacherMainStrings() {
    document.getElementById("welcomeTeacher").innerHTML = teacherMain.welcome;
    document.getElementById("dashboardDescription").innerHTML = teacherMain.dashboardDescription;
    document.getElementById("startSession").innerHTML = common.startSession;
    document.getElementById("continueSession").innerHTML = common.continueSession;
    document.getElementById("viewStats").innerHTML = common.viewStats;
    document.getElementById("logout").innerHTML = common.logout;
  }

  static buildTeacherMainPage(sessionEndpoint, statsEndpoint, logoutEndpoint) {
    const page = new teacherMainPage(sessionEndpoint, statsEndpoint, logoutEndpoint);
    document.getElementById("startSession").addEventListener("click", (e) => page.startSession(e));
    document.getElementById("continueSession").addEventListener("click", (e) => page.continueSession(e));
    document.getElementById("viewStats").addEventListener("click", (e) => document.location.href = "teacherStats.html");
    document.getElementById("logout").addEventListener("click", (e) => page.logout(e));
  }
}

class teacherMainPage {
  constructor(sessionEndpoint, statsEndpoint, logoutEndpoint) {
    this.sessionEndpoint = sessionEndpoint;
    this.statsEndpoint = statsEndpoint;
    this.logoutEndpoint = logoutEndpoint;
  }

  startSession(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    fetch(this.sessionEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("sessionCode", data.sessionCode);
        window.location.href = `teacherSession.html?sessionId=${data.sessionId}`;
      })
      .catch((error) => {
        console.error('Error:', error);
        utils.printError(`${errorMessages.startSessionError} ${error.message}`);
      });
  }

  continueSession(event) {
    event.preventDefault();
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      window.location.href = `teacherSession.html?sessionId=${sessionId}`;
    } else {
      utils.printError(errorMessages.noSessionFound);
    }
  }

  logout(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    fetch(this.logoutEndpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(`${errorMessages.logoutFailed} ${response.status} ${data.message || 'Unknown error'}`);
          });
        }
        return response.json();
      })
      .then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "index.html";
      })
      .catch(error => {
        console.error('Error:', error);
        const errorMessage = error.message.includes("Status:")
          ? error.message
          : `${errorMessages.logoutError} Network error or no response.`;
        utils.printError(errorMessage);
      });
  }
}

utils.checkAuth('https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/checktoken');
utils.setteacherMainStrings();
utils.buildTeacherMainPage('https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/createsession', '/viewStats', 'https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/logout');
