import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./CalendarPage.css";

function CalendarPage({ onScheduleMeeting }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [meetingError, setMeetingError] = useState("");

useEffect(() => {
  const user = auth.currentUser;

  if (!user) {
    setMeetings([]);
    setLoadingMeetings(false);
    return;
  }

  setLoadingMeetings(true);
  setMeetingError("");

  const meetingsRef = collection(db, "meetings");

  const meetingsQuery =
    user.uid === "KwML5RI1FVfo3SrwbbpIo99iLAA2"
      ? meetingsRef
      : query(meetingsRef, where("createdBy", "==", user.uid));

  const unsubscribe = onSnapshot(
    meetingsQuery,
    (snapshot) => {
      const meetingData = snapshot.docs.map((meetingDoc) => ({
        id: meetingDoc.id,
        ...meetingDoc.data(),
      }));

      setMeetings(meetingData);
      setLoadingMeetings(false);
    },
    (error) => {
      console.error("Calendar loading error:", error);
      setMeetingError("Unable to load meetings.");
      setLoadingMeetings(false);
    }
  );

  return () => unsubscribe();
}, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isSameDate = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const getMeetingDate = (meeting) => {
  if (!meeting.date) return null;

  // Firestore Timestamp
  if (typeof meeting.date.toDate === "function") {
    return meeting.date.toDate();
  }

  // String date: YYYY-MM-DD
  if (typeof meeting.date === "string") {
    const match = meeting.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      );
    }

    const parsedDate = new Date(meeting.date);

    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate;
  }

  return null;
};

const getMeetingsForDate = (date) =>
  meetings.filter((meeting) => {
    const meetingDate = getMeetingDate(meeting);

    return meetingDate && isSameDate(meetingDate, date);
  });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const calendarDays = [
    ...Array.from({ length: firstDay }, (_, index) => ({
      type: "empty",
      key: `empty-${index}`,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      type: "day",
      day: index + 1,
      date: new Date(year, month, index + 1),
    })),
  ];

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div className="calendar-heading">

          <h1>
            My <span>Calendar</span>
          </h1>

          <p>Plan your day. Stay connected. Get things done.</p>
        </div>

        <div className="calendar-header-actions">
          <button
            className="calendar-today-btn"
            onClick={goToToday}
          >
            Today
          </button>

          <button
            className="calendar-create-btn"
            onClick={onScheduleMeeting}
          >
            <span>＋</span> Schedule Meeting
          </button>
        </div>
      </header>

      <section className="calendar-stats">
        <article className="calendar-stat-card">
          <div className="calendar-stat-icon purple">▦</div>
          <div>
            <p>Total Meetings</p>
            <h2>{meetings.length}</h2>
            <small>Calendar overview</small>
          </div>
        </article>

        <article className="calendar-stat-card">
          <div className="calendar-stat-icon blue">◷</div>
          <div>
            <p>Upcoming</p>
            <h2>
              {meetings.filter((meeting) => {
               const meetingDate = getMeetingDate(meeting);
               return (
                 meetingDate &&
                 meetingDate >= new Date(new Date().setHours(0, 0, 0, 0)) &&
                 meeting.status !== "completed"
               );
            }).length}
        </h2>
            <small>Scheduled meetings</small>
          </div>
        </article>

        <article className="calendar-stat-card">
          <div className="calendar-stat-icon green">✓</div>
          <div>
            <p>Completed</p>
            <h2>
              {meetings.filter(
               (meeting) => meeting.status === "completed"
              ).length}
            </h2>
            <small>Past meetings</small>
          </div>
        </article>
      </section>

      <section className="calendar-workspace">
        <div className="calendar-main-card">
          <div className="calendar-month-header">
            <div>
              <span className="calendar-section-label">
                YOUR SCHEDULE
              </span>
              <h2>{monthName}</h2>
            </div>

            <div className="calendar-month-controls">
              <button
                onClick={goToPreviousMonth}
                aria-label="Previous month"
              >
                ‹
              </button>

              <button
                onClick={goToNextMonth}
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((item) => {
              if (item.type === "empty") {
                return (
                  <div
                    className="calendar-day empty"
                    key={item.key}
                  />
                );
              }

              const isToday = isSameDate(item.date, today);
              const dayMeetings = getMeetingsForDate(item.date);
              const isSelected = isSameDate(item.date, selectedDate);

              return (
                <button
                  className={[
                    "calendar-day",
                    isToday ? "today" : "",
                    isSelected ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={item.day}
                  onClick={() => setSelectedDate(item.date)}
                  aria-pressed={isSelected}
                  aria-label={item.date.toDateString()}
                >
                  <span className="calendar-day-number">
                    {item.day}
                  </span>

                  {isToday && (
                    <span className="calendar-today-label">
                      TODAY
                    </span>
                  )}
                  {dayMeetings.length > 0 && (
                   <span
                     className="calendar-meeting-dot"
                     title={`${dayMeetings.length} meeting(s)`}
                   />
                  )}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span>
              <i className="legend-dot purple-dot" />
              Upcoming
            </span>

            <span>
              <i className="legend-dot green-dot" />
              Completed
            </span>

            <span>
              <i className="legend-dot blue-dot" />
              Selected date
            </span>
          </div>
        </div>

        <aside className="calendar-side-card">
          <div className="calendar-side-heading">
            <div>
              <span className="calendar-section-label">
                SELECTED DAY
              </span>
              <h2>Day Overview</h2>
            </div>

            <span className="calendar-date-icon">▦</span>
          </div>

          <div className="calendar-selected-date">
            <div className="calendar-date-number">
              {selectedDate.getDate()}
            </div>

            <div>
              <strong>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </strong>

              <p>{selectedDateLabel}</p>
            </div>
          </div>

          {loadingMeetings ? (
           <div className="calendar-empty-state">
            <div className="calendar-empty-icon">◷</div>
            <h3>Loading meetings...</h3>
            <p>Please wait while your calendar loads.</p>
           </div>
          ) : meetingError ? (
           <div className="calendar-empty-state">
            <div className="calendar-empty-icon">!</div>
            <h3>Unable to load meetings</h3>
            <p>{meetingError}</p>
           </div>
          ) : getMeetingsForDate(selectedDate).length === 0 ? (
           <div className="calendar-empty-state">
            <div className="calendar-empty-icon">◷</div>
            <h3>No meetings scheduled</h3>
            <p>No meetings found for this date.</p>

           <button onClick={onScheduleMeeting}>
            ＋ Schedule a meeting
           </button>
        </div>
    ) : (
      <div className="calendar-meetings-list">
       {getMeetingsForDate(selectedDate).map((meeting) => (
        <article className="calendar-meeting-item" key={meeting.id}>
         <h3>{meeting.title || "Untitled Meeting"}</h3>

         <p>
          {meeting.startTime || "Time unavailable"}
        </p>

        <span className="calendar-meeting-status">
          {meeting.status || "Scheduled"}
        </span>
      </article>
    ))}
  </div>
)}
        </aside>
      </section>
    </div>
  );
}

export default CalendarPage;