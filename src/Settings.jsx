import { useState, useEffect } from "react";
import "./Settings.css";

function Settings({ currentUser, theme, onThemeChange, onLogout }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    meetingReminders: true,
    meetingInvitations: true,
    messages: true,
    emailNotifications: false,
  });

  const [preferences, setPreferences] = useState({
    defaultDuration: "30",
    microphone: true,
    camera: true,
  });

  useEffect(() => {
    const savedNotifications = localStorage.getItem(
      "meetnova-notifications"
    );
    const savedPreferences = localStorage.getItem(
      "meetnova-preferences"
    );

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const sections = [
    { id: "profile", icon: "♙", label: "My Profile" },
    { id: "appearance", icon: "◐", label: "Appearance" },
    { id: "notifications", icon: "♧", label: "Notifications" },
    { id: "meetings", icon: "▣", label: "Meeting Preferences" },
    { id: "security", icon: "⌑", label: "Privacy & Security" },
    { id: "account", icon: "⚙", label: "Account Management" },
  ];

  const handleSave = () => {
    localStorage.setItem(
      "meetnova-notifications",
      JSON.stringify(notifications)
    );

    localStorage.setItem(
      "meetnova-preferences",
      JSON.stringify(preferences)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "MeetNova User";

  const email = currentUser?.email || "Email not available";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderToggle = (checked, onChange) => (
    <button
      type="button"
      className={`settings-toggle ${checked ? "active" : ""}`}
      onClick={onChange}
      aria-pressed={checked}
    >
      <span />
    </button>
  );

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          
          <h1>Settings</h1>
          <p>Manage your account and customize your MeetNova experience.</p>
        </div>

        <button className="settings-save-btn" onClick={handleSave}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="settings-layout">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <div className="settings-nav-title">GENERAL</div>

          {sections.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item ${
                activeSection === section.id ? "selected" : ""
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="settings-nav-icon">
                {section.icon}
              </span>

              {section.label}

              {activeSection === section.id && (
                <span className="settings-nav-arrow">›</span>
              )}
            </button>
          ))}

          <div className="settings-sidebar-profile">
            <div className="settings-avatar small">
              {initials}
            </div>

            <div>
              <strong>{displayName}</strong>
              <span>Personal Account</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="settings-content">

          {/* PROFILE */}
          {activeSection === "profile" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <h2>My Profile</h2>
                <p>Your personal account information.</p>
              </div>

              <div className="settings-card">
                <div className="profile-cover">
                  <div className="settings-avatar large">
                    {initials}
                  </div>
                </div>

                <div className="profile-information">
                  <h3>{displayName}</h3>
                  <p>{email}</p>
                  <span className="profile-badge">
                    ✓ MeetNova Account
                  </span>
                </div>
              </div>

              <div className="settings-card">
                <h3>Personal Information</h3>

                <div className="settings-field-grid">
                  <div className="settings-field">
                    <label>Full Name</label>
                    <input value={displayName} readOnly />
                  </div>

                  <div className="settings-field">
                    <label>Email Address</label>
                    <input value={email} readOnly />
                  </div>

                  <div className="settings-field">
                    <label>Account ID</label>
                    <input
                      value={currentUser?.uid || "Unavailable"}
                      readOnly
                    />
                  </div>

                  <div className="settings-field">
                    <label>Account Provider</label>
                    <input
                      value={
                        currentUser?.providerData?.[0]?.providerId ||
                        "Firebase Authentication"
                      }
                      readOnly
                    />
                  </div>
                </div>

                <p className="settings-note">
                  Your profile information is currently managed through
                  your authentication account.
                </p>
              </div>
            </section>
          )}

          {/* APPEARANCE */}
          {activeSection === "appearance" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <h2>Appearance</h2>
                <p>Customize how MeetNova looks on your device.</p>
              </div>

              <div className="settings-card">
                <h3>Interface Theme</h3>
                <p className="settings-description">
                  Choose your preferred application appearance.
                </p>

                <div className="theme-options">
                  <button
                    className={`theme-option ${
                      theme === "light" ? "active" : ""
                    }`}
                    onClick={() => onThemeChange("light")}
                  >
                    <div className="theme-preview light-preview">
                      <div />
                      <div />
                      <div />
                    </div>

                    <strong>Light Mode</strong>
                    <span>
                      {theme === "light" ? "✓ Selected" : "Clean and bright"}
                    </span>
                  </button>

                  <button
                    className={`theme-option ${
                      theme === "dark" ? "active" : ""
                    }`}
                    onClick={() => onThemeChange("dark")}
                  >
                    <div className="theme-preview dark-preview">
                      <div />
                      <div />
                      <div />
                    </div>

                    <strong>Dark Mode</strong>
                    <span>
                      {theme === "dark" ? "✓ Selected" : "Easy on the eyes"}
                    </span>
                  </button>
                </div>

                <p className="settings-note">
                  Your theme preference is automatically saved.
                </p>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <h2>Notifications</h2>
                <p>Control which notifications you want to receive.</p>
              </div>

              <div className="settings-card">
                <h3>Notification Preferences</h3>

                {[
                  {
                    key: "meetingReminders",
                    title: "Meeting Reminders",
                    description: "Get reminders before your meetings.",
                  },
                  {
                    key: "meetingInvitations",
                    title: "Meeting Invitations",
                    description: "Stay informed about new invitations.",
                  },
                  {
                    key: "messages",
                    title: "New Messages",
                    description: "Get notified when someone messages you.",
                  },
                  {
                    key: "emailNotifications",
                    title: "Email Notifications",
                    description: "Receive updates through email.",
                  },
                ].map((item) => (
                  <div className="settings-option-row" key={item.key}>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>

                    {renderToggle(
                      notifications[item.key],
                      () => toggleNotification(item.key)
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* MEETING PREFERENCES */}
          {activeSection === "meetings" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <h2>Meeting Preferences</h2>
                <p>Set your default meeting experience.</p>
              </div>

              <div className="settings-card">
                <h3>Default Meeting Settings</h3>

                <div className="settings-field">
                  <label>Default Meeting Duration</label>

                  <select
                    value={preferences.defaultDuration}
                    onChange={(e) =>
                      updatePreference("defaultDuration", e.target.value)
                    }
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                    <option value="90">90 Minutes</option>
                  </select>
                </div>

                <div className="settings-option-row">
                  <div>
                    <h4>Microphone by Default</h4>
                    <p>Enable your microphone when joining meetings.</p>
                  </div>

                  {renderToggle(
                    preferences.microphone,
                    () =>
                      updatePreference(
                        "microphone",
                        !preferences.microphone
                      )
                  )}
                </div>

                <div className="settings-option-row">
                  <div>
                    <h4>Camera by Default</h4>
                    <p>Enable your camera when joining meetings.</p>
                  </div>

                  {renderToggle(
                    preferences.camera,
                    () =>
                      updatePreference(
                        "camera",
                        !preferences.camera
                      )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <h2>Privacy & Security</h2>
                <p>Information about your account protection.</p>
              </div>

              <div className="settings-card">
                <div className="security-status">
                  <span className="security-icon">✓</span>

                  <div>
                    <h3>Account Authentication</h3>
                    <p>
                      Your account is managed through Firebase
                      Authentication.
                    </p>
                  </div>
                </div>

                <div className="security-detail">
                  <span>Registered Email</span>
                  <strong>{email}</strong>
                </div>

                <div className="security-detail">
                  <span>Authentication Provider</span>
                  <strong>
                    {currentUser?.providerData?.[0]?.providerId ||
                      "Firebase"}
                  </strong>
                </div>

                <div className="security-detail">
                  <span>Email Verification</span>
                  <strong>
                    {currentUser?.emailVerified
                      ? "Verified"
                      : "Not verified"}
                  </strong>
                </div>
              </div>
            </section>
          )}

          {/* ACCOUNT */}
          {activeSection === "account" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <h2>Account Management</h2>
                <p>Manage your MeetNova account.</p>
              </div>

              <div className="settings-card">
                <h3>Account Information</h3>

                <div className="security-detail">
                  <span>Account Name</span>
                  <strong>{displayName}</strong>
                </div>

                <div className="security-detail">
                  <span>Email</span>
                  <strong>{email}</strong>
                </div>

                <div className="security-detail">
                  <span>Account Status</span>
                  <strong className="account-active">
                    ● Active
                  </strong>
                </div>
              </div>

              <div className="settings-card danger-card">
                <h3>Sign Out</h3>

                <p className="settings-description">
                  Sign out of your current MeetNova account on this device.
                </p>

                <button
                  className="settings-logout-btn"
                  onClick={() => {
                    if (onLogout) onLogout();
                  }}
                  disabled={!onLogout}
                >
                  ⇥ Log Out
                </button>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}

export default Settings;