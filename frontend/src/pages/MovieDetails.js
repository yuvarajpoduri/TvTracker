import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format runtime
const formatRuntime = (minutes) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${mins}m`;
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState({});
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [watchedStatus, setWatchedStatus] = useState({});

  // IMPORTANT: Replace with your actual TMDb API Key
  const API_KEY = "db530eb75fdd431140fb945e4903aeb4";
  const token = localStorage.getItem("token");
  const mediaType = window.location.pathname.includes("/tv/") ? "tv" : "movie";

  useEffect(() => {
    setLoading(true);
    fetchDetailsAndStatus();
  }, [id, mediaType]);

  const fetchDetailsAndStatus = async () => {
    try {
      // Fetch TMDB details and credits
      const [detailsRes, creditsRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${API_KEY}`
        ),
        fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${API_KEY}`
        ),
      ]);

      if (!detailsRes.ok) throw new Error("Failed to fetch details");

      const detailsData = await detailsRes.json();
      const creditsData = await creditsRes.json();

      setDetails(detailsData);
      setCast(creditsData.cast.slice(0, 20));
      if (mediaType === "tv") {
        setSeasons(detailsData.seasons || []);
      }

      // Fetch status from your backend
      if (token) {
        checkWatchlist();
        if (mediaType === "movie") {
          checkWatchedStatus();
        }
      }
    } catch (error) {
      console.error("Error fetching initial details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonEpisodes = async (seasonNumber) => {
    if (episodes[seasonNumber]) {
      // Don't refetch if already loaded
      return;
    }
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`
      );
      const data = await response.json();
      setEpisodes((prev) => ({ ...prev, [seasonNumber]: data.episodes }));
      checkSeasonWatchedStatus(seasonNumber, data.episodes);
    } catch (error) {
      console.error("Error fetching episodes:", error);
    }
  };

  const checkSeasonWatchedStatus = async (seasonNumber, episodesList) => {
    if (!token) return;
    const episodeChecks = episodesList.map((ep) =>
      fetch(
        `http://localhost:5000/api/watch/check/${id}/tv?season=${seasonNumber}&episode=${ep.episode_number}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((res) => res.json())
        .then((data) => ({
          key: `${seasonNumber}-${ep.episode_number}`,
          isWatched: data.isWatched,
        }))
    );
    const results = await Promise.all(episodeChecks);
    const newWatchedStatus = results.reduce((acc, curr) => {
      acc[curr.key] = curr.isWatched;
      return acc;
    }, {});
    setWatchedStatus((prev) => ({ ...prev, ...newWatchedStatus }));
  };

  const checkWatchlist = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/watchlist/check/${id}/${mediaType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setInWatchlist(data.inWatchlist);
    } catch (err) {
      console.error("Error checking watchlist:", err);
    }
  };

  const checkWatchedStatus = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/watch/check/${id}/movie`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setWatchedStatus({ movie: data.isWatched });
    } catch (err) {
      console.error("Error checking watched status:", err);
    }
  };

  const toggleWatchlist = async () => {
    const method = inWatchlist ? "DELETE" : "POST";
    try {
      await fetch("http://localhost:5000/api/watchlist", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: parseInt(id),
          mediaType,
          title: details.title || details.name,
          poster: details.poster_path,
          year: new Date(
            details.release_date || details.first_air_date
          ).getFullYear(),
        }),
      });
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  const toggleWatched = async (season = null, episode = null) => {
    const watchKey = season && episode ? `${season}-${episode}` : "movie";
    const isCurrentlyWatched = watchedStatus[watchKey];
    const endpoint = isCurrentlyWatched ? "remove" : "";
    const method = isCurrentlyWatched ? "DELETE" : "POST";

    try {
      const res = await fetch(`http://localhost:5000/api/watch/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: parseInt(id),
          mediaType,
          title: details.title || details.name,
          poster: details.poster_path,
          genres: details.genres.map((g) => g.name),
          season,
          episode,
        }),
      });

      if (res.ok) {
        setWatchedStatus((prev) => ({
          ...prev,
          [watchKey]: !isCurrentlyWatched,
        }));
      }
    } catch (error) {
      console.error("Error toggling watched status:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="container error-message">
        Details could not be loaded.
      </div>
    );
  }

  return (
    <div className="details-page">
      {/* --- Hero Section --- */}
      <div
        className="details-hero"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${details.backdrop_path})`,
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content container">
            <img
              src={
                details.poster_path
                  ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                  : "https://via.placeholder.com/300x450/1a1a2e/fff?text=N/A"
              }
              alt={details.title || details.name}
              className="hero-poster"
            />
            <div className="hero-info">
              <h1>{details.title || details.name}</h1>
              {details.tagline && (
                <p className="tagline">"{details.tagline}"</p>
              )}

              <div className="meta-info">
                <span>⭐ {details.vote_average?.toFixed(1)}</span>
                <span>
                  {new Date(
                    details.release_date || details.first_air_date
                  ).getFullYear() || "N/A"}
                </span>
                <span>
                  {mediaType === "movie"
                    ? formatRuntime(details.runtime)
                    : `${details.number_of_seasons} Seasons`}
                </span>
              </div>

              <div className="genres">
                {details.genres.map((g) => (
                  <span key={g.id} className="genre-tag">
                    {g.name}
                  </span>
                ))}
              </div>

              <p className="overview">{details.overview}</p>

              <div className="action-buttons">
                <button
                  onClick={toggleWatchlist}
                  className={`btn ${inWatchlist ? "btn-secondary" : ""}`}
                >
                  {inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
                </button>
                {mediaType === "movie" && (
                  <button
                    onClick={() => toggleWatched()}
                    className={`btn ${
                      watchedStatus.movie ? "btn-secondary" : ""
                    }`}
                  >
                    {watchedStatus.movie ? "✓ Watched" : "Mark as Watched"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Tabs Section --- */}
      <div className="container">
        <div className="details-tabs-container">
          <div className="tab-buttons">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === "cast" ? "active" : ""}`}
              onClick={() => setActiveTab("cast")}
            >
              Cast
            </button>
            {mediaType === "tv" && (
              <button
                className={`tab-button ${
                  activeTab === "episodes" ? "active" : ""
                }`}
                onClick={() => setActiveTab("episodes")}
              >
                Episodes
              </button>
            )}
          </div>
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-grid">
                <div className="info-item">
                  <h4>Status</h4>
                  <p>{details.status}</p>
                </div>
                <div className="info-item">
                  <h4>Original Language</h4>
                  <p>{details.original_language?.toUpperCase()}</p>
                </div>
                {mediaType === "movie" && (
                  <div className="info-item">
                    <h4>Budget</h4>
                    <p>{formatCurrency(details.budget)}</p>
                  </div>
                )}
                {mediaType === "movie" && (
                  <div className="info-item">
                    <h4>Revenue</h4>
                    <p>{formatCurrency(details.revenue)}</p>
                  </div>
                )}
                <div className="info-item full-width">
                  <h4>Production</h4>
                  <p>
                    {details.production_companies
                      ?.map((c) => c.name)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "cast" && (
              <div className="cast-scroll-container">
                {cast.map((person) => (
                  <div
                    key={person.id}
                    className="cast-card"
                    onClick={() => navigate(`/person/${person.id}`)}
                  >
                    <img
                      src={
                        person.profile_path
                          ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                          : "https://via.placeholder.com/150x225/1a1a2e/fff?text=N/A"
                      }
                      alt={person.name}
                    />
                    <h4>{person.name}</h4>
                    <p>{person.character}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "episodes" && mediaType === "tv" && (
              <div className="seasons-container">
                {seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <div key={season.id} className="season-card">
                      <div
                        className="season-header"
                        onClick={() => {
                          setSelectedSeason((prev) =>
                            prev === season.season_number
                              ? null
                              : season.season_number
                          );
                          fetchSeasonEpisodes(season.season_number);
                        }}
                      >
                        <img
                          src={
                            season.poster_path
                              ? `https://image.tmdb.org/t/p/w154${season.poster_path}`
                              : "https://via.placeholder.com/100x150/1a1a2e/fff?text=N/A"
                          }
                          alt={season.name}
                        />
                        <div className="season-info">
                          <h3>{season.name}</h3>
                          <p>
                            {season.episode_count} Episodes •{" "}
                            {new Date(season.air_date).getFullYear()}
                          </p>
                          <p className="season-overview">{season.overview}</p>
                        </div>
                        <span
                          className={`chevron ${
                            selectedSeason === season.season_number
                              ? "expanded"
                              : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                      {selectedSeason === season.season_number && (
                        <div className="episodes-list">
                          {episodes[season.season_number]?.map((ep) => (
                            <div key={ep.id} className="episode-item">
                              <img
                                src={
                                  ep.still_path
                                    ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                                    : "https://via.placeholder.com/120x68/1a1a2e/fff?text=N/A"
                                }
                                alt={ep.name}
                              />
                              <div className="episode-details">
                                <h4>
                                  {ep.episode_number}. {ep.name}
                                </h4>
                                <p className="episode-overview">
                                  {ep.overview}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWatched(
                                    season.season_number,
                                    ep.episode_number
                                  );
                                }}
                                className={`btn-small ${
                                  watchedStatus[
                                    `${season.season_number}-${ep.episode_number}`
                                  ]
                                    ? "btn-secondary"
                                    : ""
                                }`}
                              >
                                {watchedStatus[
                                  `${season.season_number}-${ep.episode_number}`
                                ]
                                  ? "✓"
                                  : "+"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
