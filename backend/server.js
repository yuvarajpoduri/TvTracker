const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const watchRoutes = require("./routes/watch");
const watchlistRoutes = require("./routes/watchlist");
const statsRoutes = require("./routes/stats");
const groupRoutes = require("./routes/groups");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/watch", watchRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chat", chatRoutes);

const frontendPath = path.join(__dirname, "frontend", "build"); 
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
