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
import { handleCalendarChartClick } from './components/ChartHandler/CalendarChartHandler.jsx';
import './App.css';
import _ from 'lodash';

function App() {
  const [sectionsData, setSectionsData] = useState(null);
  const [trades, setTrades] = useState(null);
  const [totals, setTotals] = useState(null);
  const [showChart, setShowChart] = useState(undefined)
  const [chartData, setChartData] = useState([]);

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setSectionsData={setSectionsData} setTotals={setTotals} setTrades={setTrades} />

      <button onClick={() => handleDividendsClick(sectionsData, setChartData, setShowChart)}>Dividends</button>
      <button onClick={() => handleRealizedGainsClick(totals, setChartData, setShowChart)}>Realized Gains</button>
      <button onClick={() => handleRealizedGainsBySymbolClick(sectionsData, setChartData, setShowChart)}>Realized Gains by Symbol</button>
      <button onClick={() => handleRealizedGainsByCategoryClick(sectionsData, setChartData, setShowChart)}>Realized Gains by Category / Symbol</button>
      <button onClick={() => handleCalendarChartClick(trades, sectionsData, setChartData, setShowChart)}>Calendar Chart</button>

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