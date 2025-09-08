import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!currentUser) {
    return (
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(15, 15, 15, 0.95)",
          backdropFilter: "blur(20px)",
          padding: "15px 0",
          zIndex: 1000,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          height: "70px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textDecoration: "none",
            }}
          >
            TvTracker
          </Link>
          <div style={{ display: "flex", gap: "15px" }}>
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ padding: "8px 16px", fontSize: "14px" }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn"
              style={{ padding: "8px 16px", fontSize: "14px" }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "rgba(15, 15, 15, 0.95)",
        backdropFilter: "blur(20px)",
        padding: "15px 0",
        zIndex: 1000,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        height: "70px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textDecoration: "none",
          }}
        >
          TvTracker
        </Link>

        <div
          className="desktop-nav"
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "center",
            "@media (max-width: 768px)": {
              display: "none",
            },
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/watchlist"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Watchlist
          </Link>
          <Link
            to="/stats"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Stats
          </Link>
          <Link
            to="/groups"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Groups
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "10px",
            }}
          >
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <span
              style={{ color: "white", fontSize: "14px", fontWeight: "500" }}
            >
              {currentUser.username}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: "8px 16px", fontSize: "14px" }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mobile-nav" style={{ display: "none" }}>
          <button
            onClick={toggleMobileMenu}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(15, 15, 15, 0.98)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
          <Link
            to="/watchlist"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={closeMobileMenu}
          >
            Watchlist
          </Link>
          <Link
            to="/stats"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={closeMobileMenu}
          >
            Stats
          </Link>
          <Link
            to="/groups"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={closeMobileMenu}
          >
            Groups
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: "white" }}>{currentUser.username}</span>
          </div>

          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="btn btn-secondary"
            style={{ alignSelf: "flex-start" }}
          >
            Logout
          </button>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
