const express = require("express");
const Group = require("../models/Group");
const User = require("../models/User");
const Watch = require("../models/Watch");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const group = new Group({
      ...req.body,
      admin: req.user._id,
      members: [req.user._id],
    });
    await group.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id },
    });
    await group.populate("members admin", "username profilePicture");
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members admin", "username profilePicture")
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/join", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }
    group.members.push(req.user._id);
    await group.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id },
    });
    await group.populate("members admin", "username profilePicture");
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/stats", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const stats = await Watch.aggregate([
      { $match: { user: { $in: group.members } } },
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const totalWatches = await Watch.countDocuments({
      user: { $in: group.members },
    });
    res.json({ topGenres: stats, totalWatches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
