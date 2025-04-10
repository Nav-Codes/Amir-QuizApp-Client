import { common } from '../lang/en/messages.js';
import { teacherSession } from '../lang/en/messages.js';
import { errorMessages } from '../lang/en/messages.js';

class utils {
  static checkAuth(tokenEndpoint) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role || role !== "teacher") {
      console.log('No token or role found, redirecting to index.html');
      window.location.href = "index.html?error=401";
      return;
    }
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role })
    })
      .then(response => {
        document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
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

  static setTeacherSessionStrings() {
    document.getElementById("teacherSessionTitle").innerText = teacherSession.teacherSessionTitle;
    document.getElementById("sessionInfo").innerText = teacherSession.sessionInfo;
    document.getElementById("sessionCodeLabel").innerText = teacherSession.sessionCodeLabel;
    const sessionCode = localStorage.getItem("sessionCode");
    document.getElementById("sessionCode").innerText = sessionCode || teacherSession.sessionCodeLoading;
    // document.getElementById("sessionLinkLabel").innerText = teacherSession.sessionLinkLabel;
    document.getElementById("askQuestionTitle").innerText = teacherSession.askQuestionTitle;
    document.getElementById("startRecording").innerText = teacherSession.startRecording;
    document.getElementById("questionStatus").innerText = teacherSession.questionStatusWaiting;
    document.getElementById("confirmQuestion").innerText = teacherSession.confirmQuestion;
    document.getElementById("endQuestion").innerText = teacherSession.endQuestion;
    document.getElementById("studentResponsesTitle").innerText = teacherSession.studentResponsesTitle;
    document.getElementById("backToDashboard").innerText = teacherSession.backToDashboard;
    document.getElementById("endSession").innerText = common.endSession;
  }

  static buildTeacherSessionPage(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, endSessionEndPoint, responseEndpoint) {
    const page = new teacherSessionPage(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, endSessionEndPoint, responseEndpoint);
    document.getElementById("startRecording").addEventListener("click", (e) => page.toggleRecording(e));
    document.getElementById("confirmQuestion").addEventListener("click", (e) => page.confirmQuestion(e));
    document.getElementById("confirmQuestion").style.display = "none";
    document.getElementById("endQuestion").addEventListener("click", (e) => page.endQuestion(e));
    document.getElementById("endQuestion").style.display = "none";
    document.getElementById("endSession").addEventListener("click", (e) => page.endSession(e));
    document.getElementById("loader").style.display = "none";
    setInterval(() => page.getAnswers(), 1000);
  }
}

class teacherSessionPage {
  constructor(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, endSessionEndPoint, responseEndpoint) {
    this.processQuestionEndpoint = processQuestionEndpoint;
    this.confirmQuestionEndpoint = confirmQuestionEndpoint;
    this.endQuestionEndpoint = endQuestionEndpoint;
    this.endSessionEndpoint = endSessionEndPoint;
    this.responseEndpoint = responseEndpoint;
    this.currentQuestion = null;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.sessionId = new URLSearchParams(window.location.search).get("sessionId");
    if (!this.sessionId) {
      this.printError(errorMessages.noSessionIdFound);
    }
    if (this.sessionId) {
      // document.getElementById("sessionLink").innerHTML = `${window.location.origin}/studentSession.html?sessionId=${this.sessionId}`;
    }
    this.audioVisualizer = new AudioVisualizer("audioVisualizer");
  }

  async toggleRecording(event) {
    event.preventDefault();
    const button = document.getElementById("startRecording");
    if (!this.isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!stream) {
          console.error("Failed to get audio stream");
          return;
        }
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
        button.textContent = teacherSession.stopRecording;
        button.classList.add("red");
        document.getElementById("questionStatus").textContent = teacherSession.recording;
        this.audioVisualizer.toggleRecording(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("sessionId", this.sessionId);
          formData.append("file", audioBlob);
          formData.append("token", localStorage.getItem("token"));
          try {
            const response = await fetch(this.processQuestionEndpoint, {
              method: "POST",
              body: formData,
            });
            const data = await response.json();
            document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
            document.getElementById("questionStatus").textContent = data.questionText;
            this.currentQuestion = data.questionText;
            document.getElementById("loader").style.display = "none";
            document.getElementById("confirmQuestion").style.display = "inline";
          } catch (error) {
            console.error("Failed to process question", error);
          }
        };
      } catch (error) {
        console.error("Audio recording failed", error);
      }
    } else {
      document.getElementById("questionStatus").textContent = teacherSession.processing;
      document.getElementById("loader").style.display = "block";
      this.mediaRecorder.stop();
      this.isRecording = false;
      button.textContent = teacherSession.startRecording;
      button.classList.remove("red");
      this.audioVisualizer.stopVisualization();
    }
  }

  async confirmQuestion(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(this.confirmQuestionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId, question: this.currentQuestion, token }),
      });
      document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
      if (response.ok) {
        document.getElementById("questionStatus").textContent = teacherSession.questionConfirmed + this.currentQuestion;
        document.getElementById("confirmQuestion").style.display = "none";
        document.getElementById("endQuestion").style.display = "inline";
      } else {
        const errorData = await response.json();
        this.printError(teacherSession.confirmQuestionFailed + errorData.message);
      }
    } catch (error) {
      this.printError(teacherSession.confirmQuestionFailed + error.message);
    }
  }

  async endQuestion(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(this.endQuestionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId, token }),
      });
      document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
      if (response.ok) {
        document.getElementById("questionStatus").textContent = teacherSession.questionEnded + teacherSession.waitingToStart;
        document.getElementById("endQuestion").style.display = "none";
      } else {
        const errorData = await response.json();
        this.printError(teacherSession.endQuestionFailed + errorData.message);
      }
    } catch (error) {
      this.printError(teacherSession.endQuestionFailed + error.message);
    }
  }

  async getAnswers() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(this.responseEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId, token }),
      });
      document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
      if (!response.ok) {
        const errorData = await response.json();
        this.printError(teacherSession.fetchResponsesFailed + errorData.message);
        return;
      }
      const data = await response.json();
      const responseList = document.getElementById("responseList");
      responseList.innerHTML = data.answers.length
      ? data.answers.map((answer) => `<li>${answer.text} <br> ${teacherSession.score} ${answer.correctness}</li>`).join("")
      : `<li>${teacherSession.noResponses}</li>`;
    } catch (error) {
      this.printError(teacherSession.fetchResponsesFailed + error.message);
    }
  }

  async endSession(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(this.endSessionEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId, token }),
      });
      document.getElementById("statusCode").innerHTML = `${common.statusCode}${response.status}`;
      if (response.ok) {
        localStorage.removeItem("sessionId");
        localStorage.removeItem("sessionCode");
        window.location.href = "teacherMain.html";
      } else {
        const errorData = await response.json();
        this.printError(errorMessages.endSessionFailed + errorData.message);
      }
    } catch (error) {
      this.printError(errorMessages.endSessionFailed + error.message);
    }
  }

  printError(message) {
    const errorDiv = document.getElementById("error");
    if (message) {
      errorDiv.innerHTML = message;
      errorDiv.classList.add("show");
    } else {
      errorDiv.classList.remove("show");
    }
  }
}

class AudioVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = window.innerWidth;
    this.ctx = this.canvas.getContext("2d");
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.isRecording = false;
  }

  startVisualization(stream) {
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.visualizeAudio();
  }

  visualizeAudio() {
    const draw = () => {
      if (!this.isRecording) return;
      this.analyser.getByteFrequencyData(this.dataArray);
      this.drawBars();
      requestAnimationFrame(draw);
    };
    draw();
  }

  drawBars() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const minFrequency = 100;
    const maxFrequency = 3000;
    const minBin = Math.floor((minFrequency / this.audioContext.sampleRate) * this.bufferLength);
    const maxBin = Math.floor((maxFrequency / this.audioContext.sampleRate) * this.bufferLength);
    const barWidth = this.canvas.width / (maxBin - minBin);
    let x = 0;

    for (let i = minBin; i < maxBin; i++) {
      let barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.9;
      const ratio = (i - minBin) / (maxBin - minBin);
      const hue = 240 - ratio * 240;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
      x += barWidth;
    }
  }

  toggleRecording(stream) {
    if (this.isRecording) {
      this.audioContext.suspend();
      this.isRecording = false;
    } else {
      this.audioContext.resume();
      this.isRecording = true;
      this.startVisualization(stream);
    }
  }

  stopVisualization() {
    this.isRecording = false;
    const fadeOut = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let hasNonZero = false;
      for (let i = 0; i < this.dataArray.length; i++) {
        if (this.dataArray[i] > 0) {
          this.dataArray[i] *= 0.85; 
          hasNonZero = true;
        }
      }
      this.drawBars();
      if (hasNonZero) {
        requestAnimationFrame(fadeOut);
      }
    };
    fadeOut();
  }

}

utils.checkAuth('https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/checktoken');
utils.setTeacherSessionStrings();
utils.buildTeacherSessionPage('https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/transcribeQuestion', 
  'https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/confirmquestion', 
  'https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/endquestion', 
  'https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/destroysession',
  'https://dolphin-app-nxbr6.ondigitalocean.app/api/v1/getanswers');
