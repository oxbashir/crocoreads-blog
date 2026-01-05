const mongoose = require("mongoose");

// Post Schema
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String, // store Cloudinary URL here
      default: null,
    },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Post", postSchema);
