import { adminStatsMessages } from "../lang/en/messages.js";
import { teacherSession } from "../lang/en/messages.js";
import { adminStatsEndpoints } from "./endpoints.js";
import Utils from "./authUtils.js";

class TeacherStats {
    constructor() {
        // Utils.checkAuth(localStorage.getItem("token"));
        this.setUserFacingStrings();
        // this.usersAPIUsage();
        // this.generalAPIUsage();
    }

    async usersAPIUsage() {
        fetch(`${adminStatsEndpoints.userStats}?token=${localStorage.getItem("token")}`, {
            method: "GET"
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                generateUserAPITable(data);
            })
            .catch(error => {

            })
    }

    // ChatGPT helped with the creation of the table
    generateUserAPITable(data) {
        this.generateUserTableHeaders();
    }

    generateUserTableHeaders() {
        let userTable = document.getElementById("apiuserusage");

        let tableHead = document.createElement("thead");
        let headerRow = document.createElement("tr");

        let userIdHeader = document.createElement("th").textContent = adminStatsMessages.userIdHeader;
        let nameHeader = document.createElement("th").textContent = adminStatsMessages.nameHeader;
        let emailHeader = document.createElement("th").textContent = adminStatsMessages.emailHeader;
        let numReqHeader = document.createElement("th").textContent = adminStatsMessages.numRequestsHeader;

        headerRow.insertAdjacentElement("beforeend", userIdHeader);
        headerRow.insertAdjacentElement("beforeend", nameHeader);
        headerRow.insertAdjacentElement("beforeend", emailHeader);
        headerRow.insertAdjacentElement("beforeend", numReqHeader);

        tableHead.insertAdjacentElement("beforeend", headerRow)
        userTable.insertAdjacentElement("beforeend", tableHead);
    }

    //ChatGPT helped with generating a dynamic process for inserting the data into the table
    generateUserTableBody(data, userTable) {
        let tableBody = document.createElement("tbody");

        data.forEach(userObj => {
            let userRow = document.createElement("tr");

            for (let key in userObj) {
                let userData = document.createElement("td");
                userData.innerHTML = userObj[key];
                userRow.insertAdjacentElement("beforeend", userData);
            }

            tableBody.insertAdjacentElement("beforeend", userRow)
        });

        userTable.insertAdjacentElement("beforeend", tableBody);
    }

    async generalAPIUsage() {
        fetch(`${adminStatsEndpoints.generalStats}?token=${localStorage.getItem("token")}`, {
            method: "GET"
        })
            .then(response => {
                
            })
            .then(data => {

            })
            .catch(error => {

            })
    }

    setUserFacingStrings() {
        document.getElementById("apiStats").innerHTML = adminStatsMessages.apiStats;
        document.getElementById("generalStats").innerHTML = adminStatsMessages.general;
        document.getElementById("endpointUsage").innerHTML = adminStatsMessages.endpointUsage;
        document.getElementById("userUsage").innerHTML = adminStatsMessages.userUsage;
        document.getElementById("backToDashboard").innerHTML = teacherSession.backToDashboard;
    }
}

new TeacherStats();