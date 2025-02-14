"use client"

import { useState } from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import FileUpload from "./components/FileUpload"
import ResultsPage from "./components/ResultsPage"

function App() {
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <h1 className="text-3xl font-bold text-center mb-2">PDF Analysis for Citation </h1>

        <Routes>
          <Route path="/" element={<FileUpload setResults={setResults} setError={setError} />} />
          <Route path="/results" element={<ResultsPage results={results} />} />
        </Routes>
        
        {error && (
          <div className="max-w-4xl mx-auto mt-2">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </Router>
  )
}
// again checking the limit
export default App

