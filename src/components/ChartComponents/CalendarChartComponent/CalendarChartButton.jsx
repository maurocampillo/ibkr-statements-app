import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle } from 'react';

import { useDataStore } from '../../../store/DataStoreContext.tsx';
import '../../shared/ChartButton/ChartButton.css';
import './CalendarChartComponent.css';

const CalendarChartButton = forwardRef(
  (
    {
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
    const { getDividends, getTrades, isDataLoaded } = useDataStore();

    // Expose reset function to parent component
    useImperativeHandle(ref, () => ({
      resetButton: () => {
        setShowChart(false);
        setIsLoading(false);
      }
    }));

    const handleCalendarChartClick = async () => {
      try {
        setIsLoading(true);

        // Toggle behavior: if chart is already showing, hide it
        if (showChart) {
          setShowChart(false);
          if (onChartDataReady) {
            onChartDataReady(null); // Clear the chart
          }
          return;
        }

        // Check if data is loaded
        if (!isDataLoaded) {
          throw new Error('No data loaded. Please upload a CSV file first.');
        }

        // Get data from DataStore
        const [dividendData, tradesData] = await Promise.all([getDividends(), getTrades()]);

        // Validate data availability
        if (!dividendData || dividendData.length === 0) {
          throw new Error('No dividend data available for calendar chart');
        }

        setShowChart(true);

        // Pass the chart data to parent component
        if (onChartDataReady) {
          onChartDataReady({
            show: true,
            data: {
              trades: tradesData,
              dividends: dividendData
            },
            config: {
              defaultBoxColor,
              boxBorderColor,
              rowCount
            }
          });
        }
      } catch (error) {
        console.error('Calendar Chart Error:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false);
      }
    };

    const hasData = isDataLoaded;

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
