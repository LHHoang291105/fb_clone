const express = require("express");
const router = express.Router();
const authMW = require("../middleware/authmw");
const Post = require("../models/Post");

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email").populate({
      path: "originalPost",
      populate: { path: 'author', select: 'name email avatar' }
    }).lean();
    res.status(200).json({ data: posts, total: posts.length });
  } catch (err) {
    res.status(500).json({ message: `Lỗi khi lấy bài viết:  ${err.message}` });
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

router.post("/share", authMW, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu content",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không còn tồn tại",
      });
    }

    const newPost = new Post({
      author: userId,
      content: content,
      originalPost: postId,
    });

    await newPost.save();

    // Tìm bài chia sẻ rồi cộng sô lần chia sẻ
    await Post.findByIdAndUpdate(postId, {
      $inc: {
        shareCount: 1,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Lỗi khi chia sẻ bài viết:  ${err.message}` });
  }
});

module.exports = router;
