import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LineChart from '../../Chart/LineChart';
import { formatDividendDataForLineChart } from './DividendChartHandler';
import './DividendChartComponent.css';

const DividendChartComponent = ({
  sectionsData,
  buttonText = "Dividends",
  className = "",
  showButton = true,
  autoShow = false
}) => {
  const [showChart, setShowChart] = useState(autoShow);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDividendsClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!sectionsData?.dividends || !Array.isArray(sectionsData.dividends) || sectionsData.dividends.length === 0) {
        throw new Error('Missing or empty dividend data');
      }

      const data = formatDividendDataForLineChart(sectionsData.dividends);
      setChartData(data);
      setShowChart(true);
    } catch (err) {
      setError(err.message);
      console.error('Dividend Chart Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChart = () => {
    setShowChart(false);
    setError(null);
  };

  const getDividendStats = () => {
    if (!sectionsData?.dividends || !Array.isArray(sectionsData.dividends)) {
      return null;
    }

    const dividends = sectionsData.dividends;
    const totalAmount = dividends.reduce((sum, div) => sum + parseFloat(div.amount || 0), 0);
    const uniqueSymbols = new Set(dividends.map(div => div.symbol)).size;
    const dateRange = dividends.length > 0 ? {
      start: new Date(Math.min(...dividends.map(div => new Date(div.date)))),
      end: new Date(Math.max(...dividends.map(div => new Date(div.date))))
    } : null;

    return {
      totalAmount,
      count: dividends.length,
      uniqueSymbols,
      dateRange
    };
  };

  const stats = getDividendStats();

  return (
    <div className={`dividend-chart-component ${className}`}>
      {showButton && (
        <div className="dividend-chart-controls">
          <button 
            onClick={handleDividendsClick}
            disabled={isLoading || !sectionsData?.dividends?.length}
            className="dividend-chart-button"
          >
            {isLoading ? 'Loading...' : buttonText}
          </button>
          
          {showChart && (
            <button 
              onClick={handleCloseChart}
              className="dividend-chart-close-button"
              aria-label="Close dividend chart"
            >
              ×
            </button>
          )}
        </div>
      )}

      {stats && showChart && showButton && (
        <div className="dividend-stats-preview">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">
              {stats.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Payments:</span>
            <span className="stat-value">{stats.count}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Symbols:</span>
            <span className="stat-value">{stats.uniqueSymbols}</span>
          </div>
          {stats.dateRange && (
            <div className="stat-item">
              <span className="stat-label">Period:</span>
              <span className="stat-value">
                {stats.dateRange.start.toLocaleDateString()} - {stats.dateRange.end.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="dividend-chart-error">
          <p>Error loading dividend chart: {error}</p>
          <button onClick={() => setError(null)} className="error-dismiss-button">
            Dismiss
          </button>
        </div>
      )}

      {showChart && !error && (
        <div className="dividend-chart-container">
          <div className="dividend-chart-header">
            <h3>Dividend Income Over Time</h3>
            <p>Monthly dividend payments aggregated by date</p>
          </div>
          
          <div className="dividend-chart-wrapper">
            <LineChart chartData={chartData} />
          </div>
          
          <div className="dividend-chart-footer">
            <div className="chart-insights">
              {stats && (
                <>
                  <div className="insight-item">
                    <strong>Average per Payment:</strong> 
                    {(stats.totalAmount / stats.count).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </div>
                  <div className="insight-item">
                    <strong>Diversification:</strong> 
                    {stats.uniqueSymbols} different symbols
                  </div>
                </>
              )}
            </div>
            <small>Interactive line chart showing dividend income trends</small>
          </div>
        </div>
      )}
    </div>
  );
};

DividendChartComponent.propTypes = {
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
  buttonText: PropTypes.string,
  className: PropTypes.string,
  showButton: PropTypes.bool,
  autoShow: PropTypes.bool
};

export default DividendChartComponent;