import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./Login.css";
import ForgotPassword from "./ForgotPassword";
import { auth } from "./firebase";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNotification } from "./NotificationContext";


function Login({ onRegister, onBack, onLogin }) {
  const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const userCredential = await signInWithPopup(auth, provider);

    await ensureUserProfile(userCredential.user);

    showNotification("success", "Google login successful!");
    onLogin();
  } catch (error) {
    showNotification("error", "Google login failed. Please try again.");
  }
};
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { showNotification } = useNotification();

const ensureUserProfile = async (firebaseUser) => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const publicProfileRef = doc(db, "publicProfiles", firebaseUser.uid);

  const [userSnap, publicProfileSnap] = await Promise.all([
    getDoc(userRef),
    getDoc(publicProfileRef),
  ]);

  const displayName =
    userSnap.data()?.name ||
    firebaseUser.displayName ||
    firebaseUser.email?.split("@")[0] ||
    "MeetNova User";

  // Existing user profile ko overwrite nahi karna.
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: displayName,
      email: firebaseUser.email,
    });
  }

  // Existing public profile ko bhi overwrite nahi karna.
  if (!publicProfileSnap.exists()) {
    await setDoc(publicProfileRef, {
      uid: firebaseUser.uid,
      name: displayName,
    });
  }
};

  const handleLogin = async (e) => {
  e.preventDefault();

  setError("");

  if (!email.trim()) {
  setError("Please enter your email or username.");
  return;
}
const loginEmail = email.trim();


  if (!password) {
    setError("Please enter your password.");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  try {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    loginEmail,
    password
  );
  
  await ensureUserProfile(userCredential.user);


  showNotification("Login successful! Welcome back to MeetNova.");
  onLogin();
} catch (error) {
  setError("Invalid email or password.");
}

};

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
  return (
  <div className="login-page">

    <div className="login-split-layout">

      {/* LEFT — AI MEETING ANIMATION */}
      <div className="login-ai-section">
        <div className="ai-meeting-frame">

          <div className="ai-meeting-header">
            <span className="ai-live-dot"></span>
            <span>MeetNova AI Meeting</span>
          </div>

          <div className="ai-meeting-stage">

            <div className="meeting-person person-one">
              <div className="person-avatar">A</div>
              <span>Alex</span>
            </div>

            <div className="meeting-person person-two">
              <div className="person-avatar">S</div>
              <span>Sam</span>
            </div>

            <div className="meeting-person person-three">
              <div className="person-avatar">R</div>
              <span>Rahul</span>
            </div>

            <div className="meeting-person person-four">
              <div className="person-avatar">S</div>
              <span>Surya</span>
            </div>

            <div className="ai-assistant">
              <div className="ai-core">
                <span>✦</span>
              </div>

              <strong>MeetNova AI</strong>
              <small>Listening & assisting</small>
            </div>

          </div>

          <div className="ai-meeting-status">
            <span>●</span>
            AI Assistant is active
          </div>

        </div>
      </div>

      {/* RIGHT — EXISTING LOGIN */}
      <div className="login-form-section">
      {showForgotPassword ? (
  <ForgotPassword
    onBack={() => setShowForgotPassword(false)}
  />
) : (
      <div className={`login-card ${showForgotPassword ? "slide-out" : ""}`}>
        
          <button
            type="button"
            className="back-button"
            onClick={onBack}
            aria-label="Back"
          >
            ←
          </button>
        {/* LOGO - EXISTING DESKTOP + OFFICIAL MOBILE */}

<div className="login-logo login-camera-logo">
  <span className="login-camera-icon"></span>
</div>

<div className="login-logo login-official-logo">
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="38"
    height="38"
  >
    <path
      d="M7 35V13L20 27L27 19V35"
      stroke="white"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M21 35V13L40 35V13"
      stroke="#DDD6FE"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>

        {/* HEADING */}
        <h1>WELCOME BACK</h1>

        <p className="login-subtitle">
          Stream, connect and share in real time
        </p>

        {/* EMAIL */}
        <div className="login-field">
          <label>Email Address / Username</label>

          <input
  type="text"
  placeholder="Enter your email or username"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    setError("");
  }}
/>
        </div>

        {/* PASSWORD */}
        <div className="login-field">
          <label>Password</label>

          <div className="password-wrapper">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 3 18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a18.3 18.3 0 0 1-3.2 4.5" />
                  <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8c1.4 0 2.7-.3 3.9-.8" />
                </svg>
              )}
            </button>

          </div>
        </div>
        {error && (
  <p className="login-error">
    {error}
  </p>
)}

        {/* FORGOT PASSWORD */}
        <button
          type="button"
          className="forgot-password"
          onClick={() => {
            setShowForgotPassword(true);
            setError("");
          }}
        >
          Forgot Password?
        </button>

        {/* SIGN IN */}
        <button
          type="button"
          className="signin-button"
          onClick={handleLogin}
        >
          Sign In

        </button>

        {/* SOCIAL LOGIN */}
<div className="login-divider">
  <span>or continue with</span>
</div>

<div className="social-login-row">

  {/* GOOGLE */}
  <button
    type="button"
    className="google-button"
    onClick={handleGoogleLogin}
  >
    <svg
      className="google-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.29V6.62H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.58 1.81l3.43-3.43C17.94 1.17 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4 3.09C5.23 6.87 7.88 4.76 12 4.76z"
      />
    </svg>

  </button>
</div>

        {/* REGISTER */}
        <p className="register-text">
          Don't have an account?

          <button
            type="button"
            className="register-link"
            onClick={onRegister}
          >
            Register here
          </button>
        </p>

          </div>
      )}
      </div>
    </div>
  </div>
  );
}

export default Login;