import { common } from '../lang/en/messages.js';
import { teacherMain } from '../lang/en/messages.js';
import { errorMessages } from '../lang/en/messages.js';
class utils {
  static checkAuth(tokenEndpoint) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role || role !== "teacher") {
      window.location.href = "index.html";
    }
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role })
    })
      .then(response => response.json())
      .then(data => {
        if (!response.ok) {
          window.location.href = "index.html";
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        window.location.href = "index.html";
      });
  }

  static setteacherMainStrings() {
    document.getElementById("welcomeTeacher").innerHTML = teacherMain.welcome;
    document.getElementById("dashboardDescription").innerHTML = teacherMain.dashboardDescription;
    document.getElementById("startSession").innerHTML = common.startSession;
    document.getElementById("viewStats").innerHTML = common.viewStats;
    document.getElementById("viewLogs").innerHTML = common.viewLogs;
    document.getElementById("home").innerHTML = common.home;
    document.getElementById("logout").innerHTML = common.logout;
  }

  static buildTeacherMainPage(sessionEndpoint, statsEndpoint, logsEndpoint, logoutEndpoint) {
    const page = new teacherMainPage(sessionEndpoint, statsEndpoint, logsEndpoint, logoutEndpoint);
    document.getElementById("startSession").addEventListener("click", (e) => page.startSession(e));
    document.getElementById("viewStats").addEventListener("click", (e) => document.location.href = "teacherStats.html");
    document.getElementById("logout").addEventListener("click", (e) => page.logout(e));
  }
}

class teacherMainPage {
  constructor(sessionEndpoint, statsEndpoint, logsEndpoint, logoutEndpoint) {
    this.sessionEndpoint = sessionEndpoint;
    this.statsEndpoint = statsEndpoint;
    this.logsEndpoint = logsEndpoint;
    this.logoutEndpoint = logoutEndpoint;
  }

  startSession(event) {
    event.preventDefault();
    fetch(this.sessionEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(response => response.json())
      .then(data => {
        if (response.ok) {
          localStorage.setItem("sessionId", data.sessionId);
          window.location.href = "teacherSession.html?sessionId=" + data.sessionId;
        } else {
          this.printError(`${errorMessages.startSessionFailed} ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        this.printError(`${errorMessages.startSessionError} ${error.message}`);
      });
  }

  logout(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    fetch(this.logoutEndpoint, {
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

  printError(message) {
    const errorDiv = document.getElementById("error");
    if (message) {
      errorDiv.innerHTML = message;
      errorDiv.classList.add("show");
    } else {
      errorDiv.classList.remove("show");
    }
  }
}

utils.checkAuth('https://dolphin-app-nxbr6.ondigitalocean.app/checktoken');
utils.setteacherMainStrings();
utils.buildTeacherMainPage('/startSession', '/viewStats', '/viewLogs', 'https://dolphin-app-nxbr6.ondigitalocean.app/logout');
