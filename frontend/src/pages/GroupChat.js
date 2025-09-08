import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GroupChat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchGroup();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchGroup = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const groups = await response.json();
      const currentGroup = groups.find((g) => g._id === id);
      setGroup(currentGroup);
    } catch (error) {
      console.error("Error fetching group:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/chat/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage,
          messageType: "text",
        }),
      });

      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <h3>Group not found</h3>
          <Link to="/groups" className="btn">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "10px",
          }}
        >
          <Link
            to="/groups"
            style={{ color: "#667eea", textDecoration: "none" }}
          >
            ← Back to Groups
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
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
            <h2>{group.name}</h2>
            <p style={{ opacity: 0.7 }}>{group.members.length} members</p>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div
              style={{ textAlign: "center", opacity: 0.7, marginTop: "50px" }}
            >
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`message ${
                  message.sender._id === currentUser.id ? "own" : ""
                }`}
              >
                <div className="message-avatar">
                  {message.sender.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="message-content">
                    {message.messageType === "media" && message.mediaData ? (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w92${message.mediaData.poster}`}
                            alt={message.mediaData.title}
                            style={{
                              width: "40px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <div>
                            <strong>{message.mediaData.title}</strong>
                            <p
                              style={{
                                fontSize: "12px",
                                opacity: 0.8,
                                margin: 0,
                              }}
                            >
                              {message.mediaData.mediaType === "tv"
                                ? "TV Show"
                                : "Movie"}
                            </p>
                          </div>
                        </div>
                        <p>{message.content}</p>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.6,
                      marginTop: "5px",
                      textAlign:
                        message.sender._id === currentUser.id
                          ? "right"
                          : "left",
                    }}
                  >
                    {message.sender.username} • {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
