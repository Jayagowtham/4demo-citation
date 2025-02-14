const app = require("./app");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// Enable CORS for the frontend
app.use(cors({ origin: "*" }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global error handler
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Perform cleanup if necessary
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Perform cleanup if necessary
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload directory: ${uploadsDir}`);
});
