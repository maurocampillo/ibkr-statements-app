// src/App.js
import React, { useState } from 'react';
import CSVReader from 'react-csv-reader';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Utility function to convert string to camelCase
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  };

  const handleCSVLoad = (data, fileInfo) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = {};
      let currentSection = null;
      let headers = [];

      data.forEach((row) => {
        const [sectionName, type, ...values] = row;

        // Handle new section
        if (!result[toCamelCase(sectionName)]) {
          result[toCamelCase(sectionName)] = {
            title: sectionName,
          };
          currentSection = toCamelCase(sectionName);
        }

        if (type === 'Header') {
          headers = values;
        } else if (type === 'Data') {
          if (headers.length === 2) {
            // Simple key-value pair case
            const [fieldName, fieldValue] = values;
            const key = toCamelCase(fieldName);
            let value = fieldValue === '' ? undefined : fieldValue;

            // Convert to number if it's a valid number
            if (value !== undefined && !isNaN(Number(value))) {
              value = Number(value);
            }

            result[currentSection][key] = value;
          } else {
            // Table-like structure
            if (!result[currentSection].data) {
              result[currentSection].data = [];
            }

            const rowData = {};
            headers.forEach((header, index) => {
              const key = toCamelCase(header);
              let value = values[index] === '' ? undefined : values[index];

              // Convert to number if it's a valid number
              if (value !== undefined && !isNaN(Number(value))) {
                value = Number(value);
              }

              rowData[key] = value;
            });

            result[currentSection].data.push(rowData);
          }
        }
      });

      setResult(result);
    } catch (err) {
      setError('Error parsing CSV file: ' + err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error) => {
    setError('Error reading file: ' + error);
    setResult(null);
    setIsLoading(false);
  };

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <div className="file-upload">
        <CSVReader
          onFileLoaded={handleCSVLoad}
          onError={handleError}
          parserOptions={{
            skipEmptyLines: true,
            dynamicTyping: false, // We'll handle type conversion ourselves
          }}
          inputId="csvInput"
          inputStyle={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        {isLoading && <span>Processing...</span>}
      </div>

      {error && (
        <div className="error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result">
          <h3>Parsed Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;