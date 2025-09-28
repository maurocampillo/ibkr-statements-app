// src/App.js
import React, { useState, useCallback } from 'react';

import CalendarChartComponent from './components/ChartComponents/CalendarChartComponent';
import CalendarChartButton from './components/ChartComponents/CalendarChartComponent/CalendarChartButton';
import DividendChartComponent from './components/ChartComponents/DividendChartComponent';
import DividendChartButton from './components/ChartComponents/DividendChartComponent/DividendChartButton';
import RealizedGainsComponent from './components/ChartComponents/RealizedGainsComponent';
import RealizedGainsButtonsGroup from './components/ChartComponents/RealizedGainsComponent/RealizedGainsButtonsGroup';
import ParserV2 from './components/ParserV2';
import { useTheme } from './hooks/useTheme';
import { DataStoreProvider, useDataStore } from './store/DataStoreContext.tsx';
import './App.css';

function AppContent() {
  const [dividendData, setDividendData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [realizedGainsChart, setRealizedGainsChart] = useState(null);
  const [activeChart, setActiveChart] = useState(null);

  // Data store access for realized gains
  const { getRealizedGains, getDividends, getTrades, getCashReport, isDataLoaded } = useDataStore();

  // Theme hook for dark mode toggle
  const { setTheme, theme } = useTheme();

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
      setCalendarData(null);
      setRealizedGainsChart(null);
      resetOtherButtons('dividend');

      setActiveChart('dividends');
      setDividendData(chartInfo.data);
    } else {
      // If chartInfo is null, just clear the dividend chart
      setDividendData(null);
      if (activeChart === 'dividends') {
        setActiveChart(null);
      }
    }
  };

  const handleCalendarChartReady = chartInfo => {
    if (chartInfo && chartInfo.show) {
      // Reset other charts and buttons when calendar chart is activated
      setDividendData(null);
      setRealizedGainsChart(null);
      resetOtherButtons('calendar');

      setActiveChart('calendar');
      setCalendarData(chartInfo);
    } else {
      // If chartInfo is null or show is false, clear the calendar chart
      setCalendarData(null);
      if (activeChart === 'calendar') {
        setActiveChart(null);
      }
    }
  };

  const handleCalendarDataReady = useCallback(
    chartData => {
      // This is called from CalendarChartComponent when data is ready
      if (chartData && activeChart === 'calendar') {
        setCalendarData(prev => ({
          ...prev,
          ...chartData
        }));
      }
    },
    [activeChart]
  );

  // Chart type configurations for realized gains
  const getChartConfig = chartType => {
    const configs = {
      overview: {
        label: 'Realized Gains Overview',
        description: 'Total breakdown of interests, dividends, and realized gains',
        icon: '📊'
      },
      bySymbol: {
        label: 'Realized Gains by Symbol',
        description: 'Performance breakdown by individual symbols',
        icon: '🏷️'
      },
      byCategory: {
        label: 'Realized Gains by Category',
        description: 'Performance grouped by category and symbol',
        icon: '📂'
      }
    };
    return configs[chartType];
  };

  // Handle realized gains chart type change from buttons
  const handleRealizedGainsChartTypeChange = async chartType => {
    try {
      // If chartType is null, clear the chart
      if (!chartType) {
        setRealizedGainsChart(null);
        if (activeChart === 'realized-gains') {
          setActiveChart(null);
        }
        return;
      }

      // Check if data is loaded
      if (!isDataLoaded) {
        throw new Error('No data loaded. Please upload a CSV file first.');
      }

      // Reset other charts and buttons when realized gains chart is activated
      setDividendData(null);
      setCalendarData(null);
      resetOtherButtons('realized-gains');

      setActiveChart('realized-gains');

      // Get data from DataStore
      const [realizedGainsData, dividendData, tradesData, cashReportData] = await Promise.all([
        getRealizedGains(),
        getDividends(),
        getTrades(),
        getCashReport()
      ]);

      // Create chart raw data object
      const chartRawData = {
        realizedGains: realizedGainsData,
        dividends: dividendData,
        trades: tradesData,
        cashReport: cashReportData
      };

      // Get chart config
      const config = getChartConfig(chartType);
      if (!config) {
        throw new Error(`Unknown chart type: ${chartType}`);
      }

      // Just store the raw data and config - let the component handle processing
      setRealizedGainsChart({
        type: 'realized-gains',
        subType: chartType,
        title: config.label,
        description: config.description,
        rawData: chartRawData // Component will process this
      });
    } catch (err) {
      console.error('Realized Gains Chart Error:', err);
      // You could add error state handling here if needed
    }
  };

  const handleDarkModeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className='App'>
      <div className='app-header'>
        <h1>Client-Side CSV Parser</h1>
        <button
          onClick={handleDarkModeToggle}
          className='dark-mode-toggle'
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className='theme-icon'>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className='theme-text'>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <ParserV2 />

      {/* Chart Buttons Row */}
      <div className='chart-buttons-container'>
        {/* Extracted Dividend Button */}
        <DividendChartButton ref={dividendButtonRef} onChartDataReady={handleDividendChartReady} />

        {/* Extracted Calendar Button */}
        <CalendarChartButton
          ref={calendarButtonRef}
          buttonText='Calendar Chart'
          defaultBoxColor='#f5f5f5'
          boxBorderColor='#cccccc'
          rowCount={3}
          onChartDataReady={handleCalendarChartReady}
        />

        {/* Extracted Realized Gains Buttons Group */}
        <RealizedGainsButtonsGroup
          ref={realizedGainsButtonRef}
          onChartTypeChange={handleRealizedGainsChartTypeChange}
          isDataLoaded={isDataLoaded}
          isLoading={false}
        />
      </div>
      {/* Dividend Chart Display */}
      {dividendData && activeChart === 'dividends' && (
        <DividendChartComponent dividendData={dividendData} />
      )}
      {/* Calendar Chart Display */}
      {calendarData && activeChart === 'calendar' && (
        <CalendarChartComponent
          calendarData={calendarData}
          defaultBoxColor={calendarData.config?.defaultBoxColor || '#f5f5f5'}
          boxBorderColor={calendarData.config?.boxBorderColor || '#cccccc'}
          rowCount={calendarData.config?.rowCount || 3}
          showStats={true}
          onChartDataReady={handleCalendarDataReady}
        />
      )}

      {/* Realized Gains Chart Display */}
      {realizedGainsChart && activeChart === 'realized-gains' && (
        <RealizedGainsComponent
          rawData={realizedGainsChart.rawData}
          activeChart={realizedGainsChart.subType}
          title={realizedGainsChart.title}
          description={realizedGainsChart.description}
        />
      )}
    </div>
  );
}

// Main App component with DataStore provider
function App() {
  return (
    <DataStoreProvider>
      <AppContent />
    </DataStoreProvider>
  );
}

export default App;
