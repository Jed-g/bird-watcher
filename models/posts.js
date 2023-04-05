const getModel = (connection) => {
  const mongoose = require("mongoose");

  const PostSchema = new mongoose.Schema({
    property_1: { type: String },
  });

  const Post = connection.model("Post", PostSchema, "posts");

  return Post;
};

module.exports = getModel;
