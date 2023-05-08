const getModel = (connection) => {
  const mongoose = require("mongoose");

  const PostSchema = new mongoose.Schema({
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    userNickname: { type: String, required: true },
    location: { type: String, required: true },
    chat: [{ userNickname: String, message: String, date: Date }],
    identified: { type: Boolean, default: false },
    label: { type: String },
    abstract: { type: String },
    uri: { type: String },
    photo: {type: String}
  });

  const Post = connection.model("Post", PostSchema, "posts");

  return Post;
};

module.exports = getModel;
