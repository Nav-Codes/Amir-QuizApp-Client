import { adminStatsMessages } from "../lang/en/messages.js";
import { teacherSession } from "../lang/en/messages.js";
import { adminStatsEndpoints } from "./endpoints.js";
import { commonEndpoints } from "./endpoints.js";
import { common } from "../lang/en/messages.js";

class TeacherStats {
    constructor() {
        this.checkAuth(commonEndpoints.checkAuth);
        TableAndStringsRenderer.setUserFacingStrings();
        this.usersAPIUsage();
        this.generalEndpointUsage();
    }

    async usersAPIUsage() {
        fetch(`${adminStatsEndpoints.userStats}?token=${localStorage.getItem("token")}`, {
            method: "GET"
        })
            .then(response => {
                document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
                return response.json();
            })
            .then(data => {
                this.generateUserAPITable(data.data);
            })
            .catch(error => {
                console.log("Error: " + error);
            })
    }

    // ChatGPT helped with the creation of the table
    generateUserAPITable(data) {
        TableAndStringsRenderer.generateUserTableHeaders();
        TableAndStringsRenderer.generateTableBody(data, document.getElementById("apiuserusage"));
    }

    async generalEndpointUsage() {
        fetch(`${adminStatsEndpoints.generalStats}?token=${localStorage.getItem("token")}`, {
            method: "GET"
        })
            .then(response => {
                document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
                return response.json();
            })
            .then(data => {
                this.generateEndpointTable(data.data);
            })
            .catch(error => {
                console.log("Error: " + error)
            })
    }

    generateEndpointTable(data) {
        TableAndStringsRenderer.generateEndpointTableHeaders();
        TableAndStringsRenderer.generateTableBody(data, document.getElementById("apiendpointusage"));
    }

    checkAuth(tokenEndpoint) {
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
                    window.location.href = "index.html" + `?error=${response.status}`;
                    return;
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                window.location.href = "index.html";
            });
    }
}

class TableAndStringsRenderer {
    /** Generates the table body for the given data and table 
     * ChatGPT helped with generating a dynamic process for inserting the data into the table */
    static generateTableBody(data, table) {
        let tableBody = document.createElement("tbody");

        data.forEach(obj => {
            let row = document.createElement("tr");

            for (let key in obj) {
                let data = document.createElement("td");
                data.innerHTML = obj[key];
                row.insertAdjacentElement("beforeend", data);
            }

            tableBody.insertAdjacentElement("beforeend", row)
        });

        table.insertAdjacentElement("beforeend", tableBody);
        table.style.border = "1px solid black";
        table.style.padding = "2px";
    }

    /** Generates table headers for user endpoint consumption table */
    static generateUserTableHeaders() {
        let tableHead = document.createElement("thead");
        let headerRow = document.createElement("tr");

        let userIdHeader = document.createElement("th");
        userIdHeader.textContent = adminStatsMessages.userIdHeader;
        let nameHeader = document.createElement("th");
        nameHeader.textContent = adminStatsMessages.nameHeader;
        let emailHeader = document.createElement("th");
        emailHeader.textContent = adminStatsMessages.emailHeader;
        let numReqHeader = document.createElement("th");
        numReqHeader.textContent = adminStatsMessages.numRequestsHeader;

        headerRow.insertAdjacentElement("beforeend", userIdHeader);
        headerRow.insertAdjacentElement("beforeend", nameHeader);
        headerRow.insertAdjacentElement("beforeend", emailHeader);
        headerRow.insertAdjacentElement("beforeend", numReqHeader);

        tableHead.insertAdjacentElement("beforeend", headerRow)
        document.getElementById("apiuserusage").insertAdjacentElement("beforeend", tableHead);
    }

    /** Generates table headers for general endpoint consumption table */
    static generateEndpointTableHeaders() {
        let tableHead = document.createElement("thead");
        let headerRow = document.createElement("tr");

        let methodHeader = document.createElement("th");
        methodHeader.textContent = adminStatsMessages.methodHeader;
        let endpointHeader = document.createElement("th");
        endpointHeader.textContent = adminStatsMessages.endpointHeader;
        let requestHeader = document.createElement("th");
        requestHeader.textContent = adminStatsMessages.numRequestsHeader;

        headerRow.insertAdjacentElement("beforeend", endpointHeader);
        headerRow.insertAdjacentElement("beforeend", methodHeader);
        headerRow.insertAdjacentElement("beforeend", requestHeader);

        tableHead.insertAdjacentElement("beforeend", headerRow);
        document.getElementById("apiendpointusage").insertAdjacentElement("beforeend", tableHead);
    }

    static setUserFacingStrings() {
        document.getElementById("apiStats").innerHTML = adminStatsMessages.apiStats;
        document.getElementById("endpointUsage").innerHTML = adminStatsMessages.endpointUsage;
        document.getElementById("userUsage").innerHTML = adminStatsMessages.userUsage;
        document.getElementById("backToDashboard").innerHTML = teacherSession.backToDashboard;
    }
}

new TeacherStats();