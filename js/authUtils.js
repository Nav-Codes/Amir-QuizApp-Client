//ChatGPT helped with debugging callback and import issues with this code and other minor bugs

import { errorMessages } from "../lang/en/messages.js";
import { commonEndpoints } from "./endpoints.js";
import { common } from "../lang/en/messages.js";

export default class Utils {
    static checkAuth(tokenEndpoint) {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || !role || role !== "student") {
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

    /**
     * Logs the student on both client and server side
     * @param {*} logoutEndpoint The endpoint for logging out the student on the server side
     * @param {*} logoutSuccessCallback Callback that defines how to log user out on client side
     */
    static logout(logoutEndpoint, logoutSuccessCallback) {
        const token = localStorage.getItem("token");
        fetch(logoutEndpoint, {
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
                logoutSuccessCallback();
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMessage = error.message.includes("Status:")
                    ? error.message
                    : `${errorMessages.logoutError} Network error or no response.`;
                Utils.#printError(errorMessage);
            });
    }

    /** Shows the user how many api calls they have left.
     * To use this function, ensure your page has <p> element with id="statusCode" and id="totalAPI"
     */
    static currentUserAPIUsage() {
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
                Utils.#printError(error);
            })
    }

    static #printError(message) {
        const errorDiv = document.getElementById("error");
        if (message) {
          errorDiv.innerHTML = message;
          errorDiv.classList.add("show");
        } else {
          errorDiv.classList.remove("show");
        }
      }
}