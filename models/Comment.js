const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [1000, "Comment cannot be more than 1000 characters"],
    },
    // For nested comments (replies)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    // Denormalized reply count for performance
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
// commentSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Virtual for replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

// Enable virtuals in JSON
// commentSchema.set("toJSON", { virtuals: true });
// commentSchema.set("toObject", { virtuals: true });

// Indexes for performance
// commentSchema.index({ post: 1, createdAt: -1 }); // Comments of a post
// commentSchema.index({ post: 1, parentComment: 1 }); // Nested comments
// commentSchema.index({ author: 1, createdAt: -1 }); // User's comments
// commentSchema.index({ parentComment: 1 }); // Find replies

module.exports = mongoose.model("Comment", commentSchema);
