import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    filterWatchlist();
  }, [watchlist, activeFilter]);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWatchlist(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setLoading(false);
    }
  };

  const filterWatchlist = () => {
    if (activeFilter === "all") {
      setFilteredList(watchlist);
    } else {
      setFilteredList(
        watchlist.filter((item) => item.mediaType === activeFilter)
      );
    }
  };

  const removeFromWatchlist = async (tmdbId, mediaType) => {
    try {
      await fetch("http://localhost:5000/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      setWatchlist(
        watchlist.filter(
          (item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType)
        )
      );
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const movieCount = watchlist.filter(
    (item) => item.mediaType === "movie"
  ).length;
  const tvCount = watchlist.filter((item) => item.mediaType === "tv").length;

  return (
    <div className="container">
      <div style={{ marginBottom: "30px" }}>
        <h1 className="section-title">My Watchlist</h1>
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div className="stats-card card" style={{ minWidth: "150px" }}>
            <div className="stats-number">{watchlist.length}</div>
            <div className="stats-label">Total Items</div>
          </div>
          <div className="stats-card card" style={{ minWidth: "150px" }}>
            <div className="stats-number">{movieCount}</div>
            <div className="stats-label">Movies</div>
          </div>
          <div className="stats-card card" style={{ minWidth: "150px" }}>
            <div className="stats-number">{tvCount}</div>
            <div className="stats-label">TV Shows</div>
          </div>
        </div>
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All ({watchlist.length})
          </button>
          <button
            className={`tab-button ${activeFilter === "movie" ? "active" : ""}`}
            onClick={() => setActiveFilter("movie")}
          >
            Movies ({movieCount})
          </button>
          <button
            className={`tab-button ${activeFilter === "tv" ? "active" : ""}`}
            onClick={() => setActiveFilter("tv")}
          >
            TV Shows ({tvCount})
          </button>
        </div>
      </div>

      {filteredList.length > 0 ? (
        <div className="grid grid-4">
          {filteredList.map((item) => (
            <div
              key={`${item.tmdbId}-${item.mediaType}`}
              style={{ position: "relative" }}
            >
              <MovieCard movie={item} />
              <button
                onClick={() => removeFromWatchlist(item.tmdbId, item.mediaType)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(255, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(255, 0, 0, 1)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "rgba(255, 0, 0, 0.8)")
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "60px" }}>
          <h3 style={{ marginBottom: "15px", opacity: 0.8 }}>
            {activeFilter === "all"
              ? "Your watchlist is empty"
              : activeFilter === "movie"
              ? "No movies in watchlist"
              : "No TV shows in watchlist"}
          </h3>
          <p style={{ opacity: 0.6 }}>
            Start adding movies and TV shows to keep track of what you want to
            watch!
          </p>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
