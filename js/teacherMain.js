import { common } from '../lang/en/messages.js';
import { teacherMain } from '../lang/en/messages.js';

class utils {
  static setteacherMainStrings() {
    document.getElementById("welcomeTeacher").innerHTML = teacherMain.welcome;
    document.getElementById("dashboardDescription").innerHTML = teacherMain.dashboardDescription;
    document.getElementById("startSession").innerHTML = common.startSession;
    document.getElementById("viewStats").innerHTML = common.viewStats;
    document.getElementById("viewLogs").innerHTML = common.viewLogs;
    document.getElementById("home").innerHTML = common.home;
    document.getElementById("logout").innerHTML = common.logout;
  }
}

utils.setteacherMainStrings();
