const express = require("express");
const router = express.Router();
const authMW = require("../middleware/authmw");
const Post = require("../models/Post");

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email").lean();
    res.status(200).json({ data: posts, total: posts.length });
  } catch (err) {
    res
      .status(500)
       .json({ message: `Lỗi khi lấy bài viết:  ${err.message}` });
  }
});

router.post("/", authMW, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Nhập cho đủ vào" });
    }
    const newPost = new Post({
      content: req.body.content,
      author: userId,
    });
    await newPost.save();

    return res.status(200).json({ newPost: newPost });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Lỗi khi tạo bài viết:  ${err.message}` });
  }
});

module.exports = router;
