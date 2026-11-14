import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import "./MeetingHistory.css";

const ADMIN_UID = "KwML5RI1FVfo3SrwbbpIo99iLAA2";

function MeetingHistory({ userId }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    if (!userId) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const meetingsQuery =
          userId === ADMIN_UID
            ? collection(db, "meetings")
            : query(
                collection(db, "meetings"),
                where("createdBy", "==", userId)
              );

        const snapshot = await getDocs(meetingsQuery);

        if (!isActive) return;

        const allMeetings = snapshot.docs.map((meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        }));

        const historyMeetings = allMeetings
          .filter((meeting) => {
            const status = (meeting.status || "").toLowerCase();

            return (
              status === "completed" ||
              status === "cancelled" ||
              (
                status === "scheduled" &&
                meeting.date &&
                meeting.startTime &&
                new Date(`${meeting.date}T${meeting.startTime}`) < new Date()
              )
            );
          })
          .sort((a, b) => {
            const dateA = new Date(
              `${a.date || "1970-01-01"}T${a.startTime || "00:00"}`
            );

            const dateB = new Date(
              `${b.date || "1970-01-01"}T${b.startTime || "00:00"}`
            );

            return dateB - dateA;
          });

        setMeetings(historyMeetings);
      } catch (err) {
        console.error("Error loading meeting history:", err);

        if (isActive) {
          setError("Unable to load meeting history. Please try again.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const getMeetingStatus = (meeting) => {
    const status = (meeting.status || "").toLowerCase();

    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";

    if (
      status === "scheduled" &&
      meeting.date &&
      meeting.startTime &&
      new Date(`${meeting.date}T${meeting.startTime}`) < new Date()
    ) {
      return "Missed";
    }

    return "Unknown";
  };

  const filteredMeetings = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return meetings.filter((meeting) => {
      const status = getMeetingStatus(meeting);

      const matchesSearch =
        (meeting.title || "").toLowerCase().includes(search) ||
        (meeting.description || "").toLowerCase().includes(search) ||
        meeting.id.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [meetings, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const completed = meetings.filter(
      (meeting) => getMeetingStatus(meeting) === "Completed"
    );

    const cancelled = meetings.filter(
      (meeting) => getMeetingStatus(meeting) === "Cancelled"
    );

    const missed = meetings.filter(
      (meeting) => getMeetingStatus(meeting) === "Missed"
    );

    const totalMinutes = completed.reduce(
      (total, meeting) => total + (Number(meeting.duration) || 0),
      0
    );

    return {
      total: meetings.length,
      completed: completed.length,
      cancelled: cancelled.length,
      missed: missed.length,
      hours: Math.round((totalMinutes / 60) * 100) / 100,
    };
  }, [meetings]);

  return (
    <div className="meeting-history-page">
      <div className="meeting-history-header">
        <div>
          
          <h1>Meeting History</h1>
          <p>Review your past meetings and activity.</p>
        </div>
      </div>

      <div className="meeting-history-stats">
        <div className="history-stat-card">
          <span>Total Meetings</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="history-stat-card">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>

        <div className="history-stat-card">
          <span>Cancelled</span>
          <strong>{stats.cancelled}</strong>
        </div>

        <div className="history-stat-card">
          <span>Missed</span>
          <strong>{stats.missed}</strong>
        </div>

        <div className="history-stat-card">
          <span>Planned Duration</span>
          <strong>{stats.hours}h</strong>
        </div>
      </div>

      <div className="meeting-history-toolbar">
        <input
          type="search"
          placeholder="Search by title, description or meeting ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="history-filters">
          {["All", "Completed", "Cancelled", "Missed"].map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="history-message">Loading meeting history...</div>
      ) : error ? (
        <div className="history-message history-error">
          {error}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="history-empty">
          <span>◷</span>
          <h2>No meeting history found</h2>
          <p>
            Completed, cancelled and missed meetings will appear here.
          </p>
        </div>
      ) : (
        <div className="history-meeting-list">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting);

            return (
              <div className="history-meeting-card" key={meeting.id}>
                <div className="history-meeting-main">
                  <div className="history-meeting-icon">◷</div>

                  <div className="history-meeting-info">
                    <span className={`history-status ${status.toLowerCase()}`}>
                      {status}
                    </span>

                    <h3>{meeting.title || "Untitled Meeting"}</h3>

                    <p>
                      {meeting.date || "Date unavailable"}
                      {meeting.startTime ? ` · ${meeting.startTime}` : ""}
                      {" · "}
                      {Number(meeting.duration) || 0} minutes planned
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="history-details-button"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedMeeting && (
        <div
          className="history-details-overlay"
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            className="history-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-modal-header">
              <div>
                <span>MEETING DETAILS</span>
                <h2 id="history-details-title">
                  {selectedMeeting.title || "Untitled Meeting"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMeeting(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="history-modal-info">
              <div>
                <span>Meeting ID</span>
                <strong>{selectedMeeting.id}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{getMeetingStatus(selectedMeeting)}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{selectedMeeting.date || "Unavailable"}</strong>
              </div>

              <div>
                <span>Start Time</span>
                <strong>{selectedMeeting.startTime || "Unavailable"}</strong>
              </div>

              <div>
                <span>Planned Duration</span>
                <strong>
                  {Number(selectedMeeting.duration) || 0} minutes
                </strong>
              </div>

              <div>
                <span>Organizer ID</span>
                <strong>{selectedMeeting.createdBy || "Unavailable"}</strong>
              </div>

              <div>
                <span>Participants</span>
                <strong>
                  {Array.isArray(selectedMeeting.participantIds)
                    ? selectedMeeting.participantIds.length
                    : 0}
                </strong>
              </div>
            </div>

            <div className="history-modal-description">
              <span>Description</span>
              <p>
                {selectedMeeting.description || "No description added."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingHistory;