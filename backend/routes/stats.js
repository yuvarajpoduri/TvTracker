const express = require("express");
const Watch = require("../models/Watch");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      movieStats,
      tvStats,
      recentActivity,
      genreStats,
      marathonStats,
      activityHeatmap,
    ] = await Promise.all([
      Watch.aggregate([
        { $match: { user: userId, mediaType: "movie" } },
        {
          $group: {
            _id: null,
            totalMovies: { $sum: 1 },
            uniqueMovies: { $addToSet: "$tmdbId" },
            totalTime: { $sum: 120 },
          },
        },
        {
          $project: {
            totalMovies: 1,
            uniqueMovies: { $size: "$uniqueMovies" },
            totalTime: 1,
          },
        },
      ]),

      Watch.aggregate([
        { $match: { user: userId, mediaType: "tv" } },
        {
          $group: {
            _id: null,
            totalEpisodes: { $sum: 1 },
            uniqueShows: { $addToSet: "$tmdbId" },
            totalTime: { $sum: 45 },
          },
        },
        {
          $project: {
            totalEpisodes: 1,
            uniqueShows: { $size: "$uniqueShows" },
            totalTime: 1,
          },
        },
      ]),

      Watch.find({
        user: userId,
        watchedAt: { $gte: sevenDaysAgo },
      }).countDocuments(),

      Watch.aggregate([
        { $match: { user: userId } },
        { $unwind: "$genres" },
        {
          $group: {
            _id: {
              genre: "$genres",
              mediaType: "$mediaType",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Watch.aggregate([
        { $match: { user: userId, mediaType: "tv" } },
        {
          $group: {
            _id: "$tmdbId",
            title: { $first: "$title" },
            episodeCount: { $sum: 1 },
          },
        },
        { $sort: { episodeCount: -1 } },
        { $limit: 5 },
      ]),

      Watch.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: {
              year: { $year: "$watchedAt" },
              month: { $month: "$watchedAt" },
              day: { $dayOfMonth: "$watchedAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
            count: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
    ]);

    const stats = {
      movies: movieStats[0] || {
        totalMovies: 0,
        uniqueMovies: 0,
        totalTime: 0,
      },
      tv: tvStats[0] || { totalEpisodes: 0, uniqueShows: 0, totalTime: 0 },
      recentActivity,
      topGenres: genreStats,
      biggestMarathons: marathonStats,
      activityHeatmap: activityHeatmap,
    };

    const totalTime = stats.movies.totalTime + stats.tv.totalTime;
    stats.overall = {
      totalTime,
      totalDays: Math.floor(totalTime / (24 * 60)),
      totalHours: Math.floor(totalTime / 60),
      totalItems: stats.movies.uniqueMovies + stats.tv.uniqueShows,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
