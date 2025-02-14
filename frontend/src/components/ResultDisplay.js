import React, { useState } from 'react';

const ResultDisplay = ({ results }) => {
  const [expandedSections, setExpandedSections] = useState({
    inTextCitations: true,
    referenceList: true,
    validation: true
  });
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!results) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleZoom = (type) => {
    if (type === 'in' && zoomLevel < 200) {
      setZoomLevel(prev => prev + 10);
    } else if (type === 'out' && zoomLevel > 50) {
      setZoomLevel(prev => prev - 10);
    }
  };

  const highlightCitations = (text) => {
    if (!text) return '';
    
    let highlightedText = text;
    const allCitations = [
      ...results.inTextCitations.directQuotation,
      ...results.inTextCitations.indirectParaphrase,
      ...results.inTextCitations.multipleAuthors
    ];

    const citationMap = new Map();
    allCitations.forEach(citation => {
      const isError = results.errors.some(error => 
        error.toLowerCase().includes(citation.toLowerCase())
      );
      citationMap.set(citation, isError);
    });

    const sortedCitations = Array.from(citationMap.keys()).sort((a, b) => b.length - a.length);

    sortedCitations.forEach(citation => {
      const isError = citationMap.get(citation);
      const style = isError ? 
        'background-color: #fee2e2; color: #dc2626;' : 
        'background-color: #dcfce7; color: #15803d;';
      
      const regex = new RegExp(citation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      highlightedText = highlightedText.replace(regex, 
        `<span style="${style} padding: 2px 4px; border-radius: 2px; margin: 0 2px;">${citation}</span>`
      );
    });

    return highlightedText;
  };

  const CollapsibleCard = ({ title, count, children, icon, sectionKey }) => (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      <div 
        style={{ 
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: '#f8fafc',
          borderBottom: expandedSections[sectionKey] ? '1px solid #e5e7eb' : 'none'
        }}
        onClick={() => toggleSection(sectionKey)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: 0 
          }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            fontSize: '12px',
            fontWeight: '500'
          }}>{count}</span>
          <span style={{ 
            transform: expandedSections[sectionKey] ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>▼</span>
        </div>
      </div>
      {expandedSections[sectionKey] && (
        <div style={{ padding: '16px' }}>
          {children}
        </div>
      )}
    </div>
  );

  const renderCitationList = (citations, type) => {
    if (!citations || citations.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No {type} found</p>
        </div>
      );
    }

    return (
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {citations.map((citation, index) => (
          <li key={index} style={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#1976d2',
              borderRadius: '50%',
              marginTop: '8px',
              flexShrink: 0
            }}></span>
            <span style={{ color: '#4b5563', fontSize: '14px' }}>{citation}</span>
          </li>
        ))}
      </ul>
    );
  };

  const customScrollbarStyle = {
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#94a3b8 #f1f5f9',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f5f9',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#94a3b8',
      borderRadius: '4px',
      '&:hover': {
        background: '#64748b',
      },
    },
  };

  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '400px 1fr',
      gap: '24px',
      height: 'calc(100vh - 48px)', // Adjust for padding
      margin: '24px',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Citation Results */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>Citation Issues</h2>
          <div style={{
            marginTop: '4px',
            maxWidth: '100%'
          }}>
            <p style={{ 
              fontSize: '13px',
              color: '#6b7280',
              margin: '4px 0 0 0',
              wordBreak: 'break-word',
              lineHeight: '1.4'
            }}>
              Document Name: {results.documentName || 'Untitled Document'}
            </p>
            <p style={{ 
              fontSize: '13px',
              color: '#6b7280',
              margin: '2px 0 0 0'
            }}>Citation Style: APA</p>
          </div>
        </div>

        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          ...customScrollbarStyle
        }}>
          {/* In-Text Citations */}
          <CollapsibleCard 
            title="In-Text Citations" 
            count={
              results.inTextCitations.directQuotation.length +
              results.inTextCitations.indirectParaphrase.length +
              results.inTextCitations.multipleAuthors.length
            }
            icon="📝"
            sectionKey="inTextCitations"
          >
            {/* Direct Quotations */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Direct Quotations ({results.inTextCitations.directQuotation.length})</h4>
              {renderCitationList(results.inTextCitations.directQuotation, "direct quotations")}
            </div>

            {/* Indirect Paraphrases */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Indirect Paraphrases ({results.inTextCitations.indirectParaphrase.length})</h4>
              {renderCitationList(results.inTextCitations.indirectParaphrase, "indirect paraphrases")}
            </div>

            {/* Multiple Authors */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Multiple Authors ({results.inTextCitations.multipleAuthors.length})</h4>
              {renderCitationList(results.inTextCitations.multipleAuthors, "multiple authors citations")}
            </div>
          </CollapsibleCard>

          {/* Reference List */}
          <CollapsibleCard 
            title="Reference List" 
            count={
              results.referenceList.books.length +
              results.referenceList.journalArticles.length +
              results.referenceList.onlineSources.length
            }
            icon="📚"
            sectionKey="referenceList"
          >
            {/* Books */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Books ({results.referenceList.books.length})</h4>
              {renderCitationList(results.referenceList.books, "books")}
            </div>

            {/* Journal Articles */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Journal Articles ({results.referenceList.journalArticles.length})</h4>
              {renderCitationList(results.referenceList.journalArticles, "journal articles")}
            </div>

            {/* Online Sources */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Online Sources ({results.referenceList.onlineSources.length})</h4>
              {renderCitationList(results.referenceList.onlineSources, "online sources")}
            </div>
          </CollapsibleCard>

          {/* Validation Results */}
          <CollapsibleCard 
            title="Validation Results" 
            count={results.errors.length}
            icon="✅"
            sectionKey="validation"
          >
            {results.errors.length > 0 ? (
              <ul style={{ 
                margin: 0,
                padding: 0,
                listStyle: 'none'
              }}>
                {results.errors.map((error, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#dc2626' }}>⚠️</span>
                    <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{
                padding: '8px',
                backgroundColor: '#f0fdf4',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✅</span>
                <span style={{ color: '#15803d', fontSize: '14px' }}>All citations are correctly formatted</span>
              </div>
            )}
          </CollapsibleCard>
        </div>
      </div>

      {/* Right Panel - Document Preview */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Document Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            margin: 0
          }}>Document Preview</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handleZoom('in')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Zoom In
            </button>
            <button 
              onClick={() => handleZoom('out')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Zoom Out
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          ...customScrollbarStyle
        }}>
          <div 
            style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              fontSize: `${14 * (zoomLevel/100)}px`,
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}
            dangerouslySetInnerHTML={{
              __html: highlightCitations(results.documentContent)
            }}
          />
        </div>
      </div>
    </div>
  );
};
//hi all new change here after 
export default ResultDisplay;

