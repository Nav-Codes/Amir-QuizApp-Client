import Utils from "./authUtils"

class StudentSession {
    get #BASE_ENDPOINT() { return "https://dolphin-app-nxbr6.ondigitalocean.app/api/v1" }
    get #JOIN_SESSION_ENDPOINT() { return `${this.#BASE_ENDPOINT}/joinsession`; }
    get #CHECK_TOKEN_ENDPOINT() { return "https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/checktoken" }

    constructor() {
        Utils.checkAuth(this.#CHECK_TOKEN_ENDPOINT);
        document.getElementById("joinSession").addEventListener("click", () => {
            this.joinSession();
        })
    }

    async joinSession(sessionCode) {
        fetch(this.#JOIN_SESSION_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({
                session_code: sessionCode,
                token: localStorage.getItem("token")
            })
        }).then(response => {
            return response.json();
        }).then(data => {
            localStorage.setItem("sessionId", data.sessionId);
            window.location.href = "studentSession.html";
        })
    }
}

new StudentSession();