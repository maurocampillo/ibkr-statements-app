// src/App.js
import React, { useState } from 'react';
import {JSONTree} from 'react-json-tree';
import Parser from './components/Parser';
import DividendLineChart from './components/DividendLineChart';
import SankeyRealizedGainsChart from './components/SankeyRealizedGainsChart';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [totals, setTotals] = useState(null);
  const [showChart, setShowChart] = useState(undefined)
  const [chartData, setChartData] = useState([]);

  // Format data for Nivo Line chart
  const formatDividendDataForLineChart = (data) => {
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

  // Format data for Nivo Line chart
  const formatRealizedGainsDataForSankeyChart = (data) => {
    debugger
    return {
      "nodes": [
        {
          "id": "interests",
          "nodeColor": "hsl(56, 70%, 50%)"
        },
        {
          "id": "dividends",
          "nodeColor": "hsl(124, 70%, 50%)"
        },
        {
          "id": "realizedGainsFromTrades",
          "nodeColor": "hsl(356, 70%, 50%)"
        },
        {
          "id": "total",
          "nodeColor": "hsl(255, 70%, 50%)"
        },
      ],
      "links": [
        {
          "source": "interests",
          "target": "total",
          "value":  parseFloat(data.interest),
        },
        {
          "source": "dividends",
          "target": "total",
          "value": parseFloat(data.dividends),
        },
        {
          "source": "realizedGainsFromTrades",
          "target": "total",
          "value":  parseFloat(data.realizedUnrealizedPerformanceSummary.total.realizedTotal),
        },
      ]
    }
  };

  const handleDividendsClick = () => {
    const data = formatDividendDataForLineChart(result.dividends)
    setChartData(data);
    setShowChart("dividendsLineChart");
  };

  const handleRealizedGainsClick = () => {
    const data = formatRealizedGainsDataForSankeyChart(totals)
    setChartData(data);
    setShowChart("realizedGainsSankeyCart");
  };

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setResult={setResult} setTotals={setTotals} />

      <button onClick={handleDividendsClick}>Dividends</button>
      <button onClick={handleRealizedGainsClick}>Realized Gains</button>

      {showChart === "dividendsLineChart" && (
        <DividendLineChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCart" && (
        <SankeyRealizedGainsChart chartData={chartData}/>
      )}

      {result && (
        <div className="result">
          <h3>Parsed Result:</h3>
          <JSONTree
            data={totals}
            theme={"monokai"}
            invertTheme={true}
            shouldExpandNodeInitially={() => true} // Start with all nodes collapsed
          />
          <JSONTree
            data={result}
            theme={"monokai"}
            invertTheme={true}
            shouldExpandNodeInitially={() => true} // Start with all nodes collapsed
          />
        </div>
      )}
    </div>
  );
}

export default App;