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

        let logoutBtn = document.getElementById("logout");
        logoutBtn.addEventListener("click", () => {
            Utils.logout(commonEndpoints.logout, this.logout);
        })
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("sessionId");
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
            }
            return response.json();
        }).then(data => {
            console.log("sessionId: " + data.sessionId)
            localStorage.setItem("sessionId", data.sessionId);
            document.getElementById("sessionInput").remove();
            SessionRenderer.createQuestionArea();
            setInterval(() => {
                this.getQuestion();
            }, 1000);
        }).catch(error => {
            console.log("Error: " + error)
        })
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
                    console.log("Question Id: " + data.question.id);
                    console.log("Question curr_question : " + data.question.curr_question);
                    document.getElementById("teacherQuestion").innerHTML = data.question.text;
                    this.#currentQuestion = data.question.text;
                    document.getElementById("studentAnswer").disabled = false;
                    document.getElementById("answerSubmitBtn").disabled = false;
                }
            }
        }).catch(error => {
            console.log("Error: " + error);
        })
    }

    /** This will make fetch request to server with answer to question 
     *  and server will say its right or wrong with grade
    */
    async sendAnswer(answer) {
        document.getElementById("studentAnswer").disabled = true;
        document.getElementById("answerSubmitBtn").disabled = true;
        fetch(studentEndpoints.sendAnswer, {
            method: "POST",
            body: {
                answer: answer
            }
        }).then(response => {
            document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
            return response.json();
        }).then(data => {
            document.getElementById("studentGrade").innerHTML = `Score: ${data.grade}. Feedback: ${data.feedback}`;
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
        button.onclick = function () {
            this.sendAnswer(answerInput.value);
        };

        answerInput.disabled = true;
        button.disabled = true;

        const grade = document.createElement("p");
        grade.id = "studentGrade";

        questionArea.innerHTML = "";
        questionArea.insertAdjacentElement("beforeend", question);
        questionArea.insertAdjacentElement("beforeend", answerInput);
        questionArea.insertAdjacentElement("beforeend", button);
        questionArea.insertAdjacentElement("beforeend", grade);
    }
}

new SessionHandler();