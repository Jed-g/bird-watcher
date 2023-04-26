const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Render the home page
 *     description: Render the home page
 *     responses:
 *       200:
 *         description: Successfully rendered the home page
 */
router.get("/", (req, res) => {
  res.render("index", {
    page: req.url,
    title: "Recent Bird Sightings",
    scripts: ["index.js"],
  });
});

/**
 * @swagger
 * /nearby:
 *   get:
 *     summary: Render the nearby bird sightings page
 *     description: Successfully rendered the nearby bird sightings page
 *     responses:
 *       200:
 *         description: Render the nearby bird sightings page
 */
router.get("/nearby", (req, res) => {
  res.render("nearby", {
    page: req.url,
    title: "Nearby Bird Sightings",
    scripts: ["nearby.js"],
  });
});


/**
 * @swagger
 * /add:
 *   get:
 *     summary: Render the add bird sighting form
 *     description: Render the add bird sighting form with necessary data for client-side rendering
 *     responses:
 *       200:
 *         description: Successfully rendered the add bird sighting form
 */
router.get("/add", (req, res) => {
  res.render("add", {
    page: req.url,
    title: "Add Bird Sighting",
    scripts: ["add.js"],
  });
});

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Render the bird sighting details page
 *     description: Render the bird sighting details page with necessary data for client-side rendering
 *     responses:
 *       200:
 *         description: Successfully rendered the bird sighting details page
 */
router.get("/post", (req, res) => {
  res.render("post", {
    page: req.url,
    title: "View Bird Sighting",
    scripts: ["post.js"],
  });
});


/**
 * @swagger
 * /edit:
 *   get:
 *     summary: Edit the bird identification of your own post
 *     description: Allows user to edit the identification of own posts'
 *     responses:
 *       200:
 *         description: Successfully rendered the edit bird identification post
 */
router.get("/edit", (req, res) => {
  res.render("edit", {
    page: req.url,
    title: "Edit Bird Identification",
    scripts: ["edit.js"],
  });
});


module.exports = router;
