import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCalendarChartData } from './CalendarChartHandler';
import './CalendarChartComponent.css';

const CalendarChartButton = ({
  dateData,
  sectionsData,
  buttonText = "Calendar Chart",
  defaultBoxColor = "#f5f5f5",
  boxBorderColor = "#cccccc",
  rowCount = 3,
  className = "",
  onChartDataReady,
  onError,
  showStats = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const handleCalendarChartClick = async () => {
    try {
      setIsLoading(true);
      
      if (!dateData || !sectionsData?.dividends) {
        throw new Error('Missing required data: dateData or dividends');
      }

      const data = formatCalendarChartData(dateData, sectionsData.dividends);
      setShowChart(true);
      
      // Pass the chart data to parent component
      if (onChartDataReady) {
        onChartDataReady({
          type: 'calendar',
          data: data,
          title: 'Monthly Performance Overview',
          description: 'Combined realized gains from trades and dividend income by month',
          config: {
            defaultBoxColor,
            boxBorderColor,
            rowCount
          }
        });
      }
    } catch (err) {
      if (onError) {
        onError(err.message);
      }
      console.error('Calendar Chart Error:', err);
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

  const getCalendarStats = () => {
    if (!dateData || !sectionsData?.dividends) {
      return null;
    }

    const totalTrades = dateData.length;
    const totalDividends = sectionsData.dividends.length;
    
    // Calculate total realized gains from trades
    const totalRealizedGains = dateData.reduce((sum, trade) => {
      const realizedPL = parseFloat(trade.realizedPL || 0);
      return sum + realizedPL;
    }, 0);

    // Calculate total dividend income
    const totalDividendIncome = sectionsData.dividends.reduce((sum, div) => {
      return sum + parseFloat(div.amount || 0);
    }, 0);

    const totalValue = totalRealizedGains + totalDividendIncome;

    // Get date range
    const allDates = [
      ...dateData.map(trade => new Date(trade.dateTime)),
      ...sectionsData.dividends.map(div => new Date(div.date))
    ].filter(date => !isNaN(date));

    const dateRange = allDates.length > 0 ? {
      start: new Date(Math.min(...allDates)),
      end: new Date(Math.max(...allDates))
    } : null;

    return {
      totalTrades,
      totalDividends,
      totalRealizedGains,
      totalDividendIncome,
      totalValue,
      dateRange
    };
  };

  const stats = getCalendarStats();
  const hasData = dateData && sectionsData?.dividends;

  return (
    <div className={`calendar-chart-button-component ${className}`}>
      <div className="calendar-chart-controls">
        <button 
          onClick={handleCalendarChartClick}
          disabled={isLoading || !hasData}
          className={`calendar-chart-button ${showChart ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}
          title={hasData ? 'Click to view monthly performance calendar' : 'Missing required data (trades or dividends)'}
        >
          <span className="button-icon">📅</span>
          <div className="button-content">
            <span className="button-label">
              {isLoading ? 'Loading...' : buttonText}
            </span>
            {hasData && (
              <span className="button-description">
                View monthly performance calendar
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
            className="calendar-chart-close-button"
            aria-label="Close calendar chart"
            title="Close calendar chart"
          >
            ×
          </button>
        )}
      </div>

      {stats && showChart && showStats && (
        <div className="calendar-stats-preview">
          <div className="stats-header">
            <h4>📊 Performance Summary</h4>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">
                {stats.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Realized Gains:</span>
              <span className="stat-value">
                {stats.totalRealizedGains.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Dividend Income:</span>
              <span className="stat-value">
                {stats.totalDividendIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Trades:</span>
              <span className="stat-value">{stats.totalTrades}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Dividend Payments:</span>
              <span className="stat-value">{stats.totalDividends}</span>
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
          <div className="no-data-icon">📅</div>
          <p>
            {!dateData && !sectionsData?.dividends 
              ? 'No trade or dividend data available. Upload a CSV file to view the calendar chart.'
              : !dateData 
                ? 'No trade data available for calendar chart.'
                : 'No dividend data available for calendar chart.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

CalendarChartButton.propTypes = {
  dateData: PropTypes.array,
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
  buttonText: PropTypes.string,
  defaultBoxColor: PropTypes.string,
  boxBorderColor: PropTypes.string,
  rowCount: PropTypes.oneOf([1, 2, 3, 4, 6, 12]),
  className: PropTypes.string,
  onChartDataReady: PropTypes.func,
  onError: PropTypes.func,
  showStats: PropTypes.bool
};

CalendarChartButton.defaultProps = {
  buttonText: "Calendar Chart",
  defaultBoxColor: "#f5f5f5",
  boxBorderColor: "#cccccc",
  rowCount: 3,
  className: "",
  showStats: true,
  onChartDataReady: () => {},
  onError: () => {}
};

export default CalendarChartButton;