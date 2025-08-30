// src/App.js
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Parser from './components/Parser';
import utils from './utils/parsing';
import DividendLineChart from './components/Chart/DividendLineChart';
import SankeyChart from './components/Chart/SankeyChart';
import CalendarChart from './components/Chart/CalendarChart';
import { handleDividendsClick } from './components/ChartHandler/DividendChartHandler.jsx';
import { 
  handleRealizedGainsClick, 
  handleRealizedGainsBySymbolClick, 
  handleRealizedGainsByCategoryClick 
} from './components/ChartHandler/RealizedGainsHandler.jsx';
import './App.css';
import _ from 'lodash';

function App() {
  const [sectionsData, setSectionsData] = useState(null);
  const [trades, setTrades] = useState(null);
  const [totals, setTotals] = useState(null);
  const [showChart, setShowChart] = useState(undefined)
  const [chartData, setChartData] = useState([]);

  const formatCalendarChartData = (trades, dividends) => {
    if (!trades || !trades.length) {
      return {};
    }

    // Initialize result object with all months
    const result = {
      "1": { value: 0 },
      "2": { value: 0 },
      "3": { value: 0 },
      "4": { value: 0 },
      "5": { value: 0 },
      "6": { value: 0 },
      "7": { value: 0 },
      "8": { value: 0 },
      "9": { value: 0 },
      "10": { value: 0 },
      "11": { value: 0 },
      "12": { value: 0  }
    };

    // Process each trade
    trades.forEach(trade => {
      if (trade.datetime && trade.realizedPl) {
        // Extract month from dateTime (format: "2025-01-03, 11:08:24")
        const month = parseInt(trade.datetime.split('-')[1]);
        if (month >= 1 && month <= 12) {
          result[month].value += trade.realizedPl;
        }
      }
    });

    dividends.forEach(dividend => {
      const month = parseInt(dividend.date.split('-')[1]);
      if (month >= 1 && month <= 12) {
        result[month].value += parseFloat(dividend.amount);
      }
    });
    
    // Round values to 2 decimal places
    Object.keys(result).forEach(month => {      
      result[month].value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
        .format(Math.round(result[month].value * 100) / 100);
    });

    return result;
  }

  const handleCalendarChartClick = () => {
    const data = formatCalendarChartData(trades, sectionsData.dividends)
    setChartData(data);
    setShowChart("calendarChart");
  }

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setSectionsData={setSectionsData} setTotals={setTotals} setTrades={setTrades} />

      <button onClick={() => handleDividendsClick(sectionsData, setChartData, setShowChart)}>Dividends</button>
      <button onClick={() => handleRealizedGainsClick(totals, setChartData, setShowChart)}>Realized Gains</button>
      <button onClick={() => handleRealizedGainsBySymbolClick(sectionsData, setChartData, setShowChart)}>Realized Gains by Symbol</button>
      <button onClick={() => handleRealizedGainsByCategoryClick(sectionsData, setChartData, setShowChart)}>Realized Gains by Category / Symbol</button>
      <button onClick={handleCalendarChartClick}>Calendar Chart</button>

      {showChart === "dividendsLineChart" && (
        <DividendLineChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCart" && (
        <SankeyChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCartBySymbol" && (
        <SankeyChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCartByCategory" && (
        <SankeyChart chartData={chartData}/>
      )}

      {showChart === "calendarChart" && (
        <CalendarChart 
          data={chartData}
          defaultBoxColor="#f5f5f5"
          boxBorderColor="#cccccc"
          rowCount={3}
        />
      )}

      {sectionsData && (
        <div className="result">
          <h3>Parsed Sections Data:</h3>          
          <ReactJson src={trades}/>
        </div>
      )}
    </div>
  );
}

export default App;