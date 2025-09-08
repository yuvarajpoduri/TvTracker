const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "media"],
      default: "text",
    },
    content: {
      type: String,
      required: true,
    },
    mediaData: {
      tmdbId: Number,
      title: String,
      poster: String,
      mediaType: String,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);
