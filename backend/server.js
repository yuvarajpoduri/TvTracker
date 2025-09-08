const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const watchRoutes = require("./routes/watch");
const watchlistRoutes = require("./routes/watchlist");
const statsRoutes = require("./routes/stats");
const groupRoutes = require("./routes/groups");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 Direct MongoDB URI here
const mongoURI = "mongodb://localhost:27017/tvtracker";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/watch", watchRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chat", chatRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
