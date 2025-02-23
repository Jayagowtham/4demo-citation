const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const apiRoutes = require("./routes/api");

const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf");
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

// Enable CORS for frontend requests
app.use(
  cors({
    origin: ["https://4demo-citation-frontend.vercel.app"], // Adjust frontend domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Accept", "Origin", "X-Requested-With"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Citation Analysis API is running" });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Use API routes
app.use("/api", apiRoutes(upload));

// Multer error handling (file-related errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size is too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// General error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
