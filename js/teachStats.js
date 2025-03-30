import { adminStatsMessages } from "../lang/en/messages.js";
import { teacherSession } from "../lang/en/messages.js";
import { adminStatsEndpoints } from "./endpoints";

class TeacherStats {
    constructor() {
        this.setUserFacingStrings();
        this.usersAPIUsage();
        this.generalAPIUsage();
    }

    async usersAPIUsage() {
        fetch(adminStatsEndpoints.userStats, {
            method: "GET"
        })
            .then(response => {

            })
            .then(data => {

            })
            .catch(error => {

            })
    }

    async generalAPIUsage() {
        fetch(adminStatsEndpoints.generalStats, {
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