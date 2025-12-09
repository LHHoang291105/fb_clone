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

    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "name email"
    );

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/:commentId", authMW, async (req, res) => {
  //Kiểm tra bài post đang bình luận
  //kiểm tra xem có comment cha ko
  //kiểm tra content nhập chưa

  // 1.content
  // 2.postId
  // 4.commentId
  // 3.author

  try {
    const { content } = req.body;
    const commentId = req.params.commentId;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).status({
        success: false,
        message: "Vui lòng nhập content bình luận",
      });
    }

    const updatedComment = await Comment.findOne({
      _id: commentId,
      author: userId,
    });

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: "Không tồn tại comment",
      });
    }

    updatedComment.content = content;
    await updatedComment.save();

    return res.status(200).json({
      success: true,
      message: "Sửa comment thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Lỗi khi sửa comment: ${error.message}`,
    });
  }
});

router.delete("/:commentId", authMW, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.userId;

    const comment = await Comment.findOne({
      _id: commentId,
      author: userId,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Binh luan ko ton tai",
      });
    }

    // cập nhật lại số comment trên bản ghi Post

    // Hàm đệ quy
    let count = 1;
    async function deleteReplies(parentId) {
      const childrenComments = await Comment.find({ parentComment: parentId });

      const childrenCommentsLength = childrenComments.length;
      count += childrenCommentsLength;

      for (const children of childrenComments) {
        await deleteReplies(children.parentComment);
        await Comment.deleteOne({
          _id: children._id,
        });
        // count++;
      }
    }

    deleteReplies(commentId);

    await Comment.deleteOne({
      _id: commentId,
    });

    await Post.findByIdAndUpdate(comment.post, {
      $inc: {
        commentCount: -count,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Đã xóa thành công comment" });
  } catch (error) {
    return res.json({
      success: true,
      message: `Lỗi khi xóa comment: ${error.message}`,
    });
  }
});

router.get("/:postId", authMW, async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "name avatar"
    );

    // Hàm đệ quy
    function buildCommentsTree(allComments, parentComment) {
      const result = [];

      allComments
        .filter((item) => {
          const parentId = item.parentComment
            ? item.parentComment.toString()
            : null;

          return parentId === parentComment;
        })
        .forEach((comment) => {
          const childrenComments = buildCommentsTree(
            allComments,
            comment._id.toString()
          );
          comment.comments = childrenComments;
          result.push(comment);
        });

      return result;
    }

    // Chạy hàm đệ quy
    const commentData = buildCommentsTree(comments, null);

    return res.json({
      success: true,
      comments: commentData,
    });
  } catch {}
});

module.exports = router;
