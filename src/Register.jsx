import { useState } from "react";
import "./Register.css";
import "./Login.css";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, writeBatch } from "firebase/firestore";
import { useNotification } from "./NotificationContext";


const TOTAL_REGISTER_STEPS = 3;

function Register({ onLogin }) {
  const { showNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = async () => {
    setError("");

    const usernameValue = username.trim();

    if (!usernameValue) {
      setError("Please enter your username.");
      return;
    }

    if (usernameValue.length < 3 || usernameValue.length > 20) {
      setError("Username must be 3-20 characters.");
      return;
    }
    if (
  !/^[A-Za-z0-9_]+$/.test(usernameValue) ||
  !/[0-9_]/.test(usernameValue)
) {
  setError("Please enter a valid username.");
  return;
  }


    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    const emailValue = email.trim();
    if (!emailValue) {
      setError("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError("Please enter a valid email address.");
      return;
    }

    setCurrentStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    const usernameValue = username.trim();

    if (usernameValue.length < 3 || usernameValue.length > 20) {
      setError("Please enter a valid username.");
      return;
    }
    if (
  !/^[A-Za-z0-9_]+$/.test(usernameValue) ||
  !/[0-9_]/.test(usernameValue)
) {
  setError("Please enter a valid username.");
  return;
  } 

    

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 8) {
  setError("Password must be at least 8 characters.");
  return;
}
    try {
      const userCredential = await createUserWithEmailAndPassword(
  auth,
  email.trim(),
  password
);

const batch = writeBatch(db);

batch.set(
  doc(db, "usernames", username.trim().toLowerCase()),
  {
    uid: userCredential.user.uid,
    username: username.trim(),
    email: userCredential.user.email,
  }
);

batch.set(
  doc(db, "users", userCredential.user.uid),
  {
    name: username.trim(),
    email: userCredential.user.email,
  }
);

batch.set(
  doc(db, "publicProfiles", userCredential.user.uid),
  {
    uid: userCredential.user.uid,
    name: username.trim(),
  }
);

try {
  await batch.commit();
} catch (firestoreError) {
  try {
    await deleteUser(userCredential.user);
  } catch (rollbackError) {
    console.error("Registration rollback failed:", rollbackError);
  }

  throw firestoreError;
}

setError("");
showNotification("Registration successful! Welcome to MeetNova.");
onLogin();
    } catch (error) {
  if (error.code === "auth/email-already-in-use") {
  setEmailError("This email is already registered. Please sign in instead.");
  setError("This email is already registered. Please sign in instead.");
  return;
}

  setError("Unable to create your account. Please try again.");
}
  };

  return (
    <div className="register-page">
      <div className="register-split-layout">
        <div className="register-ai-section">
          <div className="ai-meeting-frame">
            {/* LEFT — AI MEETING ANIMATION */}

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

        <div className="register-form-section">
          <div className="register-card">
            {/* LOGO */}
            {/* OFFICIAL MEETNOVA LOGO */}

<div className="register-logo">
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
            <h1>CREATE ACCOUNT</h1>

            <p className="register-subtitle">
              Join MeetNova to Stream and chat
            </p>
            {currentStep === 1 && (
              <div className="register-field">
                <label>USERNAME</label>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="username-notice"
                />
                {error && (
                 <p className="register-error">{error}</p>
                )}
                <p className="username-notice">
                  <span className="info-icon">i</span>
                  Username: 3-20 characters, letters, numbers, and underscore (_) only.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="register-field">
                <label>EMAIL ADDRESS</label>

                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                />
                {emailError && (
                 <p className="register-error">{emailError}</p>
                )}

                {error && (
                 <p className="register-error">{error}</p>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="register-field">
                <label>PASSWORD</label>

                <div className="register-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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

                <p className="password-notice">
                  <span className="info-icon">i</span>
                  Password must be at least 8 characters. Letters, numbers, and symbols are allowed.
                </p>
                {error && (
                <p className="register-error">{error}</p>
            )}
            </div>
            )}


            {/* CREATE ACCOUNT */}
            <button
              type="button"
              className="create-account-button"
              onClick={currentStep < 3 ? handleNextStep : handleRegister}
            >
              {currentStep < 3 ? "Continue" : "Create account"}
            </button>

            {/* LOGIN */}
            <p className="login-text">
              Already have an account?

              <button type="button" className="login-link" onClick={onLogin}>
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;