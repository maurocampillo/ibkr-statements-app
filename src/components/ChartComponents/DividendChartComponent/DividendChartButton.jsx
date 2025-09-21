import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle } from 'react';

import { useDataStore } from '../../../store/DataStoreContext.tsx';
import '../../shared/ChartButton/ChartButton.css';
import './DividendChartComponent.css';

const DividendChartButton = forwardRef(
  ({ buttonText = 'Dividends', className = '', onChartDataReady, onError }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const { getDividends, isDataLoaded } = useDataStore();

    // Expose reset function to parent component
    useImperativeHandle(ref, () => ({
      resetButton: () => {
        setShowChart(false);
        setIsLoading(false);
      }
    }));

    const handleDividendsClick = async () => {
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

        // Get dividend data from DataStore
        const dividendData = await getDividends();

        if (!dividendData || dividendData.length === 0) {
          throw new Error('No dividend data found in the uploaded file.');
        }

        setShowChart(true);

        // Pass the chart data to parent component
        if (onChartDataReady) {
          onChartDataReady({
            data: dividendData,
            type: 'dividends'
          });
        }
      } catch (error) {
        console.error('Error processing dividend data:', error);
        if (onError) {
          onError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const hasData = isDataLoaded;
    return (
      <div className={`chart-button-component ${className}`}>
        <div className='chart-button-controls'>
          <button
            onClick={handleDividendsClick}
            disabled={isLoading || !hasData}
            className={`chart-button dividend ${showChart ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}
            title={hasData ? 'Click to view dividend analysis' : 'No dividend data available'}
          >
            <span className='button-icon'>💰</span>
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

DividendChartButton.propTypes = {
  buttonText: PropTypes.string,
  className: PropTypes.string,
  onChartDataReady: PropTypes.func,
  onError: PropTypes.func
};

DividendChartButton.defaultProps = {
  buttonText: 'Dividends',
  className: '',
  onChartDataReady: () => {},
  onError: () => {}
};

export default DividendChartButton;
