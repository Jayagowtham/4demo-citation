const pdf = require("pdf-parse")
const fs = require("fs")

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const options = {
      pagerender: function(pageData) {
        return pageData.getTextContent()
          .then(function(textContent) {
            let lastY, text = ""
            const items = textContent.items
            for (let i = 0; i < items.length; i++) {
              const item = items[i]
              if (lastY == item.transform[5] || !lastY) {
                text += item.str
              } else {
                text += "\n" + item.str
              }
              lastY = item.transform[5]
            }
            return text
          })
      }
    }

    const data = await pdf(dataBuffer, options)
    return data.text
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

module.exports = {
  extractTextFromPDF,
}

