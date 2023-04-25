const express = require("express");
const router = express.Router();
const axios = require("axios");

const mongoose = require("mongoose");

const connection = mongoose.createConnection(
  process.env.MONGODB_CONNECTION_URI
);

let Post;

connection.once("open", () => {
  console.log("Connected to Database (Sightings API)");
  Post = require("../models/posts")(connection);
});

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

const searchByURI = (uri) =>
  encodeURIComponent(`SELECT DISTINCT ?uri ?label ?abstract
  WHERE {
  ?uri rdfs:label ?label .
  ?uri dbo:abstract ?abstract .
  ?uri dbo:wikiPageWikiLink dbr:Bird .
  ?uri rdf:type dbo:Bird .
  FILTER (str(?uri) = <${uri}>)
  FILTER (langMatches(lang(?label), "en"))
  FILTER (langMatches(lang(?abstract), "en"))
  }
  LIMIT 1`);

router.post("/add", async (req, res) => {
  const {
    date: dateString,
    description,
    timeZoneOffset: clientTimeZoneOffset,
    userNickname,
    location,
    chat,
    identificationURI,
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

  let fetchSuccessful = false;
  let uri;
  let label;
  let abstract;

  if (identificationURI !== undefined) {
    try {
      const {
        results: {
          bindings: [data],
        },
      } = (
        await axios.get(
          "https://dbpedia.org/sparql?format=json&query=" +
            searchByURI(identificationURI)
        )
      ).data;

      ({
        uri: { value: uri },
        label: { value: label },
        abstract: { value: abstract },
      } = data);

      fetchSuccessful = true;
    } catch (error) {
      console.error("Error while fetching from dbpedia");
    }
  }

  // Store time in DB in UTC timezone
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  date.setMinutes(date.getMinutes() + clientTimeZoneOffset);

  let data = {
    date,
    description,
    userNickname,
    location,
    chat,
  };

  if (fetchSuccessful) {
    data = { ...data, uri, label, abstract, identified: true };
  }

  const post = new Post(data);

  try {
    await post.save();
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

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
