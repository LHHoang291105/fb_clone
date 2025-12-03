const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
reactionSchema.index({ user: 1, post: 1 }, { unique: true }); // One reaction per user per post
reactionSchema.index({ post: 1, type: 1 }); // Aggregate reactions by type
reactionSchema.index({ post: 1, createdAt: -1 }); // Latest reactions

module.exports = mongoose.model("Reaction", reactionSchema);
