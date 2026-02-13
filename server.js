const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const postRoutes = require("./routes/postRoutes");
const viewRoutes = require("./routes/viewRoutes");
const path = require("path");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();
connectDB();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/posts", postRoutes);
app.use("/", viewRoutes);
app.use("/users", require("./routes/userRoutes"));
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`⚡ Server running on http://localhost:${PORT}`),
);
