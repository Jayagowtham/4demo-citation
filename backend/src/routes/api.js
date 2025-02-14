const express = require("express")
const fs = require("fs").promises
const { extractTextFromPDF } = require("../utils/pdfExtractor")
const { validateCitations } = require("../utils/citationValidator")

const router = express.Router()

module.exports = (upload) => {
  router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." })
    }

    try {
      // Validate file type
      if (req.file.mimetype !== "application/pdf") {
        await fs.unlink(req.file.path) // Clean up invalid file
        return res.status(400).json({ error: "Only PDF files are allowed." })
      }

      const text = await extractTextFromPDF(req.file.path)

      if (!text || text.trim().length === 0) {
        return res
          .status(400)
          .json({ error: "Could not extract text from PDF. The file might be corrupted or password protected." })
      }

      const validationResults = validateCitations(text)

      // Clean up uploaded file after processing
      await fs.unlink(req.file.path)

      res.json(validationResults)
    } catch (error) {
      console.error("Error processing file:", error)
      // Attempt to clean up file in case of error
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError)
      }
      res.status(500).json({ error: "Error processing the file: " + error.message })
    }
  })

  return router
}

