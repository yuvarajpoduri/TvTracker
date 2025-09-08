import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";

const PersonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = "8265bd1679663a7ea12ac168da84d2e8";

  useEffect(() => {
    fetchPersonDetails();
  }, [id]);

  const fetchPersonDetails = async () => {
    try {
      const [personRes, creditsRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}`),
        fetch(
          `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${API_KEY}`
        ),
      ]);

      const personData = await personRes.json();
      const creditsData = await creditsRes.json();

      setPerson(personData);

      const sortedCredits = creditsData.cast.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || "0000-00-00";
        const dateB = b.release_date || b.first_air_date || "0000-00-00";
        return new Date(dateB) - new Date(dateA);
      });

      setCredits(sortedCredits);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching person details:", error);
      setLoading(false);
    }
  };

  const calculateAge = (birthday, deathday = null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    const age = Math.floor((end - birth) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!person) {
    return <div className="container">Person not found</div>;
  }

  return (
    <div className="container">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: "20px" }}
      >
        ← Back
      </button>

      <div className="card" style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            gap: "30px",
            alignItems: "flex-start",
            flexDirection: window.innerWidth <= 768 ? "column" : "row",
          }}
        >
          <img
            src={
              person.profile_path
                ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                : "https://via.placeholder.com/300x450/333/fff?text=No+Image"
            }
            alt={person.name}
            style={{
              width: window.innerWidth <= 768 ? "200px" : "250px",
              borderRadius: "15px",
              flexShrink: 0,
              alignSelf: window.innerWidth <= 768 ? "center" : "flex-start",
            }}
          />
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: window.innerWidth <= 768 ? "2rem" : "2.5rem",
                marginBottom: "15px",
                textAlign: window.innerWidth <= 768 ? "center" : "left",
              }}
            >
              {person.name}
            </h1>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#667eea", marginBottom: "10px" }}>
                Biography
              </h3>
              <p
                style={{
                  lineHeight: 1.6,
                  opacity: 0.9,
                  textAlign: window.innerWidth <= 768 ? "center" : "left",
                }}
              >
                {person.biography || "No biography available."}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  window.innerWidth <= 768
                    ? "1fr"
                    : "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  textAlign: window.innerWidth <= 768 ? "center" : "left",
                }}
              >
                <h4 style={{ color: "#667eea", marginBottom: "8px" }}>
                  Known For
                </h4>
                <p>{person.known_for_department}</p>
              </div>

              {person.birthday && (
                <div
                  style={{
                    textAlign: window.innerWidth <= 768 ? "center" : "left",
                  }}
                >
                  <h4 style={{ color: "#667eea", marginBottom: "8px" }}>
                    Birthday
                  </h4>
                  <p>
                    {new Date(person.birthday).toLocaleDateString()}
                    {calculateAge(person.birthday, person.deathday) &&
                      ` (${calculateAge(
                        person.birthday,
                        person.deathday
                      )} years old)`}
                  </p>
                </div>
              )}

              {person.place_of_birth && (
                <div
                  style={{
                    textAlign: window.innerWidth <= 768 ? "center" : "left",
                  }}
                >
                  <h4 style={{ color: "#667eea", marginBottom: "8px" }}>
                    Place of Birth
                  </h4>
                  <p>{person.place_of_birth}</p>
                </div>
              )}

              {person.deathday && (
                <div
                  style={{
                    textAlign: window.innerWidth <= 768 ? "center" : "left",
                  }}
                >
                  <h4 style={{ color: "#667eea", marginBottom: "8px" }}>
                    Died
                  </h4>
                  <p>{new Date(person.deathday).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title">Filmography</h2>
        {credits.length > 0 ? (
          <div className="grid grid-4">
            {credits.map((credit) => (
              <div key={`${credit.id}-${credit.credit_id}`} className="card">
                <img
                  src={
                    credit.poster_path
                      ? `https://image.tmdb.org/t/p/w300${credit.poster_path}`
                      : "https://via.placeholder.com/300x450/333/fff?text=No+Image"
                  }
                  alt={credit.title || credit.name}
                  style={{
                    width: "100%",
                    height: window.innerWidth <= 480 ? "250px" : "300px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const mediaType =
                      credit.media_type === "tv" ? "tv" : "movie";
                    navigate(`/${mediaType}/${credit.id}`);
                  }}
                />
                <h4
                  style={{
                    fontSize: window.innerWidth <= 480 ? "13px" : "14px",
                    marginBottom: "5px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {credit.title || credit.name}
                </h4>
                <p
                  style={{
                    opacity: 0.7,
                    fontSize: "12px",
                    marginBottom: "5px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  as {credit.character || "Unknown"}
                </p>
                <p style={{ opacity: 0.6, fontSize: "11px" }}>
                  {credit.release_date
                    ? new Date(credit.release_date).getFullYear()
                    : credit.first_air_date
                    ? new Date(credit.first_air_date).getFullYear()
                    : "N/A"}
                  {credit.media_type &&
                    ` • ${credit.media_type === "tv" ? "TV Show" : "Movie"}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <p style={{ opacity: 0.7 }}>No filmography available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetails;
