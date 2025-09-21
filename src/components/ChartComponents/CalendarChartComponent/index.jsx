import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import CalendarChart from '../../Chart/CalendarChart';

import { formatCalendarChartData } from './CalendarChartHandler';
import './CalendarChartComponent.css';

const CalendarChartComponent = ({
  calendarData,
  defaultBoxColor = '#f5f5f5',
  boxBorderColor = '#cccccc',
  rowCount = 3,
  className = '',
  showStats = true,
  onChartDataReady
}) => {
  const [formattedCalendarData, setFormattedCalendarData] = useState(null);

  // Handle chart data ready callback
  useEffect(() => {
    if (!onChartDataReady || !calendarData?.data) {
      return;
    }

    const formattedData = formatCalendarChartData(
      calendarData.data.dividends,
      calendarData.data.trades
    );
    setFormattedCalendarData(formattedData);
  }, [calendarData]); // Removed onChartDataReady from deps

  const getCalendarStats = () => {
    if (!formattedCalendarData || !Object.values(formattedCalendarData)) {
      return null;
    }

    const months = Object.values(formattedCalendarData);

    // 1. Total amount earned by adding amounts for every month
    const totalEarned = months.reduce((sum, monthData) => {
      return sum + (monthData.value || 0);
    }, 0);

    // 2. Average amount by computing all months in months
    const avgAmountAllMonths = months.length > 0 ? totalEarned / months.length : 0;

    // 3. Average amount by computing elements where hasData is true
    const monthsWithData = months.filter(monthData => monthData.hasData === true);
    const avgAmountActiveMonths =
      monthsWithData.length > 0
        ? monthsWithData.reduce((sum, monthData) => sum + (monthData.value || 0), 0) /
          monthsWithData.length
        : 0;

    // 4. Month with highest amount
    const highestMonth = months.reduce((max, monthData) => {
      return (monthData.value || 0) > (max.value || 0) ? monthData : max;
    }, months[0] || {});

    // 5. Month with lowest amount (only consider months with data)
    const lowestMonth =
      monthsWithData.length > 0
        ? monthsWithData.reduce((min, monthData) => {
            return (monthData.value || 0) < (min.value || 0) ? monthData : min;
          }, monthsWithData[0])
        : null;

    return {
      totalEarned,
      avgAmountAllMonths,
      avgAmountActiveMonths,
      highestMonth,
      lowestMonth,
      totalMonths: formattedCalendarData.length,
      activeMonths: monthsWithData.length
    };
  };

  const stats = getCalendarStats();
  const hasData = !!formattedCalendarData;

  return (
    <div className={`calendar-chart-component ${className}`}>
      <div className='calendar-chart-container'>
        <div className='calendar-chart-header'>
          <h3>Monthly Performance Overview</h3>
          <p>Combined realized gains from trades and dividend income by month</p>
        </div>

        {!hasData ? (
          <div className='no-data-message'>
            <div className='no-data-icon'>📅</div>
            <p>
              {!calendarData?.dividends
                ? 'No trade or dividend data available. Upload a CSV file to view the calendar chart.'
                : !calendarData.trades
                  ? 'No trade data available for calendar chart.'
                  : 'No dividend data available for calendar chart.'}
            </p>
          </div>
        ) : (
          <>
            <CalendarChart
              data={formattedCalendarData}
              defaultBoxColor={defaultBoxColor}
              boxBorderColor={boxBorderColor}
              rowCount={rowCount}
            />

            {stats && showStats && (
              <div className='calendar-stats-preview'>
                <div className='stats-header'>
                  <h4>📊 Calendar Summary</h4>
                </div>
                <div className='stats-grid'>
                  <div className='stat-item'>
                    <span className='stat-label'>Total Earned:</span>
                    <span className='stat-value'>
                      {stats.totalEarned.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-label'>Avg per Month (All):</span>
                    <span className='stat-value'>
                      {stats.avgAmountAllMonths.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-label'>Avg per Active Month:</span>
                    <span className='stat-value'>
                      {stats.avgAmountActiveMonths.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </span>
                  </div>
                  {stats.highestMonth && (
                    <div className='stat-item'>
                      <span className='stat-label'>Best Month:</span>
                      <span className='stat-value'>
                        {(stats.highestMonth.value || 0).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </span>
                    </div>
                  )}
                  {stats.lowestMonth && (
                    <div className='stat-item'>
                      <span className='stat-label'>Lowest Month:</span>
                      <span className='stat-value'>
                        {(stats.lowestMonth.value || 0).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </span>
                    </div>
                  )}
                  <div className='stat-item'>
                    <span className='stat-label'>Active Months:</span>
                    <span className='stat-value'>{stats.activeMonths} of 12</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className='calendar-chart-footer'>
          <small>Values include both realized P&L from trades and dividend payments</small>
        </div>
      </div>
    </div>
  );
};

CalendarChartComponent.propTypes = {
  calendarData: PropTypes.shape({
    dividends: PropTypes.array,
    trades: PropTypes.array
  }),
  defaultBoxColor: PropTypes.string,
  boxBorderColor: PropTypes.string,
  rowCount: PropTypes.oneOf([1, 2, 3, 4, 6, 12]),
  className: PropTypes.string,
  showStats: PropTypes.bool,
  onChartDataReady: PropTypes.func
};

export default CalendarChartComponent;
