const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    poster: String,
    year: Number,
    overview: String,
  },
  {
    timestamps: true,
  }
);

watchlistSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });

module.exports = mongoose.model("Watchlist", watchlistSchema);
