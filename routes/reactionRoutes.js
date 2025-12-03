const express = require("express");
const router = express.Router();
const Reaction = require("../models/Reaction");
const Post = require("../models/Post");
const authMW = require("../middleware/authmw");

router.get("/posts/react", authMW, async (req, res) => {
  try {
    const { postId, type } = req.body;

    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validReactions.includes(type))
      return res
        .status(500)
        .json({ success: false, message: "Không có biểu cảm này" });

    if (!postId || !type)
      return res
        .status(400)
        .json({ message: "Hãy nhập id bài viết và reaction" });

    const user = req.user.userId;

    const updatedPost = await Post.findById("postId");
    if (!updatedPost)
      return res.status(404).json({ message: "Không tìm thấy bài viết" });

    const newReaction = new Reaction({ postId, type, user });
    await newReaction.save();

    //const newReactionCount = new Post.reaction
    await Post.findByIdAndUpdate(postId, {
      $inc: {
        reactionCount: 1,
        [`reactionCounts.${type}`]: 1,
      },
    });

    res.status(200).json({ success: true, message: "đã ném cảm xúc cho bạn" });
  } catch (error) {}
});

router.put("/posts/react", authMW, async (req, res) => {
  try {
    const { postId, type } = req.body;

    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validReactions.includes(type))
      return res
        .status(500)
        .json({ success: false, message: "Không có biểu cảm này" });

    if (!postId || !type)
      return res
        .status(400)
        .json({ message: "Hãy nhập id bài viết và reaction" });

    const user = req.user.userId;

    const updatedPost = await Post.findById("postId");
    if (!updatedPost)
      return res.status(404).json({ message: "Không tìm thấy bài viết" });

    const updatedReaction = await Reaction.findOne({
      post: postId,
      user: userId,
    });
    if (!updatedReaction) return res.status(500);

    const oldType = updatedReaction.type;
    if (oldType !== type) {
      updatedReaction.type = type;
      await updatedReaction.save();

      await Post.findByIdAndUpdate(postId, {
        $inc: {
          // reactionCount: 0,
          [`reactionCounts${type}`]: 1,
          [`reactionCounts${oldType}`]: -1,
        },
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "đã thay đổi cảm xúc" });
  } catch (error) {}
});

router.delete("/posts/react", authMW, async (req, res) => {
  const { postId, type } = req.body;
  if (!postId) return res.status(400).json({ message: "Hãy nhập id bài viết" });

  const user = req.user.userId;
  const updatedPost = await Post.findById(postId);
  if (!updatedPost)
    return res.status(404).json({ message: "Không tìm thấy bài viết" });

  const deletedReaction = await Reaction.findOneAndDelete({
    post: postId,
    user: userId,
  });
  if (!deletedReaction) return res.status(500);

  await Post.findByIdAndUpdate(postId, {
    $inc: {
      reactionCount: -1,
      [`reactionCounts${type}`]: -1,
    },
  });
});


module.exports = router;
