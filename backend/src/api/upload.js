const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Adjust as needed
const fs = require("fs").promises;
const { extractTextFromPDF } = require("../utils/pdfExtractor");
const { validateCitations } = require("../utils/citationValidator");

module.exports = (req, res) => {
  if (req.method === "POST") {
    upload.single("file")(req, res, async (err) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      try {
        // Validate file type
        if (req.file.mimetype !== "application/pdf") {
          await fs.unlink(req.file.path); // Clean up invalid file
          return res.status(400).json({ error: "Only PDF files are allowed." });
        }

        const text = await extractTextFromPDF(req.file.path);

        if (!text || text.trim().length === 0) {
          return res.status(400).json({ error: "Could not extract text from PDF." });
        }

        const validationResults = validateCitations(text);

        // Clean up uploaded file after processing
        await fs.unlink(req.file.path);

        res.json(validationResults);
      } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Error processing the file: " + error.message });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};