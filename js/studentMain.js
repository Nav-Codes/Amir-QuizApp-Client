import { common } from '../lang/en/messages.js';
import { studentMain } from "../lang/en/messages.js";
import { commonEndpoints } from './endpoints.js';
import Utils from "./authUtils.js";

class StudentMain {
    constructor() {
        Utils.checkAuth(commonEndpoints.checkAuth, localStorage.getItem("role"));
        
        let joinSessionBtn = document.getElementById("joinSession");
        joinSessionBtn.innerHTML = studentMain.joinASession;
        joinSessionBtn.addEventListener("click", () => {
            window.location.href = "studentSession.html";
        })
        
        let logoutBtn = document.getElementById("logout");
        logoutBtn.innerHTML = common.logout;
        logoutBtn.addEventListener("click", () => {
            Utils.logout(commonEndpoints.logout, this.logout);
        })

        document.getElementById("totalAPI").innerHTML = `${common.totalAPI}`;
        document.getElementById("statusCode").innerHTML = `${common.statusCode}`;
    }

    /** Handles logout functionality for the client side */
    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "index.html";
    }
}

new StudentMain();