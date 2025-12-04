const express = require("express");
const app = express();
const Post = require("./models/Post");
const mongoose = require("mongoose");
const Comment = require("./models/Comment");
const dotenv = require("dotenv");
const commentRoutes = require("./routes/commentRoutes");
const authMW = require("./middleware/authmw");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");

dotenv.config();

app.use(express.json());

async function connectDatabase() {
  try {
    await mongoose.connect(
      `mongodb+srv://Hoang:Hoang100705291105@learningapp.ekgftlk.mongodb.net/fbfoxyra`
    );
    console.log("Kết nối Database thành công !!!");
  } catch (err) {
    console.log("Lỗi kết nối Database: ", err.message);
  }
}

//  Hàm kết nối Database
connectDatabase();

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRoutes);

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
