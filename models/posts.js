const getModel = (connection) => {
  const mongoose = require("mongoose");

  const PostSchema = new mongoose.Schema({
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    userNickname: { type: String, required: true },
    chat: [{ userNickname: String, message: String, date: Date }],
  });

  const Post = connection.model("Post", PostSchema, "posts");

  return Post;
};

module.exports = getModel;
