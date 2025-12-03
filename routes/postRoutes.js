const express = require("express");
const router = express.Router();
const postController = require("../controllers/reactionController");

router.get("/posts/reaction", reactionController.getAll);

module.exports = router;

// a thì là mà
// userID nào, postId nào, thả react gì ?
// xong có array chứa lượng react
// array sẽ có những object "like" "haha" "wow" ,...
// đếm số lượng "like" "haha" "wow" ,...