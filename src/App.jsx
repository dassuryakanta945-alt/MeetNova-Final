import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import { NotificationProvider } from "./NotificationContext";

function App() {
  const [active, setActive] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const handleLandingTouchStart = (e) => {
  const target = e.target;

  if (
    target.closest("button") ||
    target.closest("a") ||
    target.closest("input") ||
    target.closest("textarea")
  ) {
    return;
  }

  e.currentTarget.classList.add("landing-touch");
};

const handleLandingTouchEnd = (e) => {
  e.currentTarget.classList.remove("landing-touch");
};


  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % 4);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    const dashboardSession = sessionStorage.getItem("meetnova-dashboard-session");

    if (user && dashboardSession === "active") {
      setShowDashboard(true);
      setShowLogin(false);
      setShowRegister(false);
    } else {
      setShowDashboard(false);
      setShowLogin(false);
      setShowRegister(false);
    }

    setAuthLoading(false);
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!activePanel) return;

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      setActivePanel(null);
    }
  };

  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("keydown", handleEscape);
  };
}, [activePanel]);

  const participants = [
    { name: "Alex", letter: "A" },
    { name: "Sam", letter: "S" },
    { name: "Rahul", letter: "R" },
    { name: "You", letter: "Y" },
  ];

  if (authLoading) {
  return <div className="auth-loading">Loading MeetNova...</div>;
}

  if (showRegister) {
  return (
    <NotificationProvider>
      <Register
        onLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}

      />
    </NotificationProvider>
  );
}
if (showLogin) {
  return (
    <NotificationProvider>
      <Login
        onRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onBack={() => setShowLogin(false)}
        onLogin={() => {
          sessionStorage.setItem("meetnova-dashboard-session", "active");
          setShowLogin(false);
          setShowRegister(false);
          setShowDashboard(true);
        }}
      />
    </NotificationProvider>
  );
}
if (showDashboard) {
  return (
    <Dashboard
      onLogout={() => {
        sessionStorage.removeItem("meetnova-dashboard-session");
        setShowDashboard(false);
        setShowLogin(true);
      }}
    />
  );
}

  return (
    <NotificationProvider>
    <div
  className="meetnova-page landing-page"
  onTouchStart={handleLandingTouchStart}
  onTouchEnd={handleLandingTouchEnd}
  onTouchCancel={handleLandingTouchEnd}
  >

      <header className="navbar">
        <div className="brand-box">
          <div className="brand-icon">
  <svg
    className="meetnova-logo-icon"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
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
          <span className="brand-name">MEETNOVA</span>
        </div>

        <nav className="nav-links">
          <a
            href="#about"
            onClick={(e) => {
             e.preventDefault();
             setActivePanel("about");
           }}
          >
           About
          </a>

          <a
           href="#features"
           onClick={(e) => {
            e.preventDefault();
            setActivePanel("features");
          }}
          >
           Features
          </a>

          <a
            href="#contact"
            onClick={(e) => {
             e.preventDefault();
             setActivePanel("contact");
           }}
          >
           Contact
          </a>

          <button
            className="login-button"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-content">

          <p className="welcome-text">
            WELCOME TO
          </p>

          <h1>MeetNova</h1>

          <p className="hero-subtitle">
            Connect. Stream. Communicate.
          </p>

          <div className="meeting-preview">

            <div className="meeting-top">

              <div className="meeting-title">
                <span className="camera-symbol">🎥</span>
                MeetNova Meeting
              </div>

              <div className="live-status">
                <span className="live-dot"></span>
                LIVE
              </div>

            </div>

            <div className="video-stage">

              {participants.map((person, index) => (
                <div
                  key={person.name}
                  className={`video-card ${
                    active === index
                      ? "active-speaker"
                      : "inactive-speaker"
                  }`}
                >

                  <div className="video-light"></div>

                  <div
                    className={`avatar ${
                      active === index
                        ? "speaking-avatar"
                        : ""
                    }`}
                  >
                    {person.letter}
                  </div>

                  <span className="participant-name">
                    {person.name}
                  </span>

                  {active === index && (
                    <div className="speaking-badge">
                      <span></span>
                      Speaking
                    </div>
                  )}

                </div>
              ))}

            </div>

            <div className="meeting-controls">
              <span className="control">🎤</span>
              <span className="control">🎥</span>
              <span className="control">🖥️</span>
              <span className="control">💬</span>
              <span className="control ai-control">🤖 AI</span>
            </div>

          </div>

          <div className="ai-status">
            <span className="ai-pulse"></span>
            AI Meeting Assistant is ready
          </div>

        </div>
      </main>
      {activePanel && (
        <div
          className="info-overlay"
          onClick={() => setActivePanel(null)}
        >
          <div
            className="info-container"
            role="dialog"
            aria-modal="true"
            aria-label={`${activePanel} information`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="info-close-button"
              onClick={() => setActivePanel(null)}
              aria-label="Close"
            >
              ×
            </button>

            {activePanel === "about" && (
  <div className="info-content">
    <span className="info-label">DISCOVER MEETNOVA</span>

    <h1>Where Every Conversation Creates Possibilities.</h1>

    <p>
      MeetNova is a modern digital meeting and collaboration
      platform designed to make online communication simple,
      accessible and organized.
    </p>

    <p>
      Our goal is to create a connected workspace where people
      can communicate, collaborate and manage their meetings
      through one seamless experience.
    </p>

    <div className="info-card-grid">
      <div className="info-card">
        <h2>🎯 Our Mission</h2>
        <p>
          To simplify online communication by creating a
          reliable and user-friendly meeting experience.
        </p>
      </div>

      <div className="info-card">
        <h2>🚀 Our Vision</h2>
        <p>
          To build a connected digital environment that
          brings people and ideas together.
        </p>
      </div>
    </div>
  </div>
)}

            {activePanel === "features" && (
  <div className="info-content">
    <span className="info-label">WHAT MEETNOVA OFFERS</span>

    <h1>Everything You Need for Better Collaboration.</h1>

    <p>
      Explore the tools designed to make your meeting
      experience more organized and convenient.
    </p>

    <div className="info-card-grid">

      <div className="info-card">
        <h2>🔐 Secure Authentication</h2>
        <p>
          Firebase-powered login and registration
          for managing your account securely.
        </p>
      </div>

      <div className="info-card">
        <h2>📅 Meeting Management</h2>
        <p>
          Organize and manage your meetings
          through your personalized workspace.
        </p>
      </div>

      <div className="info-card">
        <h2>⚡ Real-Time Updates</h2>
        <p>
          Stay updated with meeting information
          using Firebase Firestore.
        </p>
      </div>

      <div className="info-card">
        <h2>🎨 Personalized Dashboard</h2>
        <p>
          Access your workspace with a modern
          dashboard and theme customization.
        </p>
      </div>

      <div className="info-card">
        <h2>📱 Responsive Experience</h2>
        <p>
          Enjoy a flexible interface designed
          for desktop, tablet and mobile devices.
        </p>
      </div>

      <div className="info-card">
        <h2>👤 Personal Workspace</h2>
        <p>
          Access your account and manage your
          meeting-related activities in one place.
        </p>
      </div>

    </div>
  </div>
)}

            {activePanel === "contact" && (
  <div className="info-content">
    <span className="info-label">GET IN TOUCH</span>

    <h1>Let's Build Connections Together.</h1>

    <p>
      Have questions, ideas, suggestions or feedback about
      MeetNova? We would love to hear from you.
    </p>

    <div className="info-card-grid">
      <div className="info-card">
        <h2>💬 General Enquiries</h2>
        <p>
          For questions and general information about MeetNova.
        </p>
      </div>

      <div className="info-card">
        <h2>🤝 Feedback & Suggestions</h2>
        <p>
          Share your thoughts and ideas to help improve
          the MeetNova experience.
        </p>
      </div>
    </div>

    <div className="contact-note">
      Thank you for your interest in MeetNova.
      Official contact details will be announced soon.
    </div>
  </div>
)}
          </div>
        </div>
      )}

      {/* MEETNOVA FOOTER */}
      <footer className="meetnova-footer">

        <div className="footer-bottom">

          <p>
            © 2026 MeetNova. All Rights Reserved.
          </p>

          <p className="footer-credit">
            Built with <span>♥</span> by
            <strong> SURJYA</strong>
          </p>

        </div>

      </footer>

    </div>
    </NotificationProvider>
  );
}

export default App;