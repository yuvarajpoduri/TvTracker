import React, { useState, useEffect, useMemo } from "react";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overall");
  const [loading, setLoading] = useState(true);
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
  const [heatmapMonth, setHeatmapMonth] = useState(new Date().getMonth());

  // FIX: Using localStorage to get the token as requested.
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      // If there's no token, don't attempt to fetch
      if (!token) {
        console.error("Authentication token not found.");
        setLoading(false);
        setStats({}); // Set to empty object to show error state
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const formatTime = (minutes) => {
    if (typeof minutes !== "number" || minutes < 0) return "0m";
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = Math.round(minutes % 60);

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (mins > 0 || (days === 0 && hours === 0)) result += `${mins}m`;

    return result.trim() || "0m";
  };

  const generateHeatmapData = (year, month = null) => {
    if (!stats || !stats.activityHeatmap) return [];

    const activityMap = new Map();
    stats.activityHeatmap.forEach((item) => {
      const dateKey = new Date(item.date).toDateString();
      activityMap.set(dateKey, item.count);
    });

    const days = [];
    const startDate = new Date(year, month === null ? 0 : month, 1);
    const endDate =
      month === null ? new Date(year, 11, 31) : new Date(year, month + 1, 0);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const currentDate = new Date(d);
      const dateKey = currentDate.toDateString();
      const activityCount = activityMap.get(dateKey) || 0;

      let activityLevel = 0;
      if (activityCount > 0) {
        if (activityCount >= 5) activityLevel = 4;
        else if (activityCount >= 3) activityLevel = 3;
        else if (activityCount >= 2) activityLevel = 2;
        else activityLevel = 1;
      }

      days.push({
        date: currentDate,
        activity: activityLevel,
        count: activityCount,
      });
    }
    return days;
  };

  // FIX: Memoized calculations now rely ONLY on API data. Mocked values are removed.
  // Your API needs to provide these fields for them to be displayed.
  const derivedStats = useMemo(() => {
    if (!stats) return {};
    return {
      averagePerDay:
        Math.round(
          ((stats.overall?.totalItems || 0) /
            Math.max(stats.overall?.totalDays || 1, 1)) *
            10
        ) / 10,
      currentStreak: stats.streaks?.current || 0,
      longestStreak: stats.streaks?.longest || 0,
      // Add any other non-mock calculations here
    };
  }, [stats]);

  const heatmapData = useMemo(
    () => generateHeatmapData(heatmapYear, heatmapMonth),
    [stats, heatmapYear, heatmapMonth]
  );

  const getAvailableYears = () => {
    if (!stats || !stats.activityHeatmap) return [new Date().getFullYear()];
    const years = new Set(
      stats.activityHeatmap.map((item) => new Date(item.date).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  };

  const getMonthName = (monthIndex) =>
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][monthIndex];

  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  // Loading State
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#0f0f23",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255,255,255,0.3)",
            borderTop: "4px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error/No Data State
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f0f23, #1a1a2e)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "rgba(0,0,0,0.3)",
            padding: "2rem",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Error Loading Stats
          </h2>
          <p style={{ opacity: 0.8 }}>
            Could not fetch your statistics. Please check your connection and
            login status.
          </p>
        </div>
      </div>
    );
  }

  // Define styles outside the component to prevent re-creation on render
  const containerStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    color: "white",
    padding: "2rem",
    fontFamily: "'Inter', sans-serif",
  };
  // FIX: Removed glowCardStyle and will use cardStyle everywhere for a consistent look.
  const cardStyle = {
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
    borderRadius: "20px",
    padding: "2rem",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  };

  const tabButtonStyle = (isActive) => ({
    padding: "0.8rem 1.5rem",
    borderRadius: "12px",
    border: "none",
    background: isActive
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "rgba(255,255,255,0.1)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "14px",
    fontWeight: "500",
  });
  const heatmapCellStyle = (activityLevel) => ({
    height: "20px",
    width: "20px",
    borderRadius: "4px",
    backgroundColor: [
      "rgba(255,255,255,0.1)",
      "#0e4429",
      "#006d32",
      "#26a641",
      "#39d353",
    ][activityLevel],
    border: "1px solid rgba(255,255,255,0.1)",
    transition: "all 0.2s ease",
    cursor: "pointer",
  });

  // FIX: This card data relies on your API providing the specified fields.
  const statCardData = [
    {
      label: "Total Items",
      value: stats.overall?.totalItems || 0,
      color: "#667eea",
      icon: "📺",
    },
    {
      label: "Days Watched",
      value: stats.overall?.totalDays || 0,
      color: "#26a641",
      icon: "📅",
    },
    {
      label: "Hours Watched",
      value: stats.overall?.totalHours || 0,
      color: "#764ba2",
      icon: "⏰",
    },
    {
      label: "Average/Day",
      value: derivedStats.averagePerDay,
      color: "#e74c3c",
      icon: "📊",
    },
    {
      label: "Current Streak",
      value: `${derivedStats.currentStreak} days`,
      color: "#9b59b6",
      icon: "⚡",
    },
    {
      label: "Longest Streak",
      value: `${derivedStats.longestStreak} days`,
      color: "#f1c40f",
      icon: "🔥",
    },
  ];

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: "800",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 200%",
              animation: "gradient 3s ease infinite",
            }}
          >
            Your Entertainment Universe
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              opacity: 0.8,
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Dive deep into your viewing patterns, preferences, and milestones.
          </p>
        </div>

        <style>{`@keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "20px",
              padding: "8px",
              display: "flex",
              gap: "8px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {[
              { key: "overall", label: "Overview", icon: "🎯" },
              { key: "movies", label: "Movies", icon: "🎬" },
              { key: "tv", label: "TV Shows", icon: "📺" },
              { key: "insights", label: "Insights", icon: "💡" },
            ].map((tab) => (
              <button
                key={tab.key}
                style={{
                  ...tabButtonStyle(activeTab === tab.key),
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- OVERALL TAB --- */}
        {activeTab === "overall" && (
          <div>
            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
                marginBottom: "3rem",
              }}
            >
              {statCardData.map((stat) => (
                // FIX: Removed the 'animation' property to stop the floating effect.
                <div
                  key={stat.label}
                  style={{ ...cardStyle, textAlign: "center" }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: "bold",
                      color: stat.color,
                      marginBottom: "0.5rem",
                      textShadow: `0 0 20px ${stat.color}40`,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "1rem",
                      fontWeight: "500",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Heatmap */}
            <div style={{ ...cardStyle, marginBottom: "3rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "bold",
                      margin: 0,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Activity Heatmap
                  </h3>
                  <p style={{ opacity: 0.7, margin: "0.5rem 0 0 0" }}>
                    Your viewing patterns at a glance.
                  </p>
                </div>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <select
                    value={heatmapYear}
                    onChange={(e) => setHeatmapYear(parseInt(e.target.value))}
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "10px",
                      color: "white",
                      padding: "10px 15px",
                      fontSize: "14px",
                    }}
                  >
                    {getAvailableYears().map((year) => (
                      <option
                        key={year}
                        value={year}
                        style={{ background: "#1a1a2e" }}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={heatmapMonth}
                    onChange={(e) => setHeatmapMonth(parseInt(e.target.value))}
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "10px",
                      color: "white",
                      padding: "10px 15px",
                      fontSize: "14px",
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option
                        key={i}
                        value={i}
                        style={{ background: "#1a1a2e" }}
                      >
                        {getMonthName(i)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                  opacity: 0.9,
                }}
              >
                {getMonthName(heatmapMonth)} {heatmapYear}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "3px",
                  marginBottom: "0.5rem",
                }}
              >
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <div
                    key={day}
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      opacity: 0.6,
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "4px",
                  marginBottom: "2rem",
                }}
              >
                {Array.from({
                  length: getFirstDayOfMonth(heatmapYear, heatmapMonth),
                }).map((_, i) => (
                  <div key={`empty-${i}`}></div>
                ))}
                {heatmapData.map((day, index) => (
                  <div
                    key={index}
                    style={heatmapCellStyle(day.activity)}
                    title={`${day.date.toDateString()}: ${
                      day.count
                    } activities`}
                  ></div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  fontSize: "12px",
                  opacity: 0.8,
                  gap: "8px",
                }}
              >
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      ...heatmapCellStyle(level),
                      height: "14px",
                      width: "14px",
                    }}
                  ></div>
                ))}
                <span>More</span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "2rem",
              }}
            >
              <div style={cardStyle}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                  }}
                >
                  Top Genres
                </h3>
                <div>
                  {stats.topGenres?.slice(0, 10).map((genre) => (
                    <div
                      key={genre._id?.genre}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                        padding: "12px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "10px",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {genre._id?.genre || "Unknown"}
                      </span>
                      <span style={{ color: "#667eea", fontWeight: "600" }}>
                        {genre.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                  }}
                >
                  Biggest Marathons
                </h3>
                <div>
                  {stats.biggestMarathons?.slice(0, 10).map((show, index) => (
                    <div
                      key={show._id || index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                        padding: "12px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "10px",
                      }}
                    >
                      <span>{show.title || "Unknown Show"}</span>
                      <span style={{ color: "#f39c12", fontWeight: "600" }}>
                        {show.episodeCount} eps
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MOVIES TAB --- */}
        {activeTab === "movies" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  label: "Movies Watched",
                  value: stats.movies?.uniqueMovies || 0,
                  color: "#e74c3c",
                  icon: "🎬",
                  subtitle: "Unique titles",
                },
                {
                  label: "Total Time",
                  value: formatTime(stats.movies?.totalTime || 0),
                  color: "#3498db",
                  icon: "⏱️",
                  subtitle: "Hours of entertainment",
                },
                {
                  label: "Average Runtime",
                  value: `${Math.round(
                    (stats.movies?.totalTime || 0) /
                      (stats.movies?.uniqueMovies || 1)
                  )}m`,
                  color: "#9b59b6",
                  icon: "📊",
                  subtitle: "Per movie",
                },
                {
                  label: "Longest Movie",
                  value: formatTime(stats.movies?.longestMovie || 0),
                  color: "#f39c12",
                  icon: "🏆",
                  subtitle: "Your longest watch",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{ ...cardStyle, textAlign: "center" }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      color: stat.color,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
                    {stat.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TV SHOWS TAB --- */}
        {activeTab === "tv" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  label: "Shows Watched",
                  value: stats.tv?.uniqueShows || 0,
                  color: "#27ae60",
                  icon: "📺",
                  subtitle: "Different series",
                },
                {
                  label: "Episodes Watched",
                  value: stats.tv?.totalEpisodes || 0,
                  color: "#8e44ad",
                  icon: "📋",
                  subtitle: "Individual episodes",
                },
                {
                  label: "Total Time",
                  value: formatTime(stats.tv?.totalTime || 0),
                  color: "#2980b9",
                  icon: "⏰",
                  subtitle: "Hours of content",
                },
                {
                  label: "Avg Episodes/Show",
                  value: Math.round(
                    (stats.tv?.totalEpisodes || 0) /
                      (stats.tv?.uniqueShows || 1)
                  ),
                  color: "#d35400",
                  icon: "📊",
                  subtitle: "Per series",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{ ...cardStyle, textAlign: "center" }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      color: stat.color,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
                    {stat.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- INSIGHTS TAB --- */}
        {activeTab === "insights" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "2rem",
              }}
            >
              <div style={cardStyle}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                  }}
                >
                  Achievements
                </h3>
                <p style={{ opacity: 0.7 }}>
                  This section can be built out to show user badges and
                  achievements based on real data from your API.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
