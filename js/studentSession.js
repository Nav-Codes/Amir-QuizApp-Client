import { common, studentSession } from "../lang/en/messages.js";
import { commonEndpoints, studentEndpoints } from "./endpoints.js";
import Utils from "./authUtils.js"

class SessionHandler {
    #currentQuestion = studentSession.waitingForQuestion;

    constructor() {
        SessionRenderer.loadInitalUserStrings();
        Utils.checkAuth(commonEndpoints.checkAuth);
        document.getElementById("sessionIdSubmit").addEventListener("click", () => {
            this.joinSession();
        });

        //ChatGPT helped with ensuring that the callback was passed in and called properly
        let logoutBtn = document.getElementById("logout");
        logoutBtn.addEventListener("click", () => {
            Utils.logout(commonEndpoints.logout, this.logout);
        })
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("questionId");
        window.location.href = "index.html";
    }

    async joinSession() {
        document.getElementById("sessionIdSubmit").disabled = true;
        fetch(studentEndpoints.joinSession, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_code: document.getElementById("sessionIdInput").value,
                token: localStorage.getItem("token")
            })
        }).then(response => {
            document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
            if (response.status !== 200) {
                document.getElementById("sessionIdSubmit").disabled = false;
                throw new Error("Invalid session code.");
            }
            return response.json();
        }).then(data => {
            console.log("sessionId: " + data.sessionId)
            this.setupQuestionArea(data);
        }).catch(error => {
            console.log("Error: " + error);
            SessionRenderer.printError(error);
        })
    }

    setupQuestionArea(data) {
        localStorage.setItem("sessionId", data.sessionId);
        document.getElementById("sessionInput").remove();
        document.getElementById("error").innerHTML = "";
        SessionRenderer.createQuestionArea();
        document.getElementById("answerSubmitBtn").addEventListener("click", () => {
            this.sendAnswer(document.getElementById("studentAnswer").value);
        })
        setInterval(() => {
            this.getQuestion();
        }, 1000);
    }

    /** This will create a fetch request to the server to request the question asked by teacher */
    async getQuestion() {
        fetch(studentEndpoints.getQuestion, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: localStorage.getItem("sessionId"),
                token: localStorage.getItem("token")
            })
        }).then(response => {
            document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
            return response.json();
        }).then(data => {
            if (Object.keys(data.question).length !== 0) {
                if (data.question.text !== this.#currentQuestion) {
                    this.updateQuestionArea(data);
                }
            }
        }).catch(error => {
            console.log("Error: " + error);
        })
    }

    /** Clears the score and updates the question */
    updateQuestionArea(data) {
        localStorage.setItem("questionId", data.question.id);
        document.getElementById("teacherQuestion").innerHTML = data.question.text;
        document.getElementById("studentAnswer").innerHTML = "";
        this.#currentQuestion = data.question.text;
        document.getElementById("studentAnswer").disabled = false;
        document.getElementById("answerSubmitBtn").disabled = false;
    }

    /** This will make fetch request to server with answer to question 
     *  and server will say its right or wrong with grade. 
     * ChatGPT helped with the formatting of the user strings. 
    */
    async sendAnswer(answer) {
        console.log("QUESTION: " + document.getElementById("teacherQuestion").innerHTML);
        document.getElementById("studentAnswer").disabled = true;
        document.getElementById("answerSubmitBtn").disabled = true;
        fetch(studentEndpoints.sendAnswer, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: localStorage.getItem("questionId"),
                question: document.getElementById("teacherQuestion").innerHTML,
                token: localStorage.getItem("token"),
                answer: answer
            })
        }).then(response => {
            document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
            return response.json();
        }).then(data => {
            document.getElementById("studentGrade").innerHTML = `${studentSession.score}${parseFloat(data.result).toFixed(2)}.`;
        }).catch(error => {
            console.log("Error: " + error);
        })
    }
}

class SessionRenderer {
    static loadInitalUserStrings() {
        document.getElementById("sessionId").innerHTML = studentSession.enterSessionId;
        document.getElementById("sessionIdSubmit").innerHTML = studentSession.joinSession;
        document.getElementById("logout").innerHTML = common.logout;
    }

    static printError(message) {
        const errorDiv = document.getElementById("error");
        if (message) {
            errorDiv.innerHTML = message;
            errorDiv.classList.add("show");
        } else {
            errorDiv.classList.remove("show");
        }
    }

    //ChatGPT 3.5 and 4 was usedd to help make this function
    static createQuestionArea() {
        // Get the <div> element where the question area components will be placed
        const questionArea = document.getElementById("questionArea");
        questionArea.classList.add("container");
        questionArea.classList.add("btn-container");

        // Create the <p> element that displays the teachers question
        const question = document.createElement("p");
        question.id = "teacherQuestion";
        question.textContent = studentSession.waitingForQuestion;

        // Create the <input> element for student to type in their answer
        const answerInput = document.createElement("input");
        answerInput.type = "text";
        answerInput.id = "studentAnswer";
        answerInput.placeholder = studentSession.answerPlaceholder;

        // Create the <button> element to submit answer
        const button = document.createElement("button");
        button.innerHTML = studentSession.submitAnswer;
        button.id = "answerSubmitBtn";
        button.classList.add("btn");
        button.classList.add("btn-blue");

        // Create the <button> element to leave the session
        const leaveSessionBtn = document.createElement("button");
        leaveSessionBtn.innerHTML = studentSession.leaveSession;
        leaveSessionBtn.id = "leaveSessionBtn";
        leaveSessionBtn.classList.add("btn");
        leaveSessionBtn.classList.add("btn-red");
        leaveSessionBtn.onclick(() => {
            localStorage.removeItem("questionId");
            window.location.href = "studentMain.html";
        })

        answerInput.disabled = true;
        button.disabled = true;

        const grade = document.createElement("p");
        grade.id = "studentGrade";

        questionArea.innerHTML = "";
        questionArea.insertAdjacentElement("beforeend", question);
        questionArea.insertAdjacentElement("beforeend", answerInput);
        questionArea.insertAdjacentElement("beforeend", button);
        questionArea.insertAdjacentElement("beforeend", grade);
        questionArea.insertAdjacentElement("beforeend", leaveSessionBtn);
    }
}

new SessionHandler();