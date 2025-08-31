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
  className = ""
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

  if (!chartData) {
    return null;
  }

  return (
    <div className={`calendar-chart-component ${className}`}>
      <div className="calendar-chart-container">
        <div className="calendar-chart-header">
          <h3>Monthly Performance Overview</h3>
          <p>Combined realized gains from trades and dividend income by month</p>
        </div>
        
        <CalendarChart 
          data={chartData}
          defaultBoxColor={defaultBoxColor}
          boxBorderColor={boxBorderColor}
          rowCount={rowCount}
        />
        
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
  className: PropTypes.string
};

export default CalendarChartComponent;
