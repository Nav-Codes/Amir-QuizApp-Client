export const common = {
  login: 'Log in',
  logout: 'Log out',
  signup: 'Sign up',
  home: 'Home',
  startSession: "Start New Session",
  viewStats: "View Statistics",
  viewLogs: "View Logs",
  continueSession: "Continue Session",
  endSession: "End Session",
};

export const home = {
  welcome: 'Welcome to SmartClassroom AI',
  redirectLoginSignup: 'Click below to log in or sign up',
  description: 'Enhance your learning experience with our smart classroom platform and participate in real-time interactions.'
};

export const login = {
  welcome: 'Welcome Back!',
  formEmail: 'Email',
  formPassword: 'Password',
  unknownRole: 'Unknown role. Contact admin.',
  loginFailed: 'Login failed: '
}

export const logout = {
  logoutMessage: 'You have been logged out successfully!',
  loginAgain: 'Login Again'
};

export const signup = {
  welcome: "Create an Account",
  formName: "Full Name",
  formEmail: "Email",
  formPassword: "Password",
  formConfirmPassword: "Confirm Password",
  passwordMismatch: "Passwords do not match!",
  unknownRole: "Unknown role. Contact admin.",
  signupFailed: 'Signup failed: '
};

export const teacherMain = {
  welcome: "Welcome to the Teacher Dashboard",
  dashboardDescription: "Here you can start a new session, view statistics, and check the logs."
};

export const teacherSession = {
  teacherSessionTitle: "Teacher Session",
  sessionInfo: "Session Information",
  sessionCodeLabel: "Join Session Using This Code:",
  sessionIdLoading: "Loading...",
  sessionLinkLabel: "Share this link with students:",
  askQuestionTitle: "Ask a Question",
  startRecording: "Start Recording",
  stopRecording: "Stop Recording",
  confirmQuestion: "Confirm Question",
  endQuestion: "End Question Period",
  studentResponsesTitle: "Student Responses",
  noResponses: "No responses yet",
  sessionLinkGenerating: "Generating...",
  questionStatusWaiting: "Waiting for question...",
  recording: "Recording...",
  processing: "Processing...",
  questionConfirmed: "Question confirmed: ",
  questionEnded: "Question period ended. ",
  waitingToStart: "Waiting to start...",
  backToDashboard: "Back to Dashboard",
  confirmQuestionFailed: "Failed to confirm question: ",
  endQuestionFailed: "Failed to end question period: ",
  fetchResponsesFailed: "Failed to fetch responses: ",
};

export const studentSession = {
  waitingForQuestion: "Waiting for teacher's question...",
  answerPlaceholder: "Enter answer..."
}

export const errorMessages = {
  startSessionFailed: "Failed to start the session:",
  startSessionError: "Error starting session:",
  viewStatsFailed: "Failed to load stats:",
  viewStatsError: "Error fetching stats:",
  viewLogsFailed: "Failed to load logs:",
  viewLogsError: "Error fetching logs:",
  logoutFailed: "Logout failed:",
  logoutError: "Logout failed due to network error:",
  noSessionFound: "No session found. Start a new session.",
  noSessionIdFound: "Please go back to the dashboard and start a new session or continue an existing one.",
};