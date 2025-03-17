import { studentSession } from "../lang/en/messages";

class SessionHandler {
    static get #GET_QUESTION_ENDPOINT() { return "" }
    static get #SEND_ANSWER_ENDPOINT() { return "" }

    static async loadSession() {
        let sessionCode = document.getElementById("sessionIdInput").value;
        document.getElementById("sessionInput").remove();
        SessionHandler.getQuestion(sessionCode);
    }

    /** This will create a fetch request to the server to request the question asked by teacher */
    static async getQuestion(sessionCode) {
        fetch(SessionHandler.#GET_QUESTION_ENDPOINT, {
            method: "POST",
            body: {
                sessionCode: sessionCode
            }
        }).then(response => {
            return response.json();
        }).then(data => {
            SessionHandler.createQuestionArea(data.question);
        }).catch(error => {
            console.log("Error: " + error);
        })
    }

    /** This will make fetch request to server with answer to question 
     *  and server will say its right or wrong (or with grade)
    */
    static async sendAnswer(answer) {
        fetch(SessionHandler.#SEND_ANSWER_ENDPOINT, {
            method: "POST",
            body: {
                answer: answer
            }
        }).then(response => {
            return response.json();
        }).then(data => {
            document.getElementById("studentGrade").innerHTML = data.grade;
        }).catch(error => {
            console.log("Error: " + error);
        })
    }

    static createQuestionArea(teachersQuestion = studentSession.waitingForQuestion) {
        // Create the <p> element that displays the teachers question
        const question = document.createElement("p");
        question.id = "teacherQuestion";
        question.textContent = teachersQuestion;
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
        button.onclick = function () {
            button.disabled = true;
            answerInput.disabled = true;
            SessionHandler.sendAnswer(answerInput.value);
        };

        const grade = document.createElement("p");
        grade.id = "studentGrade";

        const questionArea = document.getElementById("questionArea");
        questionArea.innerHTML = "";
        questionArea.insertAdjacentHTML("beforeend", question);
        questionArea.insertAdjacentHTML("beforeend", answerInput);
        questionArea.insertAdjacentHTML("beforeend", button);
        questionArea.insertAdjacentHTML("beforeend", grade);
    }
}