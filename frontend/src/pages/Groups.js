import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    genres: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Sci-Fi",
    "Romance",
    "Thriller",
    "Documentary",
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setGroups(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setLoading(false);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGroup),
      });
      const group = await response.json();
      setGroups([group, ...groups]);
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "", genres: [] });
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const toggleGenre = (genre) => {
    setNewGroup((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 className="section-title">My Groups</h1>
        <button className="btn" onClick={() => setShowCreateModal(true)}>
          Create Group
        </button>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-2">
          {groups.map((group) => (
            <div key={group._id} className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{group.name}</h3>
                  <p style={{ opacity: 0.7, fontSize: "14px" }}>
                    {group.members.length} members
                  </p>
                </div>
              </div>
              <p style={{ marginBottom: "15px", opacity: 0.8 }}>
                {group.description}
              </p>
              <div style={{ marginBottom: "15px" }}>
                {group.genres.map((genre) => (
                  <span
                    key={genre}
                    style={{
                      background: "rgba(102, 126, 234, 0.2)",
                      color: "#667eea",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      marginRight: "5px",
                      marginBottom: "5px",
                      display: "inline-block",
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/groups/${group._id}/chat`)}
                >
                  Open Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "60px" }}>
          <h3 style={{ marginBottom: "15px", opacity: 0.8 }}>No groups yet</h3>
          <p style={{ opacity: 0.6, marginBottom: "30px" }}>
            Create or join groups to share your movie and TV experiences with
            friends!
          </p>
          <button className="btn" onClick={() => setShowCreateModal(true)}>
            Create Your First Group
          </button>
        </div>
      )}

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "20px" }}>Create New Group</h3>
            <form onSubmit={createGroup}>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  placeholder="Describe your group"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Preferred Genres</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "none",
                        background: newGroup.genres.includes(genre)
                          ? "linear-gradient(45deg, #667eea, #764ba2)"
                          : "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Create Group
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
