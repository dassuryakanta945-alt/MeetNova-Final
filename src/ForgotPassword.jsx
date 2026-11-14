import { useState } from "react";
import { useNotification } from "./NotificationContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import "./ForgotPassword.css";


function ForgotPassword({ onBack }) {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleContinue = async () => {
    const emailValue = email.trim();

    setEmailError("");

    if (!emailValue) {
      setEmailError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    console.log("Valid email:", emailValue);

    try {
      const actionCodeSettings = {
      url: "https://meetnova-9a907.web.app/?reset=success",
      handleCodeInApp: false,
};
  await sendPasswordResetEmail(auth, emailValue);

  console.log("Password reset email sent");
  showNotification(
  "success",
  "Password reset email sent! Please check your email spam list."
);

} catch (error) {
  console.error("Password reset failed:", error);

  setEmailError("Unable to send password reset email. Please try again.");
}
  };

  return (
    <div className="forgot-password-panel">
      {/* OFFICIAL MEETNOVA LOGO */}

<div className="forgot-logo">
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

      <h1>FORGOT PASSWORD</h1>

      <p className="forgot-subtitle">
        Enter your registered email to continue.
      </p>

      <div className="forgot-form">
        <label>Email Address</label>

        <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
       />
       {emailError && (
       <p className="forgot-email-error">{emailError}</p>
    )}

        <button
          type="button"
          className="forgot-continue-button"
          onClick={handleContinue}
        >
         Continue
        </button>

        <button
          type="button"
          className="forgot-back"
          onClick={onBack}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;