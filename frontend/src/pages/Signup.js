import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="form-container glass-card">
      <h2
        style={{ textAlign: "center", marginBottom: "30px", fontSize: "2rem" }}
      >
        Join TvTracker
      </h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            minLength="6"
          />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: "100%", marginBottom: "20px" }}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <p style={{ textAlign: "center", color: "#e0e0e0" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#667eea" }}>
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
