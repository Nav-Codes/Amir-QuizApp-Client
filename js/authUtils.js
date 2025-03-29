import { errorMessages } from "../lang/en/messages";

export default class Utils {
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

    /**
     * Logs the student on both client and server side
     * @param {*} logoutEndpoint The endpoint for logging out the student on the server side
     * @param {*} logoutSuccessCallback Callback that defines how to log user out on client side
     */
    static logout(logoutEndpoint, logoutSuccessCallback) {
        const token = localStorage.getItem("token");
        fetch(this.logoutEndpoint, {
            method: 'POST',
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
                this.printError(errorMessage);
            });
    }
}