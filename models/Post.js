const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Post content is required"],
    maxlength: [5000, "Content cannot be more than 5000 characters"],
  },
  images: [
    {
      type: String,
    },
  ],
  // For shared posts //
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  // Denormalized counts for performance
  commentCount: {
    type: Number,
    default: 0,
  },
  reactionCount: {
    type: Number,
    default: 0,
  },
  reactionCounts: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    haha: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },

}, {
  timestamps: true
});

// Update the updatedAt field before saving
// postSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Virtual for reactions
postSchema.virtual("reactions", {
  ref: "Reaction",
  localField: "_id",
  foreignField: "post",
});

// Virtual for comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

// Enable virtuals in JSON
// postSchema.set("toJSON", { virtuals: true });
// postSchema.set("toObject", { virtuals: true });

// Indexes for performance
// postSchema.index({ createdAt: -1 }); // Sort by newest
// postSchema.index({ author: 1, createdAt: -1 }); // User's posts
// postSchema.index({ originalPost: 1 }); // Find shares
// postSchema.index({ reactionCount: -1 }); // Sort by popularity

module.exports = mongoose.model("Post", postSchema);


/// đã copy xong