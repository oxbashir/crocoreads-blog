const Post = require("../models/Post");
const { uploadToCloudinary } = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

// [POST] Create Post
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    let imageUrl = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "posts");
      imageUrl = result.secure_url;
    }

    const post = new Post({
      title,
      content,
      author: req.user.id,
      image: imageUrl,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// [GET] All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name") // populate author name
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [GET] Single Post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [PUT] Update Post
exports.updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    // Only author can update
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    post.title = title || post.title;
    post.content = content || post.content;

    // Update image if provided
    if (req.file) {
      // Optional: Delete old image from Cloudinary
      if (post.image) {
        const publicId = post.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`posts/${publicId}`);
      }

      const result = await uploadToCloudinary(req.file.buffer, "posts");
      post.image = result.secure_url;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// [DELETE] Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    // Only author can delete
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    // Delete image from Cloudinary
    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`posts/${publicId}`);
    }

    await post.remove();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
