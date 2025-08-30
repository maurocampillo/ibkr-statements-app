import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SankeyChart from '../../Chart/SankeyChart';
import { 
  formatRealizedGainsDataForSankeyChart,
  formatRealizedGainsDataForSankeyChartBySymbol,
  formatRealizedGainsDataForSankeyChartByCategory
} from './RealizedGainsHandler';
import './RealizedGainsComponent.css';

const RealizedGainsComponent = ({
  totals,
  sectionsData,
  className = "",
  showButtons = true,
  autoShow = false,
  defaultView = "overview" // "overview", "bySymbol", "byCategory"
}) => {
  const [activeChart, setActiveChart] = useState(autoShow ? defaultView : null);
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const chartTypes = [
    {
      id: "overview",
      label: "Realized Gains Overview",
      description: "Total breakdown of interests, dividends, and realized gains",
      handler: () => formatRealizedGainsDataForSankeyChart(totals),
      requiredData: totals
    },
    {
      id: "bySymbol", 
      label: "Realized Gains by Symbol",
      description: "Performance breakdown by individual symbols",
      handler: () => formatRealizedGainsDataForSankeyChartBySymbol(sectionsData),
      requiredData: sectionsData
    },
    {
      id: "byCategory",
      label: "Realized Gains by Category",
      description: "Performance grouped by category and symbol",
      handler: () => formatRealizedGainsDataForSankeyChartByCategory(sectionsData),
      requiredData: sectionsData
    }
  ];

  const handleChartClick = async (chartType) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
    } catch (err) {
      setError(err.message);
      console.error('Realized Gains Chart Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChart = () => {
    setActiveChart(null);
    setError(null);
  };

  const getActiveChartInfo = () => {
    return chartTypes.find(c => c.id === activeChart);
  };

  return (
    <div className={`realized-gains-component ${className}`}>
      {showButtons && (
        <div className="realized-gains-controls">
          <div className="realized-gains-buttons">
            {chartTypes.map((chart) => (
              <button
                key={chart.id}
                onClick={() => handleChartClick(chart.id)}
                disabled={isLoading || !chart.requiredData}
                className={`realized-gains-button ${activeChart === chart.id ? 'active' : ''}`}
                title={chart.description}
              >
                {isLoading && activeChart === chart.id ? 'Loading...' : chart.label}
              </button>
            ))}
          </div>
          
          {activeChart && (
            <button 
              onClick={handleCloseChart}
              className="realized-gains-close-button"
              aria-label="Close realized gains chart"
            >
              ×
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="realized-gains-error">
          <p>Error loading realized gains chart: {error}</p>
          <button onClick={() => setError(null)} className="error-dismiss-button">
            Dismiss
          </button>
        </div>
      )}

      {activeChart && !error && (
        <div className="realized-gains-container">
          <div className="realized-gains-header">
            <h3>{getActiveChartInfo()?.label}</h3>
            <p>{getActiveChartInfo()?.description}</p>
          </div>
          
          <div className="realized-gains-chart-wrapper">
            <SankeyChart chartData={chartData} />
          </div>
          
          <div className="realized-gains-footer">
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color interests"></span>
                <span>Interests</span>
              </div>
              <div className="legend-item">
                <span className="legend-color dividends"></span>
                <span>Dividends</span>
              </div>
              <div className="legend-item">
                <span className="legend-color realized-gains"></span>
                <span>Realized Gains</span>
              </div>
              <div className="legend-item">
                <span className="legend-color total"></span>
                <span>Total</span>
              </div>
            </div>
            <small>Interactive Sankey diagram showing financial performance flows</small>
          </div>
        </div>
      )}
    </div>
  );
};

RealizedGainsComponent.propTypes = {
  totals: PropTypes.object,
  sectionsData: PropTypes.object,
  className: PropTypes.string,
  showButtons: PropTypes.bool,
  autoShow: PropTypes.bool,
  defaultView: PropTypes.oneOf(["overview", "bySymbol", "byCategory"])
};

export default RealizedGainsComponent;