const express = require("express");
const Chat = require("../models/Chat");
const Group = require("../models/Group");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/:groupId", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const message = new Chat({
      group: req.params.groupId,
      sender: req.user._id,
      ...req.body,
    });
    await message.save();
    await message.populate("sender", "username profilePicture");
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:groupId", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const messages = await Chat.find({ group: req.params.groupId })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
