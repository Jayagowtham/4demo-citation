const express = require("express")
const multer = require("multer")
const cors = require("cors")
const path = require("path")
const apiRoutes = require("./routes/api")

const app = express()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf")
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed!"))
    }
  },
})

// Enable CORS for all routes
app.use(
  cors({
    origin: ['https://4demo-citation-frontend.vercel.app'], // Add your frontend Vercel domain
    methods: ["GET", "POST"],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  }),
)

// Add OPTIONS handling for preflight requests
app.options('*', cors());

app.use(express.json())

// Add a root route handler
app.get("/", (req, res) => {
  res.json({ message: "Citation Analysis API is running" });
});

// Add a test route
app.get("/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Error handling for file upload
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size is too large. Maximum size is 10MB." })
    }
    return res.status(400).json({ error: err.message })
  }
  next(err)
});

app.use("/api", apiRoutes(upload));

// Add a general error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});


module.exports = app

