import { common } from '../lang/en/messages.js';
import { teacherSession } from '../lang/en/messages.js';
import { errorMessages } from '../lang/en/messages.js';

class utils {
  static checkAuth(tokenEndpoint) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role || role !== "teacher") {
      window.location.href = "home.html";
    }
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role })
    })
      .then(response => response.json())
      .then(data => {
        if (!response.ok) {
          window.location.href = "home.html";
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        window.location.href = "home.html";
      });
  }

  static setTeacherSessionStrings() {
    document.getElementById("teacherSessionTitle").innerText = teacherSession.teacherSessionTitle;

    document.getElementById("sessionInfo").innerText = teacherSession.sessionInfo;
    document.getElementById("sessionIdLabel").innerText = teacherSession.sessionIdLabel;
    document.getElementById("sessionId").innerText = teacherSession.sessionIdLoading;
    document.getElementById("sessionLinkLabel").innerText = teacherSession.sessionLinkLabel;

    document.getElementById("askQuestionTitle").innerText = teacherSession.askQuestionTitle;
    document.getElementById("startRecording").innerText = teacherSession.startRecording;
    document.getElementById("questionStatus").innerText = teacherSession.questionStatusWaiting;
    document.getElementById("confirmQuestion").innerText = teacherSession.confirmQuestion;
    document.getElementById("endQuestion").innerText = teacherSession.endQuestion;

    document.getElementById("studentResponsesTitle").innerText = teacherSession.studentResponsesTitle;
    document.getElementById("noResponses").innerText = teacherSession.noResponses;

    document.getElementById("backToDashboard").innerText = teacherSession.backToDashboard;
    document.getElementById("home").innerText = common.home;
    document.getElementById("logout").innerText = common.logout;
  }

  static buildTeacherSessionPage(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, responseEndpoint) {
    const page = new teacherSessionPage(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, responseEndpoint);
    document.getElementById("startRecording").addEventListener("click", (e) => page.toggleRecording(e));
    document.getElementById("confirmQuestion").addEventListener("click", (e) => page.confirmQuestion(e));
    document.getElementById("endQuestion").addEventListener("click", (e) => page.endQuestion(e));
    // setInterval(() => page.fetchResponses(), 5000);
  }
}

class teacherSessionPage {
  constructor(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, responseEndpoint) {
    this.processQuestionEndpoint = processQuestionEndpoint;
    this.confirmQuestionEndpoint = confirmQuestionEndpoint;
    this.endQuestionEndpoint = endQuestionEndpoint;
    this.responseEndpoint = responseEndpoint;
    this.currentQuestion = null;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    // this.sessionId = new URLSearchParams(window.location.search).get("sessionId") || this.createSession();
    document.getElementById("sessionId").innerText = this.sessionId || teacherSession.sessionIdLoading;
    if (!this.sessionId) {
      document.getElementById("sessionLink").innerHTML = `studentSession.html?sessionId=${this.sessionId}`;
      document.getElementById("sessionLink").href = `studentSession.html?sessionId=${this.sessionId}`;
    }
    document.getElementById("sessionLink").innerText = teacherSession.sessionLinkGenerating;
  }

  async createSession() {
    try {
      const response = await fetch("/api/createSession", { method: "POST" });
      const data = await response.json();
      const sessionId = data.sessionId;
      window.history.replaceState(null, "", `?sessionId=${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error("Failed to create session", error);
    }
  }

  async toggleRecording(event) {
    event.preventDefault();
    const button = document.getElementById("startRecording");

    if (!this.isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("sessionId", this.sessionId);
          formData.append("audio", audioBlob);

          try {
            const response = await fetch(this.processQuestionEndpoint, {
              method: "POST",
              body: formData,
            });
            const data = await response.json();
            document.getElementById("questionStatus").textContent = data.questionText;
            this.currentQuestion = data.questionText;
          } catch (error) {
            console.error("Failed to process question", error);
          }
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        button.textContent = common.stopRecording;
        document.getElementById("questionStatus").textContent = teacherSession.recording;
      } catch (error) {
        console.error("Audio recording failed", error);
      }
    } else {
      this.mediaRecorder.stop();
      this.isRecording = false;
      button.textContent = common.startRecording;
    }
  }

  async confirmQuestion(event) {
    event.preventDefault();
    try {
      await fetch(this.confirmQuestionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId, }),
      });
      document.getElementById("questionStatus").textContent = teacherSession.questionConfirmed + this.currentQuestion;
    } catch (error) {
      console.error("Failed to confirm question", error);
    }
  }

  async endQuestion(event) {
    event.preventDefault();
    try {
      await fetch(this.endQuestionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId }),
      });
      document.getElementById("questionStatus").textContent = teacherSession.questionEnded + teacherSession.waitingToStart;
    } catch (error) {
      console.error("Failed to end question", error);
    }
  }

  async fetchResponses() {
    try {
      const response = await fetch(`${this.responseEndpoint}?sessionId=${this.sessionId}`);
      const data = await response.json();
      const responseList = document.getElementById("responseList");
      responseList.innerHTML = data.responses.length
        ? data.responses.map((resp) => `<li>${resp}</li>`).join("")
        : `<li>${teacherSession.noResponses}</li>`;
    } catch (error) {
      console.error("Failed to fetch responses", error);
    }
  }
}

// Initialize
// utils.checkAuth('/auth');
utils.setTeacherSessionStrings();
utils.buildTeacherSessionPage('/api/processQuestion', '/api/confirmQuestion', '/api/endQuestion', '/api/getResponses');
