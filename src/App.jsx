// src/App.js
import React, { useState } from 'react';
import CSVReader from 'react-csv-reader';
import { ResponsiveLine } from '@nivo/line';
import DividendLineChart from './components/DividendLineChart';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDividendLineChart, setShowDividendLineChart] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Utility function to convert string to camelCase
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  };

  // Format data for Nivo Line chart
  const formatDividendDataForLienChart = (data) => {
    let groupedData = Object.groupBy(data, (d) => d.date)
    const lineData = {
      id: 'Dividends',
      data: Object.keys(groupedData).map(keyDate => ({
        x: keyDate, // Date for x-axis
        y: groupedData[keyDate].map((e) => parseFloat(e.amount)).reduce((a,b) => a + b, 0)
      })).sort((a, b) => new Date(a.x) - new Date(b.x))
    };
    return [lineData];
  };

  const headersAndValues = (headers, values) => {
    let result = {}    
    headers.forEach((e, i) => result[toCamelCase(e)] = values[i])    
    return result
  }  

  const skipRow = (section, obj) => {
    if (["Dividends","Withholding Tax","Fees", "Deposits & Withdrawals", "Forex P/L Details", "Change in Dividend Accruals"].includes(section)) {
      return !obj?.date
    } else if (section == "Realized & Unrealized Performance Summary") {
      return !obj?.assetCategory
    } else {
      return false
    }    
  }

  const handleCSVLoad = (data, fileInfo) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = {};
      let currentSection = null;      
      let sectionsData = Object.groupBy(data, (element) => { return element[0] } )
      let sectionNames = Object.keys(sectionsData)

      sectionNames.forEach(sectionName => {        
        const [headers, ...values] = sectionsData[sectionName]
        const headerSectionNames = headers.slice(2, headers.length)
        const relevantValues = values.filter((e) => e[1] == "Data" )
        let sectionParsedData = []

        relevantValues.forEach((rv) => {
          let r = rv.slice(2, rv.length)          
          let obj = headersAndValues(headerSectionNames, r)
          
          if (!skipRow(sectionName, obj)){
            sectionParsedData.push(obj)
          }
        })        

        result[toCamelCase(sectionName)] = sectionParsedData
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

  const handleButtonClick = () => {
    const data = formatDividendDataForLienChart(result.dividends)
    console.log(data)
    setChartData(data);
    setShowDividendLineChart(true);
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
            dynamicTyping: false,
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

      <button onClick={handleButtonClick}>Dividends</button>

      {showDividendLineChart && (
        <DividendLineChart chartData={chartData}/>
      )}

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