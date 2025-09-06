import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle } from 'react';
import '../../shared/ChartButton/ChartButton.css';
import './CalendarChartComponent.css';

const CalendarChartButton = forwardRef(
  (
    {
      dateData,
      sectionsData,
      buttonText = 'Calendar Chart',
      defaultBoxColor = '#f5f5f5',
      boxBorderColor = '#cccccc',
      rowCount = 3,
      className = '',
      onChartDataReady
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showChart, setShowChart] = useState(false);

    // Expose reset function to parent component
    useImperativeHandle(ref, () => ({
      resetButton: () => {
        setShowChart(false);
        setIsLoading(false);
      }
    }));

    const handleCalendarChartClick = () => {
      setIsLoading(true);

      // Toggle behavior: if chart is already showing, hide it
      if (showChart) {
        setShowChart(false);
        if (onChartDataReady) {
          onChartDataReady(null); // Clear the chart
        }
      } else {
        // Show the chart
        setShowChart(true);
        if (onChartDataReady) {
          onChartDataReady({
            show: true,
            config: {
              defaultBoxColor,
              boxBorderColor,
              rowCount
            }
          });
        }
      }

      setIsLoading(false);
    };

    const hasData = dateData && sectionsData?.dividends;

    return (
      <div className={`chart-button-component ${className}`}>
        <div className='chart-button-controls'>
          <button
            onClick={handleCalendarChartClick}
            disabled={isLoading || !hasData}
            className={`chart-button calendar ${showChart ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}
            title={
              hasData
                ? 'Click to view monthly performance calendar'
                : 'Missing required data (trades or dividends)'
            }
          >
            <span className='button-icon'>📅</span>
            <div className='button-content'>
              <span className='button-label'>{isLoading ? 'Loading...' : buttonText}</span>
            </div>
            {showChart && <span className='active-indicator'>✓</span>}
          </button>
        </div>
      </div>
    );
  }
);

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
  onChartDataReady: PropTypes.func
};

CalendarChartButton.defaultProps = {
  buttonText: 'Calendar Chart',
  defaultBoxColor: '#f5f5f5',
  boxBorderColor: '#cccccc',
  rowCount: 3,
  className: '',
  onChartDataReady: () => {}
};

export default CalendarChartButton;
