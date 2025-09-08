const express = require("express");
const Watch = require("../models/Watch");
const Watchlist = require("../models/Watchlist");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { tmdbId, mediaType, season, episode } = req.body;

    const existingWatch = await Watch.findOne({
      user: req.user._id,
      tmdbId,
      mediaType,
      season: season || null,
      episode: episode || null,
    });

    if (existingWatch) {
      return res.status(400).json({ message: "Already marked as watched" });
    }

    const watchData = {
      user: req.user._id,
      ...req.body,
    };
    const watch = new Watch(watchData);
    await watch.save();

    await Watchlist.findOneAndDelete({
      user: req.user._id,
      tmdbId,
      mediaType,
    });

    res.status(201).json(watch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const watches = await Watch.find({
      user: req.user._id,
      mediaType: "movie",
    })
      .sort({ watchedAt: -1 })
      .limit(20);
    res.json(watches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/currently-watching", auth, async (req, res) => {
  try {
    const pipeline = [
      { $match: { user: req.user._id, mediaType: "tv" } },
      {
        $group: {
          _id: "$tmdbId",
          title: { $first: "$title" },
          poster: { $first: "$poster" },
          maxSeason: { $max: "$season" },
          maxEpisode: { $max: "$episode" },
          lastWatched: { $max: "$watchedAt" },
          totalEpisodes: { $sum: 1 },
        },
      },
      { $sort: { lastWatched: -1 } },
    ];
    const currentlyWatching = await Watch.aggregate(pipeline);
    res.json(currentlyWatching);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/progress/:tmdbId", auth, async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const progress = await Watch.find({
      user: req.user._id,
      tmdbId: parseInt(tmdbId),
      mediaType: "tv",
    }).sort({ season: 1, episode: 1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/check/:tmdbId/:mediaType", auth, async (req, res) => {
  try {
    const { tmdbId, mediaType } = req.params;
    const { season, episode } = req.query;

    const query = {
      user: req.user._id,
      tmdbId: parseInt(tmdbId),
      mediaType,
    };

    if (season) query.season = parseInt(season);
    if (episode) query.episode = parseInt(episode);

    const watch = await Watch.findOne(query);
    res.json({ isWatched: !!watch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const watch = await Watch.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!watch) {
      return res.status(404).json({ message: "Watch entry not found" });
    }
    res.json({ message: "Watch entry deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/remove", auth, async (req, res) => {
  try {
    const { tmdbId, mediaType, season, episode } = req.body;
    const query = {
      user: req.user._id,
      tmdbId: parseInt(tmdbId),
      mediaType,
    };

    if (season) query.season = parseInt(season);
    if (episode) query.episode = parseInt(episode);

    const watch = await Watch.findOneAndDelete(query);
    if (!watch) {
      return res.status(404).json({ message: "Watch entry not found" });
    }
    res.json({ message: "Removed from watched" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
