import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
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
      const response = await fetch("https://tvtracker-j7g5.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
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
        Welcome Back
      </h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: "100%", marginBottom: "20px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ textAlign: "center", color: "#e0e0e0" }}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: "#667eea" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
