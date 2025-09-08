import React from "react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie, progress, showProgress = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const mediaType = movie.first_air_date ? "tv" : "movie";
    navigate(`/${mediaType}/${movie.id || movie.tmdbId}`);
  };

  return (
    <div className="movie-card glass-card" onClick={handleClick}>
      <img
        src={`https://image.tmdb.org/t/p/w500${
          movie.poster_path || movie.poster
        }`}
        alt={movie.title || movie.name}
        className="movie-poster"
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/300x450/333/fff?text=No+Image";
        }}
      />
      <div className="movie-info">
        <div className="movie-title">{movie.title || movie.name}</div>
        <div className="movie-year">
          {movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : movie.first_air_date
            ? new Date(movie.first_air_date).getFullYear()
            : movie.year || "N/A"}
        </div>
        {showProgress && progress && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
