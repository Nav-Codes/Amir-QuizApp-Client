import { studentSession } from "../lang/en/messages.js";
import Utils from "./authUtils.js"

class SessionHandler {
    get #BASE_ENDPOINT() { return "https://dolphin-app-nxbr6.ondigitalocean.app/api/v1" }
    get #GET_QUESTION_ENDPOINT() { return `${this.#BASE_ENDPOINT}` };
    get #SEND_ANSWER_ENDPOINT() { return `${this.#BASE_ENDPOINT}` };
    get #CHECK_TOKEN_ENDPOINT() { return "https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/checktoken" }

    #currentQuestion = studentSession.waitingForQuestion; 
    #currentAnswer = "";

    constructor() {
        Utils.checkAuth(this.#CHECK_TOKEN_ENDPOINT);
        document.getElementById("sessionIdSubmit").addEventListener("click", () => {
            this.loadSession();
        });
    }

    async loadSession() {
        let sessionCode = document.getElementById("sessionIdInput").value;
        document.getElementById("sessionInput").remove();
        this.createQuestionArea();
        setInterval(() => {
            this.getQuestion(localStorage.getItem("sessionId"));
        }, 1000);
    }

    /** This will create a fetch request to the server to request the question asked by teacher */
    async getQuestion(sessionCode) {
        await this.loadSession();
        fetch(this.#GET_QUESTION_ENDPOINT, {
            method: "GET",
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.questionId !== null && data.teacherQuestion !== null) {
                if (data.teacherQuestion !== this.#currentQuestion) {
                    document.getElementById("teacherQuestion").innerHTML = data.teacherQuestion;
                    this.#currentQuestion = data.teacherQuestion;
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
        fetch(this.#SEND_ANSWER_ENDPOINT, {
            method: "POST",
            body: {
                answer: answer
            }
        }).then(response => {
            return response.json();
        }).then(data => {
            document.getElementById("studentGrade").innerHTML = `Score: ${data.grade}. Feedback: ${data.feedback}`;
        }).catch(error => {
            console.log("Error: " + error);
        })
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

    createQuestionArea() {
        // Get the <div> element where the question area components will be placed
        const questionArea = document.getElementById("questionArea");
        questionArea.classList.add("container");
        questionArea.classList.add("btn-container");

        // Create the <p> element that displays the teachers question
        const question = document.createElement("p");
        question.id = "teacherQuestion";
        question.textContent = studentSession.waitingForQuestion;
        //will need to get question from back end using fetch

        // Create the <input> element for student to type in their answer
        const answerInput = document.createElement("input");
        answerInput.type = "text";
        answerInput.id = "studentAnswer";
        answerInput.placeholder = studentSession.answerPlaceholder;

        // Create the <button> element to submit answer
        const button = document.createElement("button");
        button.textContent = "Submit";
        button.id = "answerSubmitBtn";
        button.classList.add("btn");
        button.classList.add("btn-blue");
        button.onclick = function () {
            button.disabled = true;
            answerInput.disabled = true;
            this.sendAnswer(answerInput.value);
        };

        const grade = document.createElement("p");
        grade.id = "studentGrade";

        // const questionArea = document.getElementById("questionArea");
        questionArea.innerHTML = "";
        questionArea.insertAdjacentElement("beforeend", question);
        questionArea.insertAdjacentElement("beforeend", answerInput);
        questionArea.insertAdjacentElement("beforeend", button);
        questionArea.insertAdjacentElement("beforeend", grade);
    }
}

new SessionHandler();