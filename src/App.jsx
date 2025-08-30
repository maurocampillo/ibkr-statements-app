// src/App.js
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Parser from './components/Parser';
import CalendarChartComponent from './components/ChartComponents/CalendarChartComponent';
import RealizedGainsComponent from './components/ChartComponents/RealizedGainsComponent';
import DividendChartComponent from './components/ChartComponents/DividendChartComponent';
import './App.css';

function App() {
  const [sectionsData, setSectionsData] = useState(null);
  const [trades, setTrades] = useState(null);
  const [totals, setTotals] = useState(null);

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setSectionsData={setSectionsData} setTotals={setTotals} setTrades={setTrades} />

      <DividendChartComponent 
        sectionsData={sectionsData}
      />
      
      <RealizedGainsComponent 
        totals={totals}
        sectionsData={sectionsData}
      />
      
      <CalendarChartComponent 
        dateData={trades}
        sectionsData={sectionsData}
        buttonText="Calendar Chart"
        defaultBoxColor="#f5f5f5"
        boxBorderColor="#cccccc"
        rowCount={3}
      />

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