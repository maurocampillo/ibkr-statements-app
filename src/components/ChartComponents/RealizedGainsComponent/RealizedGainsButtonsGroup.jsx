import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle } from 'react';

import { useDataStore } from '../../../store/DataStoreContext.tsx';

import {
  formatRealizedGainsDataForSankeyChart,
  formatRealizedGainsDataForSankeyChartBySymbol,
  formatRealizedGainsDataForSankeyChartByCategory
} from './RealizedGainsHandler';
import '../../shared/ChartButton/ChartButton.css';
import './RealizedGainsComponent.css';

const RealizedGainsButtonsGroup = forwardRef(
  (
    {
      className = '',
      defaultView = 'overview', // "overview", "bySymbol", "byCategory"
      onChartDataReady,
      onError
    },
    ref
  ) => {
    const [activeChart, setActiveChart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { getRealizedGains, getDividends, getTrades, getCashReport, isDataLoaded } =
      useDataStore();

    // Expose reset function to parent component
    useImperativeHandle(ref, () => ({
      resetButton: () => {
        setActiveChart(null);
        setIsLoading(false);
      }
    }));

    const getChartTypes = async () => {
      // Get data from DataStore for handlers
      const [realizedGainsData, dividendData, tradesData, cashReportData] = await Promise.all([
        getRealizedGains(),
        getDividends(),
        getTrades(),
        getCashReport()
      ]);

      // Create a sectionsData-like object for compatibility with existing handlers
      const chartRawData = {
        realizedGains: realizedGainsData,
        dividends: dividendData,
        trades: tradesData,
        cashReport: cashReportData
      };

      return [
        {
          id: 'overview',
          label: 'Realized Gains Overview',
          description: 'Total breakdown of interests, dividends, and realized gains',
          icon: '📊',
          handler: () => formatRealizedGainsDataForSankeyChart(chartRawData),
          requiredData: chartRawData
        },
        {
          id: 'bySymbol',
          label: 'Realized Gains by Symbol',
          description: 'Performance breakdown by individual symbols',
          icon: '🏷️',
          handler: () => formatRealizedGainsDataForSankeyChartBySymbol(chartRawData),
          requiredData: chartRawData
        },
        {
          id: 'byCategory',
          label: 'Realized Gains by Category',
          description: 'Performance grouped by category and symbol',
          icon: '📂',
          handler: () => formatRealizedGainsDataForSankeyChartByCategory(chartRawData),
          requiredData: chartRawData
        }
      ];
    };

    const handleChartClick = async chartType => {
      try {
        setIsLoading(true);

        // Toggle behavior: if the same chart is already active, hide it
        if (activeChart === chartType) {
          setActiveChart(null);
          if (onChartDataReady) {
            onChartDataReady(null); // Clear the chart
          }
          return;
        }

        // Check if data is loaded
        if (!isDataLoaded) {
          throw new Error('No data loaded. Please upload a CSV file first.');
        }

        // Get chart types with data
        const chartTypes = await getChartTypes();

        const chart = chartTypes.find(c => c.id === chartType);
        if (!chart) {
          throw new Error(`Unknown chart type: ${chartType}`);
        }

        if (!chart.requiredData) {
          throw new Error(`Missing required data for ${chart.label}`);
        }

        const data = chart.handler();
        setActiveChart(chartType);

        // Pass the chart data to parent component
        if (onChartDataReady) {
          onChartDataReady({
            type: 'realized-gains',
            subType: chartType,
            data: data,
            title: chart.label,
            description: chart.description,
            selectedSources: [] // Empty initially, will be managed by RealizedGainsComponent
          });
        }
      } catch (err) {
        if (onError) {
          onError(err.message);
        }
        console.error('Realized Gains Chart Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        {['overview', 'bySymbol', 'byCategory'].map(chartId => {
          const chartLabels = {
            overview: 'Realized Gains Overview',
            bySymbol: 'Realized Gains by Symbol',
            byCategory: 'Realized Gains by Category'
          };
          const chartIcons = {
            overview: '📊',
            bySymbol: '🏷️',
            byCategory: '📂'
          };
          return (
            <div key={chartId} className={`chart-button-component ${className}`}>
              <div className='chart-button-controls'>
                <button
                  onClick={() => handleChartClick(chartId)}
                  disabled={isLoading || !isDataLoaded}
                  className={`chart-button realized-gains ${activeChart === chartId ? 'active' : ''} ${!isDataLoaded ? 'disabled' : ''}`}
                  title={
                    isDataLoaded
                      ? `Visualize ${chartLabels[chartId]}`
                      : `Missing required data for ${chartLabels[chartId]}`
                  }
                >
                  <span className='button-icon'>{chartIcons[chartId]}</span>
                  <div className='button-content'>
                    <span className='button-label'>
                      {isLoading && activeChart === chartId ? 'Loading...' : chartLabels[chartId]}
                    </span>
                  </div>
                  {activeChart === chartId && <span className='active-indicator'>✓</span>}
                </button>
              </div>
            </div>
          );
        })}
      </>
    );
  }
);

RealizedGainsButtonsGroup.propTypes = {
  className: PropTypes.string,
  defaultView: PropTypes.oneOf(['overview', 'bySymbol', 'byCategory']),
  onChartDataReady: PropTypes.func,
  onError: PropTypes.func
};

RealizedGainsButtonsGroup.defaultProps = {
  className: '',
  defaultView: 'overview',
  onChartDataReady: () => {},
  onError: () => {}
};

export default RealizedGainsButtonsGroup;
