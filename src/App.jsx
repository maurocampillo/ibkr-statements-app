// src/App.js
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Parser from './components/Parser';
import CalendarChartComponent from './components/ChartComponents/CalendarChartComponent';
import RealizedGainsComponent from './components/ChartComponents/RealizedGainsComponent';
import RealizedGainsButtonsGroup from './components/ChartComponents/RealizedGainsComponent/RealizedGainsButtonsGroup';

import DividendChartButton from './components/ChartComponents/DividendChartComponent/DividendChartButton';
import DividendChartComponent from './components/ChartComponents/DividendChartComponent';
import CalendarChartButton from './components/ChartComponents/CalendarChartComponent/CalendarChartButton';
import './App.css';

function App() {
  const [sectionsData, setSectionsData] = useState(null);
  const [trades, setTrades] = useState(null);
  const [totals, setTotals] = useState(null);
  const [dividendChart, setDividendChart] = useState(null);
  const [calendarChart, setCalendarChart] = useState(null);
  const [realizedGainsChart, setRealizedGainsChart] = useState(null);

  const handleDividendChartReady = (chartInfo) => {
    setDividendChart(chartInfo);
  };

  const handleCalendarChartReady = (chartInfo) => {
    setCalendarChart(chartInfo);
  };

  const handleRealizedGainsChartReady = (chartInfo) => {
    setRealizedGainsChart(chartInfo);
  };

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setSectionsData={setSectionsData} setTotals={setTotals} setTrades={setTrades} />

      {/* Extracted Dividend Button */}
      <DividendChartButton 
        sectionsData={sectionsData}
        onChartDataReady={handleDividendChartReady}
      />

      {/* Dividend Chart Display */}
      {dividendChart && dividendChart.type === 'dividends' && (
        <DividendChartComponent sectionsData={sectionsData} />
      )}

      {/* Extracted Calendar Button */}
      <CalendarChartButton 
        dateData={trades}
        sectionsData={sectionsData}
        buttonText="Calendar Chart"
        defaultBoxColor="#f5f5f5"
        boxBorderColor="#cccccc"
        rowCount={3}
        onChartDataReady={handleCalendarChartReady}
      />

      {/* Calendar Chart Display */}
      {calendarChart && calendarChart.type === 'calendar' && (
        <CalendarChartComponent 
          dateData={trades}
          sectionsData={sectionsData}
          defaultBoxColor={calendarChart.config?.defaultBoxColor || "#f5f5f5"}
          boxBorderColor={calendarChart.config?.boxBorderColor || "#cccccc"}
          rowCount={calendarChart.config?.rowCount || 3}
        />
      )}

      {/* Extracted Realized Gains Buttons Group */}
      <RealizedGainsButtonsGroup 
        totals={totals}
        sectionsData={sectionsData}
        onChartDataReady={handleRealizedGainsChartReady}
      />

      {/* Realized Gains Chart Display */}
      {realizedGainsChart && realizedGainsChart.type === 'realized-gains' && (
        <RealizedGainsComponent 
          chartData={realizedGainsChart.data}
          selectedSources={realizedGainsChart.selectedSources || []}
          activeChart={realizedGainsChart.subType}
          title={realizedGainsChart.title}
          description={realizedGainsChart.description}
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