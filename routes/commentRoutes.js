const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMW = require("../middleware/authmw");

router.post("/", authMW, async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;
    const userId = req.user.userId;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Bài viết không tồn tại" });
    }

    if (parentId) {
      const parentComment = await Comment.findById(parentId);

      if (!parentComment) {
        return res
          .status(404)
          .json({ success: false, message: "Bình luận không tồn tại" });
      }
    }

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Phải có content" });
    }

    const newComment = new Comment({
      post: postId,
      author: userId,
      parentComment: parentId || null,
      content: content,
    });

    await newComment.save();

    await Post.findByIdAndUpdate(postId, {
      $inc: {
        commentCount: 1,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Bình luận thành công!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      parentComment: parentId,
    });
  }
});

router.get("/:postId", authMW, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    const comments = await Comment.find({ post: postId }).populate("author", "name email");

    return res.status(200).json({
      success: true,
      comments
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
