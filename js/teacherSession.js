import { common } from '../lang/en/messages.js';
import { teacherSession } from '../lang/en/messages.js';
import { errorMessages } from '../lang/en/messages.js';

class utils {
  static checkAuth(tokenEndpoint) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role || role !== "teacher") {
      window.location.href = "index.html";
    }
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role })
    })
      .then(response => response.json())
      .then(data => {
        if (!response.ok) {
          window.location.href = "index.html";
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
    document.getElementById("sessionIdLabel").innerText = teacherSession.sessionIdLabel;
    document.getElementById("sessionId").innerText = teacherSession.sessionIdLoading;
    document.getElementById("sessionLinkLabel").innerText = teacherSession.sessionLinkLabel;

    document.getElementById("askQuestionTitle").innerText = teacherSession.askQuestionTitle;
    document.getElementById("startRecording").innerText = teacherSession.startRecording;
    document.getElementById("questionStatus").innerText = teacherSession.questionStatusWaiting;
    document.getElementById("confirmQuestion").innerText = teacherSession.confirmQuestion;
    document.getElementById("endQuestion").innerText = teacherSession.endQuestion;

    document.getElementById("studentResponsesTitle").innerText = teacherSession.studentResponsesTitle;

    document.getElementById("backToDashboard").innerText = teacherSession.backToDashboard;
    document.getElementById("home").innerText = common.home;
    document.getElementById("logout").innerText = common.logout;
  }

  static buildTeacherSessionPage(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, responseEndpoint) {
    const page = new teacherSessionPage(processQuestionEndpoint, confirmQuestionEndpoint, endQuestionEndpoint, responseEndpoint);
    document.getElementById("startRecording").addEventListener("click", (e) => page.toggleRecording(e));
    document.getElementById("confirmQuestion").addEventListener("click", (e) => page.confirmQuestion(e));
    document.getElementById("confirmQuestion").style.display = "none";
    document.getElementById("endQuestion").addEventListener("click", (e) => page.endQuestion(e));
    document.getElementById("endQuestion").style.display = "none";
    document.getElementById("logout").addEventListener("click", (e) => page.logout(e));
    document.getElementById("loader").style.display = "none";
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

          try {
            const response = await fetch(this.processQuestionEndpoint, {
              method: "POST",
              body: formData,
            });
            const data = await response.json();
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
    try {
      await fetch(this.confirmQuestionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId, }),
      });
      document.getElementById("questionStatus").textContent = teacherSession.questionConfirmed + this.currentQuestion;
      document.getElementById("confirmQuestion").style.display = "none";
      document.getElementById("endQuestion").style.display = "inline";
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
      document.getElementById("endQuestion").style.display = "none";
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

  logout(event) {
    event.preventDefault();
    token = localStorage.getItem("token");
    fetch(this.logoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(response => {})
      .then(data => {
        if (data.message == "ok") {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "index.html";
        }
        else {
          this.printError(`${errorMessages.logoutFailed} ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        this.printError(`${errorMessages.logoutError} ${error.message}`);
      });
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
          this.dataArray[i] *= 0.85; // Reduce amplitude gradually
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

// Initialize
// utils.checkAuth('/auth');
utils.setTeacherSessionStrings();
utils.buildTeacherSessionPage('https://whale-app-aoaek.ondigitalocean.app/project/transcribe', '/api/confirmQuestion', '/api/endQuestion', '/api/getResponses');
