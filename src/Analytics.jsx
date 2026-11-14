import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import "./Analytics.css";

const ADMIN_UID = "KwML5RI1FVfo3SrwbbpIo99iLAA2";

const COLORS = {
  blue: "#4F6DF5",
  purple: "#8B5CF6",
  green: "#16A34A",
  orange: "#F59E0B",
  red: "#EF4444",
};

const getDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toDate = (value) => {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const getMeetingDuration = (meeting) => {
  const duration = Number(meeting?.duration);

  return Number.isFinite(duration) && duration > 0
    ? duration
    : 0;
};

const getMeetingDate = (meeting) => {
  if (!meeting?.date) return null;

  const time = meeting.startTime || "00:00";
  const date = new Date(`${meeting.date}T${time}`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);

  if (hours === 0) return `${remaining}m`;

  if (remaining === 0) return `${hours}h`;

  return `${hours}h ${remaining}m`;
};

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const isCompleted = (meeting) => {
  const status = String(meeting.status || "").toLowerCase();

  return [
    "completed",
    "complete",
    "ended",
    "finished",
  ].includes(status);
};

const Icon = ({ name, size = 22 }) => {
  const paths = {
    meetings: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    average: (
      <>
        <path d="M3 17l6-6 4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    completed: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5M12 15V3" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="M8 16v-5M13 16V6M18 16V9" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
};

const Analytics = ({
  currentUserId = null,
  userId = null,
}) => {
  const activeUserId = currentUserId || userId;

  const isAdmin = activeUserId === ADMIN_UID;

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const [period, setPeriod] = useState("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [tooltip, setTooltip] = useState(null);

  const chartRef = useRef(null);

  const today = new Date();

  useEffect(() => {
    let isActive = true;

    const loadMeetings = async () => {
      if (!activeUserId) {
        setMeetings([]);
        setError("User authentication information is unavailable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const meetingsQuery = isAdmin
          ? collection(db, "meetings")
          : query(
              collection(db, "meetings"),
              where("createdBy", "==", activeUserId)
            );

        const snapshot = await getDocs(meetingsQuery);

        if (!isActive) return;

        const meetingRecords = snapshot.docs.map((meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        }));

        setMeetings(meetingRecords);
      } catch (err) {
        console.error("Analytics Firebase error:", err);

        if (isActive) {
          setError(
            "Unable to load meeting analytics. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadMeetings();

    return () => {
      isActive = false;
    };
  }, [activeUserId, isAdmin, reloadKey]);

  const handleRetry = () => {
    setReloadKey((previous) => previous + 1);
  };

  const range = useMemo(() => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (period === "custom") {
    if (!customFrom || !customTo) {
      return {
        start,
        end,
        valid: false,
      };
    }

    const from = new Date(`${customFrom}T00:00:00`);
    const to = new Date(`${customTo}T23:59:59.999`);

    return {
      start: from,
      end: to,
      valid:
        !Number.isNaN(from.getTime()) &&
        !Number.isNaN(to.getTime()) &&
        from <= to &&
        to <= end,
    };
  }

  const days =
    period === "30d" ? 30 :
    period === "90d" ? 90 :
    7;

  start.setDate(start.getDate() - (days - 1));

  return {
    start,
    end,
    valid: true,
  };
}, [period, customFrom, customTo]);

  const normalizedMeetings = useMemo(() => {
    return meetings
      .filter((meeting) => {
        if (
          !isAdmin &&
          currentUserId
        ) {
          const ownerId =
            meeting.userId ||
            meeting.createdBy ||
            meeting.hostId ||
            meeting.ownerId ||
            meeting.organizerId ||
            meeting.host?.uid;

          // Actual access control must also be enforced
          // through Firebase queries and Firestore rules.
          if (ownerId && ownerId !== currentUserId) {
            return false;
          }
        }

        return true;
      })
      .map((meeting) => {
        const date = getMeetingDate(meeting);

        return {
          ...meeting,
          analyticsDate: date,
          analyticsDuration: getMeetingDuration(meeting),
          analyticsCompleted: isCompleted(meeting),
        };
      })
      .filter((meeting) => meeting.analyticsDate);
  }, [meetings, currentUserId, isAdmin]);

  const filteredMeetings = useMemo(() => {
    if (!range.valid) return [];

    return normalizedMeetings.filter((meeting) => {
      return (
        meeting.analyticsDate >= range.start &&
        meeting.analyticsDate <= range.end
      );
    });
  }, [normalizedMeetings, range]);

  const stats = useMemo(() => {
    const totalMeetings = filteredMeetings.length;

    const totalMinutes = filteredMeetings.reduce(
      (total, meeting) => total + meeting.analyticsDuration,
      0
    );

    const completed = filteredMeetings.filter(
      (meeting) => meeting.analyticsCompleted
    ).length;

    const average =
      totalMeetings > 0
        ? Math.round(totalMinutes / totalMeetings)
        : 0;

    const completionRate =
      totalMeetings > 0
        ? Math.round((completed / totalMeetings) * 100)
        : 0;

    return {
      totalMeetings,
      totalMinutes,
      completed,
      average,
      completionRate,
    };
  }, [filteredMeetings]);

  const chartData = useMemo(() => {
    if (!range.valid) return [];

    const data = [];
    const cursor = new Date(range.start);

    while (cursor <= range.end) {
      const key = getDateKey(cursor);

      const dailyMeetings = filteredMeetings.filter(
        (meeting) =>
          getDateKey(meeting.analyticsDate) === key
      );

      const duration = dailyMeetings.reduce(
        (sum, meeting) => sum + meeting.analyticsDuration,
        0
      );

      data.push({
        date: new Date(cursor),
        key,
        duration,
        meetings: dailyMeetings.length,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return data;
  }, [filteredMeetings, range]);

  const maxDuration = Math.max(
    60,
    ...chartData.map((item) => item.duration)
  );

  const graphMax = Math.ceil(maxDuration / 60) * 60;

  const activeDays = chartData.filter(
    (item) => item.meetings > 0
  );

  const insights = useMemo(() => {
    if (!activeDays.length) return null;

    const mostActive = [...activeDays].sort(
      (a, b) => b.meetings - a.meetings
    )[0];

    const longest = [...filteredMeetings].sort(
      (a, b) =>
        b.analyticsDuration - a.analyticsDuration
    )[0];

    return {
      mostActive,
      longest,
      activeDays: activeDays.length,
    };
  }, [activeDays, filteredMeetings]);

  const participantCount = useMemo(() => {
  const participants = new Set();

  filteredMeetings.forEach((meeting) => {
    const list = meeting.participantIds || [];

    if (Array.isArray(list)) {
      list.forEach((participant) => {
        const id =
          typeof participant === "string"
            ? participant
            : participant?.uid ||
              participant?.userId ||
              participant?.id;

        if (id) {
          participants.add(id);
        }
      });
    }
  });

  return participants.size;
}, [filteredMeetings]);

  const handleExport = () => {
    const headers = [
      "Date",
      "Meeting Title",
      "Duration (Minutes)",
      "Status",
    ];

    const rows = filteredMeetings.map((meeting) => [
      getDateKey(meeting.analyticsDate),
      meeting.title || meeting.name || "Meeting",
      meeting.analyticsDuration,
      meeting.status || "Unknown",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const safe = String(value ?? "").replace(/"/g, '""');
            return `"${safe}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "meetnova-analytics.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleBarHover = (event, item) => {
    const rect = chartRef.current?.getBoundingClientRect();

    if (!rect) return;

    setTooltip({
      x: Math.min(
        Math.max(event.clientX - rect.left, 75),
        rect.width - 75
      ),
      y: Math.max(event.clientY - rect.top - 75, 5),
      item,
    });
  };

  const cards = [
    {
      title: "Total Meetings",
      value: stats.totalMeetings,
      icon: "meetings",
      color: "blue",
      description: "Meetings in selected period",
    },
    {
      title: "Planned Meeting Hours",
      value: formatDuration(stats.totalMinutes),
      icon: "clock",
      color: "purple",
      description: "Total planned meeting time",
    },
    {
      title: "Average Duration",
      value: formatDuration(stats.average),
      icon: "average",
      color: "orange",
      description: "Average per meeting",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: "completed",
      color: "green",
      description: `${stats.completed} completed meetings`,
    },
  ];

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />
          <p>Preparing your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-empty">
          <h3>Unable to load analytics</h3>
          <p>{error}</p>

          <button onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">
        <div>
          <div className="analytics-breadcrumb">
            Dashboard <span>/</span> Analytics
          </div>

          <h1>Meeting Analytics</h1>

          <p>
            Track your meeting performance and discover
            meaningful insights.
          </p>
        </div>

        <button
          className="analytics-export-btn"
          onClick={handleExport}
          disabled={!filteredMeetings.length}
        >
          <Icon name="download" size={18} />
          Export Report
        </button>
      </div>

      {/* DATE FILTER */}

      <section className="analytics-filter-panel">

        <div className="analytics-filter-title">
          <Icon name="calendar" size={19} />
          <span>Date Range</span>
        </div>

        <div className="analytics-periods">
          {[
            ["7d", "7 Days"],
            ["30d", "30 Days"],
            ["90d", "90 Days"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={period === value ? "active" : ""}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className={`analytics-custom-btn ${
            period === "custom" ? "active" : ""
          }`}
          onClick={() => setPeriod("custom")}
        >
          Custom Range
        </button>

        {period === "custom" && (
          <div className="analytics-custom-inputs">
            <label>
              From
              <input
                type="date"
                value={customFrom}
                max={customTo || getDateKey(today)}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={getDateKey(today)}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      {period === "custom" &&
        (!customFrom || !customTo || !range.valid) && (
          <div className="analytics-range-warning">
            Please select a valid From and To date.
          </div>
        )}

      {/* STATISTICS */}

      <section className="analytics-stats-grid">

        {cards.map((card) => (
          <div
            className="analytics-stat-card"
            key={card.title}
          >
            <div className="analytics-stat-top">
              <span>{card.title}</span>

              <div className={`analytics-stat-icon ${card.color}`}>
                <Icon name={card.icon} />
              </div>
            </div>

            <h2>{card.value}</h2>

            <p>{card.description}</p>
          </div>
        ))}

      </section>

      {/* MAIN GRAPH */}

      <section className="analytics-chart-card">

        <div className="analytics-section-header">
          <div>
            <h2>Meeting Activity</h2>
            <p>
              Daily meeting duration throughout the selected period.
            </p>
          </div>

          <div className="analytics-chart-legend">
            <span />
            Meeting Duration
          </div>
        </div>

        {chartData.length > 0 ? (
          <div
            className="analytics-chart-wrapper"
            ref={chartRef}
            onMouseLeave={() => setTooltip(null)}
          >

            <div className="analytics-chart-scroll">

              <svg
                className="analytics-svg"
                style={{
                  width: `${Math.max(900, chartData.length * 48)}px`,
                  maxWidth: "none",
                }}
                viewBox={`0 0 ${Math.max(
                  900,
                  chartData.length * 48
                )} 320`}
                preserveAspectRatio="none"
              >
                
                {Array.from({ length: 5 }).map((_, index) => {
                  const chartWidth = Math.max(
                    900,
                    chartData.length * 48
                  );

                  const y = 250 - index * 55;
                  const value = Math.round(
                    (graphMax / 4) * index
                  );

                  return (
                    <g key={index}>
                      <line
                        x1="48"
                        y1={y}
                        x2={chartWidth - 15}
                        y2={y}
                        className="analytics-grid-line"
                      />

                      <text
                        x="40"
                        y={y + 4}
                        textAnchor="end"
                        className="analytics-axis-label"
                      >
                        {formatDuration(value)}
                      </text>
                    </g>
                  );
                })}

                {chartData.map((item, index) => {
                  const chartWidth = Math.max(
                    900,
                    chartData.length * 48
                  );

                  const plotWidth = chartWidth - 70;
                  const slotWidth = plotWidth / chartData.length;

                  const barWidth = Math.min(
                    24,
                    slotWidth * 0.55
                  );

                  const x =
                    55 +
                    index * slotWidth +
                    (slotWidth - barWidth) / 2;

                  const height =
                    (item.duration / graphMax) * 220;

                  const y = 250 - height;

                  return (
                    <g
                      key={item.key}
                      onMouseEnter={(event) =>
                        handleBarHover(event, item)
                      }
                      onMouseMove={(event) =>
                        handleBarHover(event, item)
                      }
                      onFocus={(event) =>
                        handleBarHover(event, item)
                      }
                      tabIndex={0}
                      role="img"
                      aria-label={`${formatDate(item.date)}: ${formatDuration(item.duration)}, ${item.meetings} meetings`}
                    >
                      <rect
                        x={x}
                        y={30}
                        width={slotWidth}
                        height={220}
                        fill="transparent"
                      />

                      <rect
                        x={x}
                        y={item.duration ? y : 247}
                        width={barWidth}
                        height={item.duration ? height : 3}
                        rx="5"
                        fill={
                          item.duration > 0
                            ? COLORS.blue
                            : "var(--analytics-zero-bar)"
                        }
                        className="analytics-bar"
                      />

                      {(
                        chartData.length <= 15 ||
                        index % Math.ceil(chartData.length / 12) === 0
                      ) && (
                        <text
                          x={x + barWidth / 2}
                          y="278"
                          textAnchor="middle"
                          className="analytics-axis-label"
                        >
                          {formatDate(item.date)}
                        </text>
                      )}
                    </g>
                  );
                })}

              </svg>
            </div>

            {tooltip && (
              <div
                className="analytics-tooltip"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}
              >
                <strong>
                  {tooltip.item.date.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </strong>

                <span>
                  Meeting Time:{" "}
                  {formatDuration(tooltip.item.duration)}
                </span>

                <span>
                  Meetings: {tooltip.item.meetings}
                </span>
              </div>
            )}

          </div>
        ) : (
          <div className="analytics-empty-chart">
            <Icon name="chart" size={36} />
            <h3>No meeting activity</h3>
            <p>
              Meeting activity will appear here when
              meeting records are available.
            </p>
          </div>
        )}

      </section>

      {/* PERFORMANCE */}

      <div className="analytics-bottom-grid">

        <section className="analytics-insights-card">

          <div className="analytics-section-header">
            <div>
              <h2>Meeting Performance</h2>
              <p>Your meeting activity at a glance.</p>
            </div>
          </div>

          <div className="analytics-performance-list">

            <div className="analytics-performance-item">
              <div className="analytics-performance-icon blue">
                <Icon name="calendar" />
              </div>

              <div>
                <span>Most Active Day</span>
                <strong>
                  {insights
                    ? formatDate(insights.mostActive.date)
                    : "No data"}
                </strong>
              </div>

              <small>
                {insights
                  ? `${insights.mostActive.meetings} meetings`
                  : "—"}
              </small>
            </div>

            <div className="analytics-performance-item">
              <div className="analytics-performance-icon purple">
                <Icon name="clock" />
              </div>

              <div>
                <span>Longest Meeting</span>
                <strong>
                  {insights
                    ? formatDuration(
                        insights.longest.analyticsDuration
                      )
                    : "No data"}
                </strong>
              </div>

              <small>
                {insights
                  ? insights.longest.title ||
                    insights.longest.name ||
                    "Meeting"
                  : "—"}
              </small>
            </div>

            <div className="analytics-performance-item">
              <div className="analytics-performance-icon green">
                <Icon name="chart" />
              </div>

              <div>
                <span>Active Days</span>
                <strong>
                  {insights ? insights.activeDays : 0}
                </strong>
              </div>

              <small>Days with meetings</small>
            </div>

            <div className="analytics-performance-item">
              <div className="analytics-performance-icon orange">
                <Icon name="users" />
              </div>

              <div>
                <span>Unique Participants</span>
                <strong>{participantCount}</strong>
              </div>

              <small>Identifiable participants</small>
            </div>

          </div>
        </section>

        {/* INSIGHTS */}

        <section className="analytics-smart-card">

          <div className="analytics-smart-heading">
            <div className="analytics-smart-icon">
              ✦
            </div>

            <div>
              <h2>Your Meeting Insights</h2>
              <p>Insights from your meeting activity.</p>
            </div>
          </div>

          {filteredMeetings.length > 0 ? (
            <div className="analytics-smart-content">

              <div className="analytics-insight-message">
                <span className="analytics-insight-dot" />

                <p>
                  You conducted{" "}
                  <strong>{stats.totalMeetings}</strong>{" "}
                  meetings during the selected period.
                </p>
              </div>

              <div className="analytics-insight-message">
                <span className="analytics-insight-dot purple-dot" />

                <p>
                  Your total meeting time was{" "}
                  <strong>
                    {formatDuration(stats.totalMinutes)}
                  </strong>.
                </p>
              </div>

              <div className="analytics-insight-message">
                <span className="analytics-insight-dot green-dot" />

                <p>
                  Your meeting completion rate was{" "}
                  <strong>{stats.completionRate}%</strong>.
                </p>
              </div>

              <div className="analytics-insight-footer">
                Based on available meeting records.
              </div>

            </div>
          ) : (
            <div className="analytics-smart-empty">
              Complete your first meeting to unlock insights.
            </div>
          )}

        </section>

      </div>

    </div>
  );
};

export default Analytics;