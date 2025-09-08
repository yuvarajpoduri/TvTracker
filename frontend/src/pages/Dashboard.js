import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentWatches, setRecentWatches] = useState([]);
  const [currentlyWatching, setCurrentlyWatching] = useState([]);
  const [watchlistPreview, setWatchlistPreview] = useState([]);
  const [seriesProgress, setSeriesProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_KEY = "db530eb75fdd431140fb945e4903aeb4";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [watchesRes, currentRes, watchlistRes] = await Promise.all([
        fetch("https://tvtracker-j7g5.onrender.com/api/watch", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://tvtracker-j7g5.onrender.com/api/watch/currently-watching", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://tvtracker-j7g5.onrender.com/api/watchlist", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const watches = await watchesRes.json();
      const current = await currentRes.json();
      const watchlist = await watchlistRes.json();

      setRecentWatches(watches.slice(0, 6));
      setCurrentlyWatching(current.slice(0, 6));
      setWatchlistPreview(watchlist.slice(0, 6));

      const progressPromises = current.slice(0, 6).map(async (show) => {
        try {
          const tmdbRes = await fetch(
            `https://api.themoviedb.org/3/tv/${show._id}?api_key=${API_KEY}`
          );
          if (!tmdbRes.ok)
            return [
              show._id,
              {
                progress: 0,
                watchedEpisodes: show.totalEpisodes,
                totalEpisodes: 0,
              },
            ];

          const tmdbData = await tmdbRes.json();
          const totalEpisodes =
            tmdbData.seasons?.reduce(
              (total, season) =>
                season.season_number === 0
                  ? total
                  : total + (season.episode_count || 0),
              0
            ) || 0;
          const progress =
            totalEpisodes > 0
              ? Math.round((show.totalEpisodes / totalEpisodes) * 100)
              : 0;

          return [
            show._id,
            { progress, watchedEpisodes: show.totalEpisodes, totalEpisodes },
          ];
        } catch (error) {
          console.error(`Error fetching series data for ${show._id}:`, error);
          return [
            show._id,
            {
              progress: 0,
              watchedEpisodes: show.totalEpisodes,
              totalEpisodes: 0,
            },
          ];
        }
      });

      const progressResults = await Promise.all(progressPromises);
      setSeriesProgress(Object.fromEntries(progressResults));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      setSearchResults(
        data.results
          .filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          )
          .slice(0, 10)
      );
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchMovies(query);
  };

  const handleSearchResultClick = (item) => {
    navigate(`/${item.media_type}/${item.id}`);
    setSearchQuery("");
    setSearchResults([]);
  };

  // --- STYLES ---
  const containerStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    color: "white",
    padding: "2rem",
    fontFamily: "'Inter', sans-serif",
  };

  const cardStyle = {
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
    borderRadius: "20px",
    padding: "1.5rem",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  };

  const sectionTitleStyle = {
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: "700",
    marginBottom: "1.5rem",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const buttonStyle = {
    padding: "0.6rem 1.2rem",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "14px",
    fontWeight: "500",
  };

  if (loading) {
    return (
      <div
        style={{
          ...containerStyle,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Animated Header */}
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
            Welcome Back
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
            Discover and track your next favorite show.
          </p>
        </div>
        <style>{`@keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "4rem" }}>
          <span
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.5rem",
              opacity: 0.5,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search for movies and TV shows..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "1.2rem 1.2rem 1.2rem 4rem",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.3)",
              color: "white",
              fontSize: "1rem",
              backdropFilter: "blur(10px)",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          />
          {searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                right: 0,
                maxHeight: "400px",
                overflowY: "auto",
                zIndex: 1000,
                ...cardStyle,
                padding: "0.5rem",
              }}
            >
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSearchResultClick(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                >
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                        : "https://via.placeholder.com/92x138/1a1a2e/fff?text=N/A"
                    }
                    alt={item.title || item.name}
                    style={{
                      width: "40px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginRight: "1rem",
                    }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.9rem" }}>
                      {item.title || item.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.7 }}>
                      {item.media_type === "tv" ? "TV Show" : "Movie"} •{" "}
                      {new Date(
                        item.release_date || item.first_air_date
                      ).getFullYear() || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currently Watching */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={sectionTitleStyle}>Continue Watching</h2>
          {currentlyWatching.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {currentlyWatching.map((show) => {
                const progressInfo = seriesProgress[show._id] || {
                  progress: 0,
                  watchedEpisodes: show.totalEpisodes,
                  totalEpisodes: 0,
                };
                return (
                  <div
                    key={show._id}
                    style={{
                      ...cardStyle,
                      cursor: "pointer",
                      display: "flex",
                      gap: "1rem",
                    }}
                    onClick={() => navigate(`/tv/${show._id}`)}
                  >
                    <img
                      src={
                        show.poster
                          ? `https://image.tmdb.org/t/p/w154${show.poster}`
                          : "https://via.placeholder.com/100x150/1a1a2e/fff?text=N/A"
                      }
                      alt={show.title}
                      style={{
                        width: "100px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <h3 style={{ margin: "0 0 0.5rem 0" }}>{show.title}</h3>
                      <p
                        style={{
                          opacity: 0.7,
                          fontSize: "0.9rem",
                          marginBottom: "auto",
                        }}
                      >
                        Season {show.maxSeason} • Episode {show.maxEpisode}
                      </p>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.8rem",
                            opacity: 0.8,
                            marginBottom: "0.25rem",
                          }}
                        >
                          <span>
                            {progressInfo.watchedEpisodes} /{" "}
                            {progressInfo.totalEpisodes || "?"} eps
                          </span>
                          <span>{progressInfo.progress}%</span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            background: "rgba(0,0,0,0.3)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${progressInfo.progress}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #667eea, #764ba2)",
                              transition: "width 0.5s ease",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
              <p style={{ opacity: 0.7 }}>
                You're not currently watching any shows.
              </p>
            </div>
          )}
        </section>

        {/* Recently Watched */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={sectionTitleStyle}>Recently Watched</h2>
          {recentWatches.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {recentWatches.map((watch) => (
                <MovieCard key={watch._id} movie={watch} />
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
              <p style={{ opacity: 0.7 }}>No recent watches found.</p>
            </div>
          )}
        </section>

        {/* Watchlist Preview */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
              From Your Watchlist
            </h2>
            <button style={buttonStyle} onClick={() => navigate("/watchlist")}>
              View All
            </button>
          </div>
          {watchlistPreview.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {watchlistPreview.map((item) => (
                <MovieCard key={item._id} movie={item} />
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
              <p style={{ opacity: 0.7 }}>
                Your watchlist is empty. Add something new!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
