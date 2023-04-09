const express = require("express");
const router = express.Router();

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

module.exports = router;
