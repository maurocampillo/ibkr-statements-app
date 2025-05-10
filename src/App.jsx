// src/App.js
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Parser from './components/Parser';
import utils from './utils/parsing';
import DividendLineChart from './components/DividendLineChart';
import SankeyRealizedGainsChart from './components/SankeyRealizedGainsChart';
import './App.css';
import _ from 'lodash';

function App() {
  const [result, setResult] = useState(null);
  const [totals, setTotals] = useState(null);
  const [showChart, setShowChart] = useState(undefined)
  const [chartData, setChartData] = useState([]);

  // Format data for Nivo Line chart, TODO: Move to utils
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
  }

  const formatDividendDataForLineChart = (data) => {
    let groupedData = Object.groupBy(data, (d) => formatDate(d.date))
    const lineData = {
      id: 'Dividends',
      data: Object.keys(groupedData).map(keyDate => ({
        x: keyDate, // Date for x-axis
        y: groupedData[keyDate].map((e) => parseFloat(e.amount)).reduce((a,b) => a + b, 0),
        id: formatDate(keyDate), // Date for x-axis
      })).sort((a, b) => new Date(a.x) - new Date(b.x))
    };
    console.log("lineData", lineData)
    return [lineData];
  };

  // Format data for Nivo Line chart
  const formatRealizedGainsDataForSankeyChart = (data) => {
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

  const formatRealizedGainsDataForSankeyChartBySymbol = () => {
    const data = utils.computeRealizedGainsForSankey(result)
    const arrayForSankey = _.sortBy(Object.values(data), ["symbol"])
    const nodes = arrayForSankey.map((d) => {
      return { "id": d.symbol }
    })
    const links = arrayForSankey.map((d) => {
      return {"source": d.symbol, "value": d.total, "target": "total" }
    })
    return {
      "nodes": nodes.concat({ "id": "total" }),
      "links": links,
    }
  }

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

  const handleRealizedGainsBySymbolClick = () => {
    const data = formatRealizedGainsDataForSankeyChartBySymbol(totals)
    setChartData(data);
    setShowChart("realizedGainsSankeyCartBySymbol");
  }

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setResult={setResult} setTotals={setTotals} />

      <button onClick={handleDividendsClick}>Dividends</button>
      <button onClick={handleRealizedGainsClick}>Realized Gains</button>
      <button onClick={handleRealizedGainsBySymbolClick}>Realized Gains by Symbol</button>

      {showChart === "dividendsLineChart" && (
        <DividendLineChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCart" && (
        <SankeyRealizedGainsChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCartBySymbol" && (
        <SankeyRealizedGainsChart chartData={chartData}/>
      )}

      {result && (
        <div className="result">
          <h3>Parsed Result:</h3>
          <ReactJson src={totals}/>
          <ReactJson src={result}/>
        </div>
      )}
    </div>
  );
}

export default App;