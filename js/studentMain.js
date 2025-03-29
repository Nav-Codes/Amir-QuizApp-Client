import { common } from '../lang/en/messages.js';
import { studentMain } from "../lang/en/messages.js";
import { commonEndpoints } from './endpoints.js';
import Utils from "./authUtils.js";

class StudentMain {
    get #BASE_ENDPOINT() { return "https://dolphin-app-nxbr6.ondigitalocean.app/api/v1" }
    get #CHECK_TOKEN_ENDPOINT() { return `${this.#BASE_ENDPOINT}/checktoken` }
    get #LOGOUT_ENDPOINT() { return `${this.#BASE_ENDPOINT}/logout` }

    constructor() {
        Utils.checkAuth(commonEndpoints.checkAuth);
        
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
    }

    /** Handles logout functionality for the client side */
    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "index.html";
    }

    // async joinSession(sessionCode) {
    //     fetch(this.#JOIN_SESSION_ENDPOINT, {
    //         method: "POST",
    //         body: JSON.stringify({
    //             session_code: sessionCode,
    //             token: localStorage.getItem("token")
    //         })
    //     }).then(response => {
    //         return response.json();
    //     }).then(data => {
    //         localStorage.setItem("sessionId", data.sessionId);
    //         window.location.href = "studentSession.html";
    //     })
    // }
}

new StudentMain();