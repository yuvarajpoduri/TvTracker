const mongoose = require("mongoose");

const watchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    poster: String,
    genres: [String],
    season: {
      type: Number,
      default: null,
    },
    episode: {
      type: Number,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

watchSchema.index({ user: 1, tmdbId: 1, mediaType: 1, season: 1, episode: 1 });

module.exports = mongoose.model("Watch", watchSchema);
