import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CalendarChart from '../../Chart/CalendarChart';
import { formatCalendarChartData } from './CalendarChartHandler';
import './CalendarChartComponent.css';

const CalendarChartComponent = ({
  dateData,
  sectionsData,
  buttonText = "Calendar Chart",
  defaultBoxColor = "#f5f5f5",
  boxBorderColor = "#cccccc",
  rowCount = 3,
  className = "",
  showButton = true,
  autoShow = false
}) => {
  const [showChart, setShowChart] = useState(autoShow);
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalendarChartClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!dateData || !sectionsData?.dividends) {
        throw new Error('Missing required data: dateData or dividends');
      }

      const data = formatCalendarChartData(dateData, sectionsData.dividends);
      setChartData(data);
      setShowChart(true);
    } catch (err) {
      setError(err.message);
      console.error('Calendar Chart Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChart = () => {
    setShowChart(false);
    setError(null);
  };

  return (
    <div className={`calendar-chart-component ${className}`}>
      {showButton && (
        <div className="calendar-chart-controls">
          <button 
            onClick={handleCalendarChartClick}
            disabled={isLoading || !dateData || !sectionsData?.dividends}
            className="calendar-chart-button"
          >
            {isLoading ? 'Loading...' : buttonText}
          </button>
          
          {showChart && (
            <button 
              onClick={handleCloseChart}
              className="calendar-chart-close-button"
              aria-label="Close calendar chart"
            >
              ×
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="calendar-chart-error">
          <p>Error loading calendar chart: {error}</p>
          <button onClick={() => setError(null)} className="error-dismiss-button">
            Dismiss
          </button>
        </div>
      )}

      {showChart && !error && (
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
      )}
    </div>
  );
};

CalendarChartComponent.propTypes = {
  dateData: PropTypes.array,
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
  buttonText: PropTypes.string,
  defaultBoxColor: PropTypes.string,
  boxBorderColor: PropTypes.string,
  rowCount: PropTypes.oneOf([1, 2, 3, 4, 6, 12]),
  className: PropTypes.string,
  showButton: PropTypes.bool,
  autoShow: PropTypes.bool
};

export default CalendarChartComponent;
