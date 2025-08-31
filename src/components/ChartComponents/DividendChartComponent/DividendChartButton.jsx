import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDividendDataForLineChart } from './DividendChartHandler';
import './DividendChartComponent.css';

const DividendChartButton = ({
  sectionsData,
  buttonText = "Dividends",
  className = "",
  onChartDataReady,
  onError,
  showStats = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const handleDividendsClick = async () => {
    try {
      setIsLoading(true);
      
      if (!sectionsData?.dividends || !Array.isArray(sectionsData.dividends) || sectionsData.dividends.length === 0) {
        throw new Error('Missing or empty dividend data');
      }

      const data = formatDividendDataForLineChart(sectionsData.dividends);
      setShowChart(true);
      
      // Pass the chart data to parent component
      if (onChartDataReady) {
        onChartDataReady({
          type: 'dividends',
          data: data,
          title: 'Dividend Analysis',
          description: 'Track dividend payments and performance over time'
        });
      }
    } catch (err) {
      if (onError) {
        onError(err.message);
      }
      console.error('Dividend Chart Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChart = () => {
    setShowChart(false);
    if (onChartDataReady) {
      onChartDataReady(null); // Clear the chart
    }
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
  const hasData = sectionsData?.dividends?.length > 0;

  return (
    <div className={`dividend-chart-button-component ${className}`}>
      <div className="dividend-chart-controls">
        <button 
          onClick={handleDividendsClick}
          disabled={isLoading || !hasData}
          className={`dividend-chart-button ${showChart ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}
          title={hasData ? 'Click to view dividend analysis' : 'No dividend data available'}
        >
          <span className="button-icon">💰</span>
          <div className="button-content">
            <span className="button-label">
              {isLoading ? 'Loading...' : buttonText}
            </span>
            {hasData && (
              <span className="button-description">
                View dividend performance over time
              </span>
            )}
          </div>
          {showChart && (
            <span className="active-indicator">✓</span>
          )}
        </button>
        
        {showChart && (
          <button 
            onClick={handleCloseChart}
            className="dividend-chart-close-button"
            aria-label="Close dividend chart"
            title="Close dividend chart"
          >
            ×
          </button>
        )}
      </div>

      {stats && showChart && showStats && (
        <div className="dividend-stats-preview">
          <div className="stats-header">
            <h4>📊 Dividend Summary</h4>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Amount:</span>
              <span className="stat-value">
                {stats.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Payments:</span>
              <span className="stat-value">{stats.count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unique Symbols:</span>
              <span className="stat-value">{stats.uniqueSymbols}</span>
            </div>
            {stats.dateRange && (
              <div className="stat-item">
                <span className="stat-label">Date Range:</span>
                <span className="stat-value">
                  {stats.dateRange.start.toLocaleDateString()} - {stats.dateRange.end.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasData && (
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <p>No dividend data available. Upload a CSV file with dividend information to view analysis.</p>
        </div>
      )}
    </div>
  );
};

DividendChartButton.propTypes = {
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
  buttonText: PropTypes.string,
  className: PropTypes.string,
  onChartDataReady: PropTypes.func,
  onError: PropTypes.func,
  showStats: PropTypes.bool
};

DividendChartButton.defaultProps = {
  buttonText: "Dividends",
  className: "",
  showStats: true,
  onChartDataReady: () => {},
  onError: () => {}
};

export default DividendChartButton;