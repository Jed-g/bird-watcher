const mongoose = require("mongoose");

const connection = mongoose.createConnection(
  process.env.MONGODB_CONNECTION_URI
);

let Post;

connection.once("open", () => {
  console.log("Connected to Database (Chat API)");
  Post = require("../models/posts")(connection);
});

exports.init = (io) => {
  io.sockets.on("connection", (socket) => {
    try {
      socket.on("joinRoom", ({ postId }) => {
        socket.join(postId);
      });

      socket.on("message", async ({ postId, message, nickname }) => {
        socket.to(postId).emit("message", { message, nickname });

        const post = await Post.findById(postId);
        post.chat.push({ userNickname: nickname, message, date: new Date() });
        post.chat.sort((a, b) => a.date - b.date);
        post.save();
      });
    } catch (e) {
      console.log(e);
    }
  });
};
