import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FileUpload = ({ setResults, setError }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setErrorState(null);
    } else {
      setFile(null);
      setErrorState("Please select a valid PDF file");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setErrorState("Please select a file");
      return;
    }

    setLoading(true);
    setErrorState(null);

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post("https://4demo-citation.vercel.app/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resultsWithFilename = {
        ...response.data,
        documentName: file.name
      };
      axios.default.withCredentials = true;
      setResults(resultsWithFilename);
      navigate('/results', { state: { results: resultsWithFilename } });
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorState(error.response?.data?.error || "Error uploading file");
      setError(error.response?.data?.error || "Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '512px',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '2px 0px 10px rgba(3,3,3,0.1)',
      padding: '20px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Upload PDF for Citation Analysis</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{
          width: '448px',
          height: '200px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px dashed #ff3b30',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          padding: '20px',
        }}>
          <svg style={{ color: '#ff3b30', fontSize: '23px', marginBottom: '10px' }} viewBox="0 0 384 512">
            <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"></path>
          </svg>
          <p style={{ color: '#939393', fontSize: '14px', fontFamily: 'Roboto', lineHeight: '20px' }}>Drag and drop your file here or</p>
          <label style={{
            cursor: 'pointer',
            width: '112px',
            height: '36px',
            border: 'none',
            borderRadius: '24px',
            backgroundColor: '#ff3b30',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: 'Roboto',
            lineHeight: '36px',
            display: 'inline-block',
            textAlign: 'center',
          }}>
            Browse Files
            <input type="file" onChange={handleFileChange} accept=".pdf" hidden />
          </label>
          {file && <p style={{ marginTop: '10px', color: '#000' }}>Selected: {file.name}</p>}
          {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
        </div>
        <button type="submit" disabled={loading || !file} style={{
          width: '448px',
          height: '36px',
          borderRadius: '24px',
          border: 'none',
          backgroundColor: loading || !file ? '#d3d3d3' : '#ff3b30',
          color: '#ffffff',
          fontSize: '16px',
          fontFamily: 'Roboto',
          marginTop: '20px',
          cursor: loading || !file ? 'not-allowed' : 'pointer',
        }}>
          {loading ? "Analyzing Citations..." : "Start Analysis"}
        </button>
      </form>
      <div style={{
        width: '90%',
        backgroundColor: '#f9f9f9',
        borderRadius: '16px',
        padding: '15px',
        marginTop: '20px',
        boxShadow: '2px 0px 10px rgba(3,3,3,0.1)'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Instructions and Guidelines</h4>
        <ul style={{ fontSize: '12px', color: '#444', textAlign: 'left', paddingLeft: '15px' }}>
          <li>Ensure your file is in PDF format for accurate analysis.</li>
          <li>Maximum file size allowed is 10MB.</li>
          <li>Make sure the document is not password protected.</li>
          <li>For best results, upload documents with clear and visible citations.</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
