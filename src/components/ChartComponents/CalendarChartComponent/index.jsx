import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import CalendarChart from '../../Chart/CalendarChart';
import { formatCalendarChartData } from './CalendarChartHandler';
import './CalendarChartComponent.css';

const CalendarChartComponent = ({
  dateData,
  sectionsData,
  defaultBoxColor = "#f5f5f5",
  boxBorderColor = "#cccccc",
  rowCount = 3,
  className = "",
  showStats = true
}) => {
  const chartData = useMemo(() => {
    if (!dateData || !sectionsData?.dividends) {
      return null;
    }
    
    try {
      return formatCalendarChartData(dateData, sectionsData.dividends);
    } catch (err) {
      console.error('Calendar Chart Error:', err);
      return null;
    }
  }, [dateData, sectionsData?.dividends]);

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
    <div className={`calendar-chart-component ${className}`}>
      <div className="calendar-chart-container">
        <div className="calendar-chart-header">
          <h3>Monthly Performance Overview</h3>
          <p>Combined realized gains from trades and dividend income by month</p>
        </div>
        
        {!hasData ? (
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
        ) : (
          <>
            <CalendarChart 
              data={chartData}
              defaultBoxColor={defaultBoxColor}
              boxBorderColor={boxBorderColor}
              rowCount={rowCount}
            />

            {stats && showStats && (
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
          </>
        )}
        
        <div className="calendar-chart-footer">
          <small>Values include both realized P&L from trades and dividend payments</small>
        </div>
      </div>
    </div>
  );
};

CalendarChartComponent.propTypes = {
  dateData: PropTypes.array,
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
  defaultBoxColor: PropTypes.string,
  boxBorderColor: PropTypes.string,
  rowCount: PropTypes.oneOf([1, 2, 3, 4, 6, 12]),
  className: PropTypes.string,
  showStats: PropTypes.bool
};

export default CalendarChartComponent;
