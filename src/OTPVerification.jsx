import { useRef, useState } from "react";
import "./OTPVerification.css";

function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const [error, setError] = useState("");
const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
  if (!/^\d?$/.test(value)) {
    return;
  }

  const newOtp = [...otp];
  newOtp[index] = value;

  setOtp(newOtp);

  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};

const handleOtpKeyDown = (e, index) => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");

    if (!otp.join("").trim()) {
  setError("Please enter the verification code.");
  return;
}

    // Add OTP verification logic here
  };

  return (
    <div className="otp-page">
      <div className="otp-card">
        <div className="otp-logo">
          <span>🎥</span>
        </div>

        <h1>VERIFY YOUR EMAIL</h1>

        <p className="otp-subtitle">
          Enter the verification code sent to your email.
        </p>
        <div className="otp-inputs">
  {otp.map((digit, index) => (
    <input
      key={index}
      ref={(element) => {
        inputRefs.current[index] = element;
      }}
      type="text"
      inputMode="numeric"
      maxLength="1"
      value={digit}
      onChange={(e) => handleOtpChange(e.target.value, index)}
      onKeyDown={(e) => handleOtpKeyDown(e, index)}
      aria-label={`OTP digit ${index + 1}`}
    />
  ))}
</div>
      </div>
    </div>
  );
}

export default OTPVerification;