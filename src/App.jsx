// src/App.js
import React, { useState } from 'react';
import Parser from './components/Parser';
import DividendLineChart from './components/DividendLineChart';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [showDividendLineChart, setShowDividendLineChart] = useState(false);
  const [chartData, setChartData] = useState([]);

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

  const handleButtonClick = () => {
    const data = formatDividendDataForLienChart(result.dividends)
    setChartData(data);
    setShowDividendLineChart(true);
  };

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setResult={setResult} />

      <button onClick={handleButtonClick}>Dividends</button>

      {showDividendLineChart && (
        <DividendLineChart chartData={chartData}/>
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