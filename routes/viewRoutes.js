const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register page
router.get("/register", (req, res) => {
  res.render("register");
});

// Admin dashboard
router.get("/admin", async (req, res) => {
  try {
    const { userSearch, postSearch } = req.query;

    // USER FILTER
    let userFilter = {};
    if (userSearch) {
      userFilter = {
        $or: [
          { name: { $regex: userSearch, $options: "i" } },
          { email: { $regex: userSearch, $options: "i" } },
        ],
      };
    }

    // POST FILTER
    let postFilter = {};
    if (postSearch) {
      postFilter = {
        title: { $regex: postSearch, $options: "i" },
      };
    }

    const users = await User.find(userFilter).select("-password");

    const posts = await Post.find(postFilter)
      .populate("author", "name")
      .sort({ createdAt: -1 });

    res.render("admin", {
      users,
      posts,
      title: "Admin Dashboard - Crocoreads",
      cssFile: "admin",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Home page
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.render("home", {
      posts,
      title: "Home - Crocoreads",
      cssFile: "home",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Create post page
router.get("/createpost", (req, res) => {
  res.render("createpost", {
    title: "Write a post",
    cssFile: "createpost",
  });
});

// Profile page
router.get("/profile", protect, async (req, res) => {
  try {
    const user = req.user;

    if (!user) return res.status(404).send("User not found");

    // Fetch posts authored by this user
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

    // Render profile.ejs
    res.render("profile", { user, posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Single post page
router.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("post", {
      post,
      title: post.title,
      cssFile: "post",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
