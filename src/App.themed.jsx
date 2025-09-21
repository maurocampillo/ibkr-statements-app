// Example of how to integrate the theme system into your App.jsx
import React, { useState } from 'react';
import ReactJson from 'react-json-view';

import CalendarChartComponent from './components/ChartComponents/CalendarChartComponent';
import CalendarChartButton from './components/ChartComponents/CalendarChartComponent/CalendarChartButton';
import DividendChartComponent from './components/ChartComponents/DividendChartComponent';
import DividendChartButton from './components/ChartComponents/DividendChartComponent/DividendChartButton';
import RealizedGainsComponent from './components/ChartComponents/RealizedGainsComponent';
import RealizedGainsButtonsGroup from './components/ChartComponents/RealizedGainsComponent/RealizedGainsButtonsGroup';
import Parser from './components/Parser';
import ThemeSelector from './components/shared/ThemeSelector/ThemeSelector';

// Import theme styles
import './styles/themes.css';
import './App.themed.css'; // Updated App.css with theme variables

function App() {
  const [sectionsData, setSectionsData] = useState(null);
  const [trades, setTrades] = useState(null);
  const [totals, setTotals] = useState(null);
  const [dividendChart, setDividendChart] = useState(null);
  const [calendarChart, setCalendarChart] = useState(null);
  const [realizedGainsChart, setRealizedGainsChart] = useState(null);
  const [activeChart, setActiveChart] = useState(null);

  // Refs to store reset functions for each button component
  const dividendButtonRef = React.useRef(null);
  const calendarButtonRef = React.useRef(null);
  const realizedGainsButtonRef = React.useRef(null);

  const resetOtherButtons = excludeButton => {
    // Reset other button states by calling their reset functions
    if (excludeButton !== 'dividend' && dividendButtonRef.current?.resetButton) {
      dividendButtonRef.current.resetButton();
    }
    if (excludeButton !== 'calendar' && calendarButtonRef.current?.resetButton) {
      calendarButtonRef.current.resetButton();
    }
    if (excludeButton !== 'realized-gains' && realizedGainsButtonRef.current?.resetButton) {
      realizedGainsButtonRef.current.resetButton();
    }
  };

  const handleDividendChartReady = chartInfo => {
    if (chartInfo) {
      // Reset other charts and buttons when dividend chart is activated
      setCalendarChart(null);
      setRealizedGainsChart(null);
      resetOtherButtons('dividend');

      setActiveChart('dividends');
      setDividendChart(chartInfo);
    } else {
      // If chartInfo is null, just clear the dividend chart
      setDividendChart(null);
      if (activeChart === 'dividends') {
        setActiveChart(null);
      }
    }
  };

  const handleCalendarChartReady = chartInfo => {
    if (chartInfo) {
      // Reset other charts and buttons when calendar chart is activated
      setDividendChart(null);
      setRealizedGainsChart(null);
      resetOtherButtons('calendar');

      setActiveChart('calendar');
      setCalendarChart(chartInfo);
    } else {
      // If chartInfo is null, just clear the calendar chart
      setCalendarChart(null);
      if (activeChart === 'calendar') {
        setActiveChart(null);
      }
    }
  };

  const handleRealizedGainsChartReady = chartInfo => {
    if (chartInfo) {
      // Reset other charts and buttons when realized gains chart is activated
      setDividendChart(null);
      setCalendarChart(null);
      resetOtherButtons('realized-gains');

      setActiveChart('realized-gains');
      setRealizedGainsChart(chartInfo);
    } else {
      // If chartInfo is null, just clear the realized gains chart
      setRealizedGainsChart(null);
      if (activeChart === 'realized-gains') {
        setActiveChart(null);
      }
    }
  };

  return (
    <div className='App'>
      {/* App Header with Theme Selector */}
      <header className='app-header'>
        <h1>Client-Side CSV Parser</h1>
        <ThemeSelector variant='toggle' showLabels={true} />
      </header>

      <Parser setSectionsData={setSectionsData} setTotals={setTotals} setTrades={setTrades} />

      {/* Chart Buttons Row */}
      <div className='chart-buttons-container'>
        {/* Extracted Dividend Button */}
        <DividendChartButton
          ref={dividendButtonRef}
          sectionsData={sectionsData}
          onChartDataReady={handleDividendChartReady}
        />

        {/* Extracted Calendar Button */}
        <CalendarChartButton
          ref={calendarButtonRef}
          dateData={trades}
          sectionsData={sectionsData}
          buttonText='Calendar Chart'
          defaultBoxColor='#f5f5f5'
          boxBorderColor='#cccccc'
          rowCount={3}
          onChartDataReady={handleCalendarChartReady}
        />

        {/* Extracted Realized Gains Buttons Group */}
        <RealizedGainsButtonsGroup
          ref={realizedGainsButtonRef}
          totals={totals}
          sectionsData={sectionsData}
          onChartDataReady={handleRealizedGainsChartReady}
        />
      </div>

      {/* Dividend Chart Display */}
      {dividendChart && activeChart === 'dividends' && (
        <DividendChartComponent sectionsData={sectionsData} />
      )}

      {/* Calendar Chart Display */}
      {calendarChart && activeChart === 'calendar' && (
        <CalendarChartComponent
          dateData={trades}
          sectionsData={sectionsData}
          defaultBoxColor={calendarChart.config?.defaultBoxColor || '#f5f5f5'}
          boxBorderColor={calendarChart.config?.boxBorderColor || '#cccccc'}
          rowCount={calendarChart.config?.rowCount || 3}
        />
      )}

      {/* Realized Gains Chart Display */}
      {realizedGainsChart && activeChart === 'realized-gains' && (
        <RealizedGainsComponent
          chartData={realizedGainsChart.data}
          selectedSources={realizedGainsChart.selectedSources || []}
          activeChart={realizedGainsChart.subType}
          title={realizedGainsChart.title}
          description={realizedGainsChart.description}
        />
      )}

      {sectionsData && (
        <div className='result'>
          <h3>Parsed Sections Data:</h3>
          <ReactJson
            src={trades}
            theme='rjv-default' // You can make this dynamic based on current theme
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            collapsed={2}
          />
        </div>
      )}
    </div>
  );
}

export default App;
