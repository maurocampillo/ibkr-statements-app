import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import LineChart from '../../Chart/LineChart';
import { formatDividendDataForLineChart } from './DividendChartHandler';
import './DividendChartComponent.css';

const DividendChartComponent = ({
  sectionsData,
  className = "",
  showStats = true
}) => {
  const chartData = useMemo(() => {
    if (!sectionsData?.dividends || !Array.isArray(sectionsData.dividends) || sectionsData.dividends.length === 0) {
      return null;
    }
    
    try {
      return formatDividendDataForLineChart(sectionsData.dividends);
    } catch (err) {
      console.error('Dividend Chart Error:', err);
      return null;
    }
  }, [sectionsData?.dividends]);

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
    <div className={`dividend-chart-component ${className}`}>      
      <div className="dividend-chart-container">
        <div className="dividend-chart-header">
          <h3>Dividend Income Over Time</h3>
          <p>Monthly dividend payments aggregated by date</p>
        </div>
        
        {!hasData ? (
          <div className="no-data-message">
            <div className="no-data-icon">📊</div>
            <p>No dividend data available. Upload a CSV file with dividend information to view analysis.</p>
          </div>
        ) : (
          <>
            <div className="dividend-chart-wrapper">
              <LineChart chartData={chartData} />
            </div>

            {stats && showStats && (
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
          </>
        )}
        
        <div className="dividend-chart-footer">
          <small>Interactive line chart showing dividend income trends</small>
        </div>
      </div>
    </div>
  );
};

DividendChartComponent.propTypes = {
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
  className: PropTypes.string,
  showStats: PropTypes.bool
};

export default DividendChartComponent;