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

/**
 * @swagger
 * /api/recent:
 *   get:
 *     summary: Get recent bird sightings
 *     description: Retrieve a list of recent bird sightings in descending order by date.
 *     responses:
 *       200:
 *         description: A list of recent bird sightings
 *       500:
 *         description: Internal server error occurred
 */
router.get("/recent", async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

// GeoDataSource.com (C) All Rights Reserved 2022
// Licensed under LGPLv3.
const distance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

/**
 * @swagger
 * /api/nearby:
 *   post:
 *     summary: Get nearby bird sightings
 *     description: Get bird sightings sorted by proximity to a given location
 *     requestBody:
 *       description: Location coordinates
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                 required:
 *                   - lat
 *                   - lng
 *     responses:
 *       200:
 *         description: Return bird sightings sorted by proximity to a given location
 *       500:
 *         description: Internal server error
 */
router.post("/nearby", async (req, res) => {
  const {
    location: { lat, lng },
  } = req.body;

  try {
    const posts = await Post.find({});

    posts.sort((a, b) => {
      const lat1 = parseFloat(a.location.split(" ")[0]);
      const long1 = parseFloat(a.location.split(" ")[1]);
      const lat2 = parseFloat(b.location.split(" ")[0]);
      const long2 = parseFloat(b.location.split(" ")[1]);

      const distance1 = distance(lat1, long1, lat, lng);
      const distance2 = distance(lat2, long2, lat, lng);

      return distance1 - distance2;
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

/**
 * @swagger
 * /api/add:
 *   post:
 *     summary: Add a new bird sighting
 *     description: Add a new bird sighting to the database
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: sighting
 *         description: The bird sighting object to add
 *         schema:
 *           type: object
 *           properties:
 *             date:
 *               type: string
 *               format: date-time
 *               description: The date of the sighting
 *             description:
 *               type: string
 *               description: The description of the sighting
 *             timeZoneOffset:
 *               type: number
 *               description: The timezone offset of the client
 *             userNickname:
 *               type: string
 *               description: The nickname of the user who made the sighting
 *             location:
 *               type: string
 *               description: The location of the sighting
 *             chat:
 *               type: array
 *               description: The chat associated with the sighting
 *     responses:
 *       200:
 *         description: The sighting was added successfully
 *       400:
 *         description: Bad request - some required fields are missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post("/add", async (req, res) => {
  const {
    date: dateString,
    description,
    timeZoneOffset: clientTimeZoneOffset,
    userNickname,
    location,
    chat,
  } = req.body;

  if (
    dateString === undefined ||
    description === undefined ||
    userNickname === undefined ||
    location === undefined ||
    clientTimeZoneOffset === undefined ||
    !Array.isArray(chat)
  ) {
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
    userNickname,
    location,
    chat,
  });

  try {
    await post.save();
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

/**
 * @swagger
 *
 * /api/post:
 *   get:
 *     summary: Get a specific bird sighting post by ID.
 *     description: Retrieve a bird sighting post by ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the bird sighting post to retrieve.
 *     responses:
 *       '200':
 *         description: A JSON object containing the details of the requested bird sighting post.
 *       '500':
 *          description: Internal server error
 */
router.get("/post", async (req, res) => {
  try {
    const id = req.query.id;
    const post = await Post.findById(id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

router.post("/message", async (req, res) => {
  try {
    const {
      postId,
      message,
      nickname,
      date: dateString,
      timeZoneOffset: clientTimeZoneOffset,
    } = req.body;

    // Store time in DB in UTC timezone
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    date.setMinutes(date.getMinutes() + clientTimeZoneOffset);

    const post = await Post.findById(postId);
    post.chat.push({ userNickname: nickname, message, date });
    post.chat.sort((a, b) => a.date - b.date);
    post.save();
    res.json({ status: "OK" });
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

module.exports = router;
