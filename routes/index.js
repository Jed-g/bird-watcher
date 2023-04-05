const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const connection = mongoose.createConnection(
  process.env.MONGODB_CONNECTION_URI
);

let Post;

connection.once("open", () => {
  console.log("Connected to Database (Sightings API)");
  Post = require("../models/posts")(connection);
});

router.get("/", (req, res) => {
  res.render("index", {
    page: req.url,
    title: "Recent Bird Sightings",
    scripts: ["index.js"],
  });
});

router.get("/nearby", (req, res) => {
  res.render("nearby", {
    page: req.url,
    title: "Nearby Bird Sightings",
    scripts: ["index.js"],
  });
});

router.get("/add", (req, res) => {
  res.render("add", {
    page: req.url,
    title: "Add Bird Sighting",
    scripts: ["index.js"],
  });
});

module.exports = router;
