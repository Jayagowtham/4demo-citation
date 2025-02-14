import React from 'react';
import { useLocation } from 'react-router-dom';
import ResultDisplay from './ResultDisplay';

const ResultsPage = () => {
    const { state } = useLocation();
    const { results } = state || {};

    return (
        <div style={{
            height: '100vh',
            overflow: 'hidden'
        }}>
            <ResultDisplay results={results} />
        </div>
    );
};

export default ResultsPage;