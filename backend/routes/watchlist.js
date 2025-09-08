const express = require("express");
const Watchlist = require("../models/Watchlist");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const watchlistItem = new Watchlist({
      user: req.user._id,
      ...req.body,
    });
    await watchlistItem.save();
    res.status(201).json(watchlistItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Item already in watchlist" });
    }
    res.status(400).json({ message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };
    if (type && type !== "all") {
      filter.mediaType = type;
    }
    const watchlist = await Watchlist.find(filter).sort({ createdAt: -1 });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const { tmdbId, mediaType } = req.body;
    const item = await Watchlist.findOneAndDelete({
      user: req.user._id,
      tmdbId: parseInt(tmdbId),
      mediaType,
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found in watchlist" });
    }
    res.json({ message: "Item removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/check/:tmdbId/:mediaType", auth, async (req, res) => {
  try {
    const { tmdbId, mediaType } = req.params;
    const item = await Watchlist.findOne({
      user: req.user._id,
      tmdbId: parseInt(tmdbId),
      mediaType,
    });
    res.json({ inWatchlist: !!item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
