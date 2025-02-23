const express = require("express");
const fs = require("fs").promises;
const { extractTextFromPDF } = require("../utils/pdfExtractor");
const { validateCitations } = require("../utils/citationValidator");

const router = express.Router();

module.exports = (upload) => {
  router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    try {
      // Ensure file is a PDF
      if (req.file.mimetype !== "application/pdf") {
        await fs.unlink(req.file.path); // Remove non-PDF file
        return res.status(400).json({ error: "Only PDF files are allowed." });
      }

      // Extract text from PDF
      const text = await extractTextFromPDF(req.file.path);

      if (!text || text.trim().length === 0) {
        await fs.unlink(req.file.path); // Clean up corrupted PDF
        return res.status(400).json({ error: "Could not extract text from PDF. It might be corrupted or password-protected." });
      }

      // Validate citations in extracted text
      const validationResults = validateCitations(text);

      // Delete the uploaded file after processing
      await fs.unlink(req.file.path);

      // Send validation results
      return res.json(validationResults);
    } catch (error) {
      console.error("Error processing file:", error.message);

      // Attempt to clean up the uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError.message);
      }

      return res.status(500).json({ error: "Internal server error while processing the file." });
    }
  });

  return router;
};
