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
    scripts: ["add.js"],
  });
});

router.post("/add", async (req, res) => {
  const {
    date: dateString,
    description,
    timeZoneOffset: clientTimeZoneOffset,
  } = req.body;

  if (!dateString || !description) {
    res.status(400).json({ message: "BAD REQUEST" });
    return;
  }

  // Store time in DB in UTC timezone
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  date.setMinutes(date.getMinutes() + clientTimeZoneOffset);

  const post = new Post({
    date,
    description,
  });

  try {
    await post.save();
    res.redirect("/");
  } catch (error) {
    res.status(400).json({ status: "BAD REQUEST" });
  }
});

module.exports = router;
