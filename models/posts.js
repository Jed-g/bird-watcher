const getModel = (connection) => {
  const mongoose = require("mongoose");

  const PostSchema = new mongoose.Schema({
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    chat: [{ authorNickname: String, message: String }],
  });

  const Post = connection.model("Post", PostSchema, "posts");

  return Post;
};

module.exports = getModel;
