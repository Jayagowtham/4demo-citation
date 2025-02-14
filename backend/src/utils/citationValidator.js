const citationRules = {
    inTextCitations: {
        // More flexible patterns that account for variations
        directQuotation: /([A-Za-z\s-]+,\s*\d{4},\s*p\.\s*\d+)/gi, // Adjusted to ensure it captures the format correctly,
        indirectParaphrase: /([A-Za-z\s-]+,\s*\d{4})/gi,
        multipleAuthors: /([A-Za-z\s-]+ et al\.,\s*\d{4})/gi,
    },
    referenceList: {
        books: /([A-Z][a-z'-]+,\s*[A-Z]\.\s*\(\d{4}\)\.\s*[^.]+\.\s*([^:]+)?:?[^.]+\.)/gi,
        journalArticles: /([A-Z][a-z'-]+,\s*[A-Z]\.\s*\(\d{4}\)\.\s*[^.]+\.\s*([A-Za-z\s]+),?\s*(\d{1,2})\(\d+\),?\s*\d+(?:-\d+)?\.)/gi,
        newsArticles: /([A-Z][a-z'-]+,\s*[A-Z]\.\s*\(\d{4},\s*[A-Za-z]+\s*\d{1,2}\)\.\s*[^.]+\.\s*[A-Z][a-z]+\s*(?:Online|Retrieved from):?\s*(https?:\/\/[^\s]+))/gi,
    },
}

function cleanText(text) {
    // Remove extra whitespace and normalize line endings
    return text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim()
}

function findCitations(text, pattern) {
    const matches = []
    let match
    while ((match = pattern.exec(text)) !== null) {
        matches.push(match[0].trim())
    }
    return [...new Set(matches)] // Remove duplicates
}

function validateCitations(text) {
    const cleanedText = cleanText(text)

    const results = {
        documentContent: text,
        inTextCitations: {
            directQuotation: [],
            indirectParaphrase: [],
            multipleAuthors: [],
        },
        referenceList: {
            books: [],
            journalArticles: [],
            onlineSources: [],
        },
        errors: [],
        details: {
            inTextCitations: {},
            referenceList: {},
        },
    }

    // Validate in-text citations
    for (const [citationType, regex] of Object.entries(citationRules.inTextCitations)) {
        const matches = findCitations(cleanedText, regex)
        results.inTextCitations[citationType] = matches
        results.details.inTextCitations[citationType] = matches

        if (matches.length === 0) {
            results.errors.push(`No ${citationType.replace(/([A-Z])/g, " $1").toLowerCase()} citations found.`)
        }
    }

    // Validate reference list
    for (const [referenceType, regex] of Object.entries(citationRules.referenceList)) {
        const matches = findCitations(cleanedText, regex)
        results.referenceList[referenceType] = matches
        results.details.referenceList[referenceType] = matches

        if (matches.length === 0) {
            results.errors.push(`No ${referenceType.replace(/([A-Z])/g, " $1").toLowerCase()} references found.`)
        }
    }

    // Cross-reference validation
    const allInTextAuthors = new Set()
    Object.values(results.inTextCitations)
        .flat()
        .forEach((citation) => {
            const authorMatch = citation.match(/\(([^,]+)/)
            if (authorMatch) {
                allInTextAuthors.add(authorMatch[1].trim().toLowerCase())
            }
        })

    const allReferenceAuthors = new Set()
    Object.values(results.referenceList)
        .flat()
        .forEach((reference) => {
            const authorMatch = reference.match(/^([^,]+)/)
            if (authorMatch) {
                allReferenceAuthors.add(authorMatch[1].trim().toLowerCase())
            }
        })

    // Check for missing references
    allInTextAuthors.forEach((author) => {
        if (!allReferenceAuthors.has(author)) {
            results.errors.push(`In-text citation for "${author}" has no corresponding reference entry.`)
        }
    })

    return results
}

module.exports = {
    validateCitations,
}

