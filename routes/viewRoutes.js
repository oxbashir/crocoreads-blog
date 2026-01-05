const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register page
router.get("/register", (req, res) => {
  res.render("register");
});

// Home page
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.render("home", { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Create post page
router.get("/createpost", (req, res) => res.render("createpost"));

// Single post page
router.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("post", { post });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
