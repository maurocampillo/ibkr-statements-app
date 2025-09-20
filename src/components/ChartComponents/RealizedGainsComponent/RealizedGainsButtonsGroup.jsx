import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle } from 'react';

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
      totals,
      sectionsData,
      className = '',
      defaultView = 'overview', // "overview", "bySymbol", "byCategory"
      onChartDataReady,
      onError
    },
    ref
  ) => {
    const [activeChart, setActiveChart] = useState(null);
    const [chartData, setChartData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Expose reset function to parent component
    useImperativeHandle(ref, () => ({
      resetButton: () => {
        setActiveChart(null);
        setChartData({});
        setIsLoading(false);
      }
    }));

    const chartTypes = [
      {
        id: 'overview',
        label: 'Realized Gains Overview',
        description: 'Total breakdown of interests, dividends, and realized gains',
        icon: '📊',
        handler: () => formatRealizedGainsDataForSankeyChart(sectionsData),
        requiredData: sectionsData
      },
      {
        id: 'bySymbol',
        label: 'Realized Gains by Symbol',
        description: 'Performance breakdown by individual symbols',
        icon: '🏷️',
        handler: () => formatRealizedGainsDataForSankeyChartBySymbol(sectionsData),
        requiredData: sectionsData
      },
      {
        id: 'byCategory',
        label: 'Realized Gains by Category',
        description: 'Performance grouped by category and symbol',
        icon: '📂',
        handler: () => formatRealizedGainsDataForSankeyChartByCategory(sectionsData),
        requiredData: sectionsData
      }
    ];

    const handleChartClick = async chartType => {
      try {
        setIsLoading(true);

        // Toggle behavior: if the same chart is already active, hide it
        if (activeChart === chartType) {
          setActiveChart(null);
          setChartData({});
          if (onChartDataReady) {
            onChartDataReady(null); // Clear the chart
          }
          return;
        }

        const chart = chartTypes.find(c => c.id === chartType);
        if (!chart) {
          throw new Error(`Unknown chart type: ${chartType}`);
        }

        if (!chart.requiredData) {
          throw new Error(`Missing required data for ${chart.label}`);
        }

        const data = chart.handler();
        setChartData(data);
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
        {chartTypes.map(chart => (
          <div key={chart.id} className={`chart-button-component ${className}`}>
            <div className='chart-button-controls'>
              <button
                onClick={() => handleChartClick(chart.id)}
                disabled={isLoading || !chart.requiredData}
                className={`chart-button realized-gains ${activeChart === chart.id ? 'active' : ''} ${!chart.requiredData ? 'disabled' : ''}`}
                title={
                  chart.requiredData
                    ? chart.description
                    : `Missing required data for ${chart.label}`
                }
              >
                <span className='button-icon'>{chart.icon}</span>
                <div className='button-content'>
                  <span className='button-label'>
                    {isLoading && activeChart === chart.id ? 'Loading...' : chart.label}
                  </span>
                </div>
                {activeChart === chart.id && <span className='active-indicator'>✓</span>}
              </button>
            </div>
          </div>
        ))}
      </>
    );
  }
);

RealizedGainsButtonsGroup.propTypes = {
  totals: PropTypes.object,
  sectionsData: PropTypes.object,
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
