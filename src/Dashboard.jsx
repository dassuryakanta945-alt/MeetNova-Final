import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";

import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  Video,
  Plus,
  ArrowRight,
  CalendarClock,
  CalendarCheck,
} from "lucide-react";

import { db, auth, rtdb } from "./firebase";
import CalendarPage from "./CalendarPage";
import TeamPage from "./TeamPage";
import MessagesPage from "./MessagesPage";
import AIAssistance from "./AIAssistance";
import MeetingHistory from "./MeetingHistory";
import Analytics from "./Analytics";
import Settings from "./Settings";
import ProfilePage from "./ProfilePage";
import MeetingRoom from "./MeetingRoom";

const menuItems = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "meetings", label: "Meetings", icon: "▣" },
  { id: "calendar", label: "Calendar", icon: "▦" },
  { id: "team", label: "Team", icon: "♧" },
  { id: "messages", label: "Messages", icon: "✉" },
  { id: "assistant", label: "AI Assistant", icon: "✦" },
  { id: "history", label: "Meeting History", icon: "◷" },
  { id: "analytics", label: "Analytics", icon: "▥" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState(() => {
  return localStorage.getItem("meetnova-active-page") || "home";
});
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [isMeetingMinimized, setIsMeetingMinimized] = useState(false);
  const [scheduleRequest, setScheduleRequest] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("meetnova-theme") || "dark";
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("meetnova-theme", theme);
  }, [theme]);

  useEffect(() => {
  localStorage.setItem("meetnova-active-page", activePage);
}, [activePage]);


  const handleNavigation = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  useEffect(() => {
    console.log("Current dashboard page:", activePage);
  }, [activePage]);

  const handleLogout = () => {
  setShowLogoutModal(true);
};
// Mobile Back Button Handling
const activePageRef = useRef(activePage);
const navigationRef = useRef(handleNavigation);
const logoutRef = useRef(handleLogout);

activePageRef.current = activePage;
navigationRef.current = handleNavigation;
logoutRef.current = handleLogout;

useEffect(() => {
  const isMobile = () =>
    window.matchMedia("(max-width: 700px)").matches;

  const pushBackGuard = () => {
    if (isMobile()) {
      window.history.pushState(
        { meetNovaBackGuard: true },
        "",
        window.location.href
      );
    }
  };

  pushBackGuard();

  const handleMobileBack = () => {
    if (!isMobile()) return;

    pushBackGuard();

    if (activePageRef.current !== "home") {
      navigationRef.current("home");
    } else {
      logoutRef.current();
    }
  };

  window.addEventListener("popstate", handleMobileBack);

  return () => {
    window.removeEventListener("popstate", handleMobileBack);
  };
}, []);

  return (
    <div className={`dashboard ${theme}-theme`}>

      {/* MeetNova Logout Confirmation */}
{showLogoutModal && (
  <div
    className="logout-modal-overlay"
    onClick={() => setShowLogoutModal(false)}
  >
    <div
      className="logout-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="logout-modal-icon">
        ↪
      </div>

      <span className="logout-modal-brand">MEETNOVA</span>

      <h2 id="logout-modal-title">Ready to leave?</h2>

      <p>
        Are you sure you want to log out of your MeetNova account?
      </p>

      <div className="logout-modal-actions">
        <button
          type="button"
          className="logout-cancel-btn"
          onClick={() => setShowLogoutModal(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="logout-confirm-btn"
          onClick={onLogout}
        >
          Yes, Logout
        </button>
      </div>
    </div>
  </div>
)}
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="dashboard-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          collapsed ? "sidebar-collapsed" : ""
        } ${mobileOpen ? "mobile-sidebar-open" : ""}`}
      >
        {/* Logo */}
        <div className="dashboard-brand">
          <div className="dashboard-brand-logo">
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

          <span className="dashboard-brand-name">
            MEETNOVA
          </span>
        </div>

        {/* Collapse */}
        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "›" : "‹"}
        </button>

        {/* Navigation */}
        <nav className="dashboard-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`dashboard-nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.id)}
            >
              <span className="nav-item-icon">
                {item.icon}
              </span>

              <span className="nav-item-label">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom Area */}
        <div className="sidebar-bottom">
          {/* Theme Switcher */}
          <div className="theme-switcher">
            <button
              className={theme === "light" ? "selected" : ""}
              onClick={() => setTheme("light")}
            >
              ☀
              <span>Light</span>
            </button>

            <button
              className={theme === "dark" ? "selected" : ""}
              onClick={() => setTheme("dark")}
            >
              ◐
              <span>Dark</span>
            </button>
          </div>

          {/* Profile */}
          <button
            className="sidebar-profile"
            onClick={() => handleNavigation("profile")}
          >
            <div className="profile-avatar">
             <svg
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
             >
               <circle cx="12" cy="8" r="4" />
               <path d="M5 21a7 7 0 0 1 14 0" />
              </svg>
            </div>

            <div className="profile-info">
              <strong>Profile</strong>
              <span>MeetNova Account</span>
            </div>

            <span className="profile-arrow">›</span>
          </button>

          {/* Logout */}
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="nav-item-icon">↪</span>
            <span className="nav-item-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {/* Mobile Header */}
        <header className="mobile-dashboard-header">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>

          <div className="mobile-brand">
            <div className="mobile-brand-logo">
  <svg
    className="meetnova-logo-icon"
    width="38"
    height="38"
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
            <span>MeetNova</span>
          </div>

          <button
  type="button"
  className="mobile-profile-mini"
  onClick={() => handleNavigation("profile")}
  aria-label="Open Profile"
>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </svg>
</button>
        </header>

        {/* Page Content */}
        <section className="dashboard-content">
  {activePage === "home" && (
    <HomePage
      onMeetingCreated={(meeting) => {
        setIsMeetingMinimized(false);
        setActiveMeeting(meeting);
      }}
      openScheduleRequest={scheduleRequest}
      onScheduleRequestHandled={() => setScheduleRequest(false)}
    />
  )}

  {activePage === "meetings" && (
    <MeetingsPage
      userId={auth.currentUser?.uid}
      onMeetingJoined={(meeting) => {
        setIsMeetingMinimized(false);
        setActiveMeeting(meeting);
      }}
    />
  )}

  {activePage === "calendar" && (
    <CalendarPage
      onScheduleMeeting={() => {
        setActivePage("home");
        setScheduleRequest(true);
      }}
    />
  )}

  {activePage === "team" && <TeamPage />}
  {activePage === "messages" && <MessagesPage />}
  {activePage === "assistant" && <AIAssistance />}

  {activePage === "history" && (
    <MeetingHistory userId={auth.currentUser?.uid} />
  )}

  {activePage === "analytics" && (
    <Analytics currentUserId={auth.currentUser?.uid} />
  )}

  {activePage === "settings" && (
    <Settings
      currentUser={auth.currentUser}
      theme={theme}
      onThemeChange={setTheme}
      onLogout={onLogout}
    />
  )}

  {activePage === "profile" && (
    <ProfilePage currentUser={auth.currentUser} />
  )}

  {activePage !== "home" &&
    activePage !== "meetings" &&
    activePage !== "calendar" &&
    activePage !== "team" &&
    activePage !== "messages" &&
    activePage !== "assistant" &&
    activePage !== "history" &&
    activePage !== "analytics" &&
    activePage !== "settings" &&
    activePage !== "profile" && (
      <div className="dashboard-placeholder">
        <span className="placeholder-icon">
          {menuItems.find((item) => item.id === activePage)?.icon || "◉"}
        </span>

        <h1>
          {menuItems.find((item) => item.id === activePage)?.label}
        </h1>

        <p>This section will be built next.</p>
      </div>
    )}
</section>
      </main>

      {/* Active Meeting Window */}
      {activeMeeting && (
        <MeetingRoom
          meeting={activeMeeting}
          isMinimized={isMeetingMinimized}
          onMinimizeChange={setIsMeetingMinimized}
          onLeave={() => {
            setActiveMeeting(null);
            setIsMeetingMinimized(false);
          }}
        />
      )}
    </div>
  );
}


function HomePage({
  onMeetingCreated,
  openScheduleRequest,
  onScheduleRequestHandled,
}) {
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [showJoinMeeting, setShowJoinMeeting] = useState(false);
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [highlightScheduleButton, setHighlightScheduleButton] = useState(false);
  useEffect(() => {
  if (openScheduleRequest) {
    setShowScheduleMeeting(true);
    onScheduleRequestHandled();
  }
}, [openScheduleRequest, onScheduleRequestHandled]);
useEffect(() => {
  if (!highlightScheduleButton) return;

  const timer = setTimeout(() => {
    setHighlightScheduleButton(false);
  }, 3000);

  return () => clearTimeout(timer);
}, [highlightScheduleButton]);
  const [upcomingMeeting, setUpcomingMeeting] = useState(null);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [completedMeetingsCount, setCompletedMeetingsCount] = useState(0);
  const [totalMeetingHours, setTotalMeetingHours] = useState(0);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [recentMeetings, setRecentMeetings] = useState([]);

  const [scheduleForm, setScheduleForm] = useState({
  title: "",
  date: "",
  time: "",
  duration: "",
  description: "",
});


useEffect(() => {
  const loadUpcomingMeeting = async () => {
    try {
      setLoadingUpcoming(true);

      const snapshot = await getDocs(collection(db, "meetings"));
      const now = new Date();

      const upcoming = snapshot.docs
        .map((meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        }))
        .filter((meeting) => {
          if (
            meeting.status !== "scheduled" ||
            !meeting.date ||
            !meeting.startTime
          ) {
            return false;
          }

          const meetingDateTime = new Date(
            `${meeting.date}T${meeting.startTime}`
          );

          return (
            !Number.isNaN(meetingDateTime.getTime()) &&
            meetingDateTime >= now
          );
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA - dateB;
        });

      setUpcomingMeeting(upcoming[0] || null);
    } catch (error) {
      console.error("Error loading upcoming meeting:", error);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  loadUpcomingMeeting();
}, []);

useEffect(() => {
  const loadCompletedMeetings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "meetings"));

      const completedMeetings = snapshot.docs
        .map((meetingDoc) => meetingDoc.data())
        .filter((meeting) => meeting.status === "completed");

      setCompletedMeetingsCount(completedMeetings.length);

      const totalMinutes = completedMeetings.reduce(
        (total, meeting) => total + (Number(meeting.duration) || 0),
        0
      );

      setTotalMeetingHours(
        Math.round((totalMinutes / 60) * 100) / 100
      );
    } catch (error) {
      console.error("Error loading completed meetings:", error);
    }
  };

  loadCompletedMeetings();
}, []);

useEffect(() => {
  const loadTeamMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "meetings"));
      const uniqueMembers = new Set();

      snapshot.docs.forEach((meetingDoc) => {
        const meeting = meetingDoc.data();

        if (Array.isArray(meeting.participantIds)) {
          meeting.participantIds.forEach((memberId) => {
            if (memberId) {
              uniqueMembers.add(memberId);
            }
          });
        }
      });

      setTeamMembersCount(uniqueMembers.size);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  loadTeamMembers();
}, []);

useEffect(() => {
  const loadRecentMeetings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "meetings"));

      const completedMeetings = snapshot.docs
        .map((meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        }))
        .filter((meeting) => meeting.status === "completed")
        .sort((a, b) => {
          const dateA = new Date(
            `${a.date || "1970-01-01"}T${a.startTime || "00:00"}`
          );
          const dateB = new Date(
            `${b.date || "1970-01-01"}T${b.startTime || "00:00"}`
          );
          return dateB - dateA;
        })
        .slice(0, 5);

      setRecentMeetings(completedMeetings);
    } catch (error) {
      console.error("Error loading recent meetings:", error);
    }
  };

  loadRecentMeetings();
}, []);

  const createInstantMeeting = async () => {
  if (!auth.currentUser) {
    console.error("Please log in before creating a meeting.");
    return;
  }

  try {
    setCreatingMeeting(true);

    const meetingRef = await addDoc(collection(db, "meetings"), {
      title: "Instant Meeting",
      description: "Instant MeetNova meeting",
      status: "live",
      createdBy: auth.currentUser.uid,
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toTimeString().slice(0, 5),
      duration: 0,
      participantIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    onMeetingCreated({
      id: meetingRef.id,
      title: "Instant Meeting",
      status: "live",
    });
  } catch (error) {
    console.error("Error creating instant meeting:", error);
  } finally {
    setCreatingMeeting(false);
  }
};
    const joinExistingMeeting = async () => {
    const meetingId = joinMeetingId.trim();

    if (!meetingId) {
      return;
    }

    try {
      const meetingRef = collection(db, "meetings");
      const snapshot = await getDocs(meetingRef);

      const meetingDoc = snapshot.docs.find(
        (doc) => doc.id === meetingId
      );

      if (!meetingDoc) {
        alert("Invalid Meeting ID. Please check and try again.");
        return;
      }

      const meeting = {
        id: meetingDoc.id,
        ...meetingDoc.data(),
      };

      onMeetingCreated(meeting);
      setShowJoinMeeting(false);
      setJoinMeetingId("");
    } catch (error) {
      console.error("Error joining meeting:", error);
      alert("Unable to join meeting. Please try again.");
    }
  };

  const scheduleNewMeeting = async () => {
  if (!scheduleForm.title.trim()) {
    alert("Please enter meeting title.");
    return;
  }

  if (!scheduleForm.date) {
    alert("Please select a meeting date.");
    return;
  }

  if (!scheduleForm.time) {
    alert("Please select a meeting time.");
    return;
  }

  if (!scheduleForm.duration || Number(scheduleForm.duration) <= 0) {
    alert("Please enter a valid meeting duration.");
    return;
  }

  try {
    const meetingRef = await addDoc(collection(db, "meetings"), {
      title: scheduleForm.title.trim(),
      description: scheduleForm.description.trim(),
      status: "scheduled",
      createdBy: auth.currentUser.uid,
      date: scheduleForm.date,
      startTime: scheduleForm.time,
      duration: Number(scheduleForm.duration),
      participantIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Scheduled meeting created:", meetingRef.id);

    setScheduleForm({
      title: "",
      date: "",
      time: "",
      duration: "",
      description: "",
    });

    setShowScheduleMeeting(false);
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    alert("Unable to schedule meeting. Please try again.");
  }
};

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <h1>
            Good Morning, User <span>👋</span>
          </h1>
          <p>Ready to connect, collaborate and get things done?</p>
        </div>

        <div className="home-date">
          <span>Today</span>
          <strong>
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Quick Actions</h2>
          <p>Start your next meeting quickly.</p>
        </div>
      </div>

      <div className="quick-actions">
        <button
          className="quick-action primary"
          onClick={createInstantMeeting}
          disabled={creatingMeeting}
        >
          <span className="quick-action-icon">
  <Video size={23} strokeWidth={1.8} />
  <Plus className="icon-badge" size={12} strokeWidth={2} />
</span>
          <div>
            <strong>{creatingMeeting ? "Starting..." : "New Meeting"}</strong>
            <small>Create a new meeting</small>
          </div>
        </button>

        <button
          className="quick-action"
          onClick={() => setShowJoinMeeting(true)}
        >
          <span className="quick-action-icon">
  <Video size={23} strokeWidth={1.8} />
  <ArrowRight className="icon-badge" size={12} strokeWidth={2} />
</span>
          <div>
            <strong>Join Meeting</strong>
            <small>Join with meeting ID</small>
          </div>
        </button>

        <button
          className={`quick-action ${highlightScheduleButton ? "schedule-button-highlight" : ""}`}
          onClick={() => setShowScheduleMeeting(true)}
        >
          <span className="quick-action-icon">
  <CalendarClock size={23} strokeWidth={1.8} />
</span>
          <div>
            <strong>Schedule Meeting</strong>
            <small>Plan a future meeting</small>
          </div>
        </button>
      </div>

      {showJoinMeeting && (
        <div className="join-meeting-panel">
          <div className="join-meeting-header">
            <div>
              <span>JOIN MEETING</span>
              <h3>Enter Meeting ID</h3>
            </div>

            <button
              type="button"
              onClick={() => setShowJoinMeeting(false)}
            >
              ×
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter meeting ID"
            value={joinMeetingId}
            onChange={(e) => setJoinMeetingId(e.target.value)}
          />

          <button type="button" onClick={joinExistingMeeting}>
            Join Meeting
          </button>
        </div>
      )}

      {showScheduleMeeting && (
        <div className="join-meeting-panel schedule-meeting-panel">
          <div className="join-meeting-header">
            <div>
              <span>SCHEDULE MEETING</span>
              <h3>Plan a Future Meeting</h3>
            </div>

            <button
              type="button"
              onClick={() => setShowScheduleMeeting(false)}
            >
              ×
            </button>
          </div>

          <input
            type="text"
            placeholder="Meeting title"
            value={scheduleForm.title}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                title: e.target.value,
              })
            }
          />

          <input
            type="date"
            value={scheduleForm.date}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                date: e.target.value,
              })
            }
          />

          <input
            type="time"
            value={scheduleForm.time}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                time: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Duration in minutes"
            min="1"
            value={scheduleForm.duration}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                duration: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Meeting description"
            rows="3"
            value={scheduleForm.description}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                description: e.target.value,
              })
            }
          />

          <button type="button" onClick={scheduleNewMeeting}>
            Schedule Meeting
          </button>
        </div>
      )}

      <div className="section-heading next-heading">
        <div>
          <h2>Next Meeting</h2>
          <p>Your closest upcoming meeting.</p>
        </div>
      </div>

      <div className="next-meeting-card">
        <div className="meeting-info">
          <div className="meeting-icon">
  <CalendarCheck size={25} strokeWidth={1.8} />
</div>

          <div>
            <span className="meeting-label">
              {loadingUpcoming ? "LOADING MEETINGS..." : "UPCOMING MEETING"}
            </span>

            {loadingUpcoming ? (
              <h3>Loading your next meeting...</h3>
            ) : upcomingMeeting ? (
              <>
                <h3>{upcomingMeeting.title}</h3>
                <p>
                  {upcomingMeeting.date} at {upcomingMeeting.startTime}
                  {" · "}
                  {upcomingMeeting.duration} minutes
                </p>
              </>
            ) : (
              <>
                <h3>No upcoming meetings</h3>
                <p>Your next scheduled meeting will appear here.</p>
              </>
            )}
          </div>
        </div>

        {upcomingMeeting ? (
          <button
            className="primary-join"
            onClick={() => onMeetingCreated(upcomingMeeting)}
          >
            Join
          </button>
        ) : (
          <button className="disabled-join" disabled>
            Join
          </button>
        )}
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <span>Team</span>
          <strong>{teamMembersCount}</strong>
          <small>Unique team members</small>
        </div>

        <div className="overview-card">
          <span>Hours</span>
          <strong>{totalMeetingHours}h</strong>
          <small>Total meeting time</small>
        </div>

        <div className="overview-card">
          <span>Team</span>
          <strong>0</strong>
          <small>Team members</small>
        </div>

        <div className="overview-card">
          <span>AI</span>
          <strong>Ready</strong>
          <small>Meeting assistant</small>
        </div>
      </div>

      <div className="home-bottom-grid">
        <div className="home-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Meetings</h2>
              <p>Your latest meeting activity.</p>
            </div>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="empty-panel">
              <span>◷</span>
              <strong>No recent meetings</strong>
              <small>Your completed meetings will appear here.</small>
            </div>
          ) : (
            <div className="recent-meetings-list">
              {recentMeetings.map((meeting) => (
                <div className="recent-meeting-item" key={meeting.id}>
                  <div className="recent-meeting-icon">◷</div>

                  <div className="recent-meeting-details">
                    <strong>{meeting.title || "Untitled Meeting"}</strong>

                    <small>
                      {meeting.date || "Date unavailable"}
                      {meeting.startTime ? ` · ${meeting.startTime}` : ""}
                    </small>
                  </div>

                  <span className="recent-meeting-status">Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="home-panel ai-panel">
          <div className="panel-heading">
            <div>
              <h2>AI Meeting Assistant</h2>
              <p>Your intelligent meeting companion.</p>
            </div>
            <span className="ai-badge">AI</span>
          </div>

          <div className="ai-content">
            <div className="ai-icon">✦</div>
            <div>
              <strong>Ready to assist</strong>
              <p>Get meeting summaries, insights and helpful guidance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingsPage({ userId, onMeetingJoined }) {
  const [activeTab, setActiveTab] = useState("All");
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);
  const [deleteMeetingError, setDeleteMeetingError] = useState("");

  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [editMeetingError, setEditMeetingError] = useState("");

const [editMeetingForm, setEditMeetingForm] = useState({
  title: "",
  date: "",
  time: "",
  duration: "",
  description: "",
});

  const [searchQuery, setSearchQuery] = useState("");

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    time: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
  if (!userId) {
    setMeetings([]);
    return;
  }

  let isActive = true;

  const loadMeetings = async () => {
    try {
      const meetingsQuery =
        userId === "KwML5RI1FVfo3SrwbbpIo99iLAA2"
          ? collection(db, "meetings")
          : query(
              collection(db, "meetings"),
              where("createdBy", "==", userId)
            );

      const snapshot = await getDocs(meetingsQuery);

      if (!isActive) return;

      const meetingData = snapshot.docs.map((meetingDoc) => ({
        id: meetingDoc.id,
        ...meetingDoc.data(),
      }));

      setMeetings(meetingData);
    } catch (error) {
      console.error("Error loading meetings:", error);
    }
  };

  loadMeetings();

  return () => {
    isActive = false;
  };
}, [userId]);

  const editMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setIsEditingMeeting(true);
    setEditMeetingError("");
    setEditMeetingForm({
      title: meeting.title || "",
      date: meeting.date || "",
      time: meeting.startTime || "",
      duration: String(meeting.duration || ""),
      description: meeting.description || "",
    });
  };

  const createMeeting = async () => {
  if (!meetingForm.title.trim()) {
    setMeetingError("Please enter meeting title.");
    return;
  }

  if (!meetingForm.date) {
    setMeetingError("Please select a meeting date.");
    return;
  }

  // Prevent selecting a date before today.
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (meetingForm.date < todayString) {
    setMeetingError("Meeting date cannot be in the past.");
    return;
  }

  if (!meetingForm.time) {
    setMeetingError("Please select a start time.");
    return;
  }

  // Prevent selecting a time that has already passed today.
if (meetingForm.date === todayString) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  if (meetingForm.time <= currentTime) {
    setMeetingError("Please select a future time for today's meeting.");
    return;
  }
}

  if (
    !meetingForm.duration ||
    !Number.isFinite(Number(meetingForm.duration)) ||
    Number(meetingForm.duration) <= 0
  ) {
    setMeetingError("Please enter a valid meeting duration.");
    return;
  }

  try {
    setMeetingError("");

     await addDoc(collection(db, "meetings"), {
      title: meetingForm.title.trim(),
      date: meetingForm.date,
      startTime: meetingForm.time,
      duration: Number(meetingForm.duration),
      description: meetingForm.description.trim(),
      status: "scheduled",
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const meetingsQuery =
  userId === "KwML5RI1FVfo3SrwbbpIo99iLAA2"
    ? collection(db, "meetings")
    : query(
        collection(db, "meetings"),
        where("createdBy", "==", userId)
      );

const snapshot = await getDocs(meetingsQuery);

const meetingData = snapshot.docs.map((meetingDoc) => ({
  id: meetingDoc.id,
  ...meetingDoc.data(),
}));

setMeetings(meetingData);

    setMeetingForm({
      title: "",
      date: "",
      time: "",
      duration: "",
      description: "",
    });

    setShowNewMeeting(false);
  } catch (error) {
    console.error("Error creating meeting:", error);
    setMeetingError("Unable to create meeting. Please try again.");
  }
};

    const deleteMeeting = async (meetingId) => {
  if (isDeletingMeeting) return;

  setIsDeletingMeeting(true);
  setDeleteMeetingError("");

  try {
    await deleteDoc(doc(db, "meetings", meetingId));

    setMeetings((currentMeetings) =>
      currentMeetings.filter((meeting) => meeting.id !== meetingId)
    );

    if (selectedMeeting?.id === meetingId) {
      setSelectedMeeting(null);
    }

    setMeetingToDelete(null);
  } catch (error) {
    console.error("Error deleting meeting:", error);
    setDeleteMeetingError("Unable to delete meeting. Please try again.");
  } finally {
    setIsDeletingMeeting(false);
  }
};

const saveMeetingChanges = async () => {
  if (!selectedMeeting) return;

  const { title, date, time, duration, description } = editMeetingForm;

  if (!title.trim() || !date || !time || !duration) {
    setEditMeetingError("Please fill in all required fields.");
    return;
  }

  // Prevent selecting a date before today.
  const now = new Date();

  const todayString = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  if (date < todayString) {
    setEditMeetingError("Meeting date cannot be in the past.");
    return;
  }

  // Prevent selecting a time that has already passed today.
  if (date === todayString) {
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    if (time <= currentTime) {
      setEditMeetingError(
        "Please select a future time for today's meeting."
      );
      return;
    }
  }

  if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
    setEditMeetingError("Please enter a valid meeting duration.");
    return;
  }

  setEditMeetingError("");

  try {
    const updatedMeeting = {
      title: title.trim(),
      date,
      startTime: time,
      duration: Number(duration),
      description: description.trim(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(
      doc(db, "meetings", selectedMeeting.id),
      updatedMeeting
    );

    const updatedMeetingData = {
      ...selectedMeeting,
      title: title.trim(),
      date,
      startTime: time,
      duration: Number(duration),
      description: description.trim(),
    };

    setMeetings((currentMeetings) =>
      currentMeetings.map((meeting) =>
        meeting.id === selectedMeeting.id
          ? updatedMeetingData
          : meeting
      )
    );

    setSelectedMeeting(updatedMeetingData);
    setIsEditingMeeting(false);
  } catch (error) {
    console.error("Error updating meeting:", error);
    setEditMeetingError("Unable to save changes. Please try again.");
  }
};

const updateMeetingStatus = async (meeting, newStatus) => {
  try {
    await updateDoc(doc(db, "meetings", meeting.id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    setMeetings((currentMeetings) =>
      currentMeetings.map((item) =>
        item.id === meeting.id
          ? { ...item, status: newStatus }
          : item
      )
    );

    setSelectedMeeting((current) =>
      current?.id === meeting.id
        ? { ...current, status: newStatus }
        : current
    );

    console.log("Meeting status updated:", newStatus);
  } catch (error) {
    console.error("Error updating meeting status:", error);
  }
};

const tabs = ["All", "Upcoming", "Today", "Completed", "Cancelled"];

const filteredMeetings = meetings.filter((meeting) => {
  const query = searchQuery.toLowerCase().trim();

  const matchesSearch =
    (meeting.title || "").toLowerCase().includes(query) ||
    (meeting.description || "").toLowerCase().includes(query);

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const meetingDate = meeting.date || "";
  const status = (meeting.status || "scheduled").toLowerCase();

  const matchesTab =
    activeTab === "All" ||
    (activeTab === "Upcoming" &&
      meetingDate >= todayString &&
      status === "scheduled") ||
    (activeTab === "Today" && meetingDate === todayString) ||
    (activeTab === "Completed" && status === "completed") ||
    (activeTab === "Cancelled" && status === "cancelled");

  return matchesSearch && matchesTab;
});

  return (
    <div className="meetings-page">
      <div className="meetings-header">
        <div>
          <p className="home-eyebrow">MEETNOVA</p>
          <h1>Meetings</h1>
          <p>Manage your meetings, upcoming sessions and meeting history.</p>
        </div>

        <button
          className="new-meeting-button"
          onClick={() => setShowNewMeeting(true)}
        >
          ＋ New Meeting
        </button>
      </div>

      <div className="meeting-tools">
        <input
          className="meeting-search"
          type="text"
          placeholder="Search meetings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="meeting-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`meeting-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {showNewMeeting && (
        <div className="new-meeting-panel">
          <div className="new-meeting-form">
            <div>
              <h2>Create New Meeting</h2>
              <p>Set up your next MeetNova meeting.</p>
            </div>

            <input
              type="text"
              placeholder="Meeting title"
              value={meetingForm.title}
              onChange={(e) =>
                setMeetingForm({
                  ...meetingForm,
                  title: e.target.value,
                })
              }
            />

            <div className="meeting-form-row">
              <input
                type="date"
                value={meetingForm.date}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    date: e.target.value,
                  })
                }
              />
              <input
                type="time"
                value={meetingForm.time}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    time: e.target.value,
                  })
                }
              />
            </div>

            <select
              value={meetingForm.duration}
              onChange={(e) =>
                setMeetingForm({
                  ...meetingForm,
                  duration: e.target.value,
                })
              }
            >
              <option value="" disabled>
                Select duration
              </option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>

            <textarea
              placeholder="Meeting description (optional)"
              rows="3"
              value={meetingForm.description}
              onChange={(e) =>
                setMeetingForm({
                  ...meetingForm,
                  description: e.target.value,
                })
              }
            />

            {meetingError && <p className="meeting-form-error">{meetingError}</p>}

            <div className="new-meeting-actions">
              <button
                type="button"
                className="meeting-details-button"
                onClick={() => setShowNewMeeting(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="meeting-join-button"
                onClick={createMeeting}
              >
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="meetings-empty">
          <div className="meetings-empty-icon">◷</div>
          <h3>No {activeTab.toLowerCase()} meetings</h3>
          <p>Your meetings will appear here once you create or join a meeting.</p>
        </div>
      ) : (
        <div className="meeting-list">
          {filteredMeetings.map((meeting) => (
            <div className="meeting-card" key={meeting.id}>
              <div className="meeting-card-left">

                <div>
                  <span className="meeting-status">
                    {meeting.status?.toUpperCase() || "SCHEDULED"}
                  </span>

                  <h3>{meeting.title}</h3>

                  <p>{meeting.description || "No description added."}</p>

                  <div className="meeting-meta">
                    <span>📅 {meeting.date}</span>
                    <span>◷ {meeting.startTime}</span>
                    <span>⏱ {meeting.duration} min</span>
                  </div>
                </div>
              </div>

                <div className="meeting-card-actions">
                <button
                  className="meeting-details-button"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  Details
                </button>

                <button
                  type="button"
                  className="meeting-join-button"
                  onClick={() => onMeetingJoined(meeting)}
                >
                  Join
              </button>
                <button
                  className="meeting-details-button"
                  onClick={() => {
                    setDeleteMeetingError("");
                    setMeetingToDelete(meeting);
                  }}
                  >
                    Delete
                  </button>
                
            </div>

              {selectedMeeting?.id === meeting.id && (
                <div className="meeting-details-panel">
                  <div className="meeting-details-content">
                    <div className="meeting-details-header">
                      <div>
                        <span className="meeting-status">
                          {(selectedMeeting.status || "scheduled").toUpperCase()}
                        </span>

                        <h2>
                          {isEditingMeeting ? "Edit Meeting" : selectedMeeting.title}
                        </h2>
                      </div>

                      <button
                        className="meeting-details-close"
                        onClick={() => {
                          setSelectedMeeting(null);
                          setIsEditingMeeting(false);
                          setEditMeetingError("");
                        }}
                        type="button"
                      >
                        ×
                      </button>
                    </div>

                    {isEditingMeeting ? (
                      <div className="meeting-edit-form">
                        <label>
                          Meeting Title
                          <input
                            type="text"
                            value={editMeetingForm.title}
                            onChange={(e) =>
                              setEditMeetingForm((current) => ({
                                ...current,
                                title: e.target.value,
                              }))
                            }
                          />
                        </label>

                        <label>
                          Date
                          <input
                            type="date"
                            value={editMeetingForm.date}
                            onChange={(e) =>
                              setEditMeetingForm((current) => ({
                                ...current,
                                date: e.target.value,
                              }))
                            }
                          />
                        </label>

                        <label>
                          Start Time
                          <input
                            type="time"
                            value={editMeetingForm.time}
                            onChange={(e) =>
                              setEditMeetingForm((current) => ({
                                ...current,
                                time: e.target.value,
                              }))
                            }
                          />
                        </label>

                        <label>
                          Duration (minutes)
                          <input
                            type="number"
                            min="1"
                            value={editMeetingForm.duration}
                            onChange={(e) =>
                              setEditMeetingForm((current) => ({
                                ...current,
                                duration: e.target.value,
                              }))
                            }
                          />
                        </label>

                        <label>
                          Description
                          <textarea
                            value={editMeetingForm.description}
                            onChange={(e) =>
                              setEditMeetingForm((current) => ({
                                ...current,
                                description: e.target.value,
                              }))
                            }
                            rows="4"
                          />
                        </label>

                        {editMeetingError && (
                          <p className="meeting-edit-error" role="alert">
                            {editMeetingError}
                          </p>
                        )}

                        <div className="meeting-card-actions">
                          <button
                            type="button"
                            className="meeting-join-button"
                            onClick={saveMeetingChanges}
                          >
                            Save Changes
                          </button>

                          <button
                            type="button"
                            className="meeting-details-button"
                            onClick={() => {
                              setIsEditingMeeting(false);
                              setEditMeetingError("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="meeting-details-description">
                          {selectedMeeting.description || "No description added."}
                        </p>

                        <div className="meeting-details-info">
                          <div>
                            <span>Date</span>
                            <strong>{selectedMeeting.date}</strong>
                          </div>

                          <div>
                            <span>Start Time</span>
                            <strong>{selectedMeeting.startTime}</strong>
                          </div>

                          <div>
                            <span>Duration</span>
                            <strong>{selectedMeeting.duration} minutes</strong>
                          </div>

                          <div>
                            <span>Status</span>

                            <select
                              className="meeting-status-select"
                              value={(selectedMeeting.status || "scheduled").toLowerCase()}
                              onChange={(e) =>
                                updateMeetingStatus(selectedMeeting, e.target.value)
                              }
                              disabled={isEditingMeeting}
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div className="meeting-card-actions">
                          <button
                            type="button"
                            className="meeting-details-button"
                            onClick={() => editMeeting(selectedMeeting)}
                          >
                            Edit
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {meetingToDelete && (
  <div
    className="meeting-delete-overlay"
    onClick={() => {
      if (!isDeletingMeeting) {
        setMeetingToDelete(null);
        setDeleteMeetingError("");
      }
    }}
  >
    <div
      className="meeting-delete-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-meeting-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="meeting-delete-icon">!</div>

      <h2 id="delete-meeting-title">Delete Meeting?</h2>

      <p>
        Are you sure you want to delete{" "}
        <strong>
          {meetingToDelete.title || "this meeting"}
        </strong>
        ? This action cannot be undone.
      </p>

      {deleteMeetingError && (
        <p className="meeting-delete-error" role="alert">
          {deleteMeetingError}
        </p>
      )}

      <div className="meeting-delete-actions">
        <button
          type="button"
          className="meeting-delete-cancel"
          onClick={() => {
            setMeetingToDelete(null);
            setDeleteMeetingError("");
          }}
          disabled={isDeletingMeeting}
        >
          Cancel
        </button>

        <button
          type="button"
          className="meeting-delete-confirm"
          onClick={() => deleteMeeting(meetingToDelete.id)}
          disabled={isDeletingMeeting}
        >
          {isDeletingMeeting ? "Deleting..." : "Delete Meeting"}
        </button>
      </div>
    </div>
  </div>
)}
  </div>
  );
}

export default Dashboard;