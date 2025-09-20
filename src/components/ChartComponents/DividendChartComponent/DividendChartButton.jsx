import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle } from 'react';
import '../../shared/ChartButton/ChartButton.css';
import './DividendChartComponent.css';

const DividendChartButton = forwardRef(
  ({ sectionsData, buttonText = 'Dividends', className = '', onChartDataReady, onError }, ref) => {    
    const [isLoading, setIsLoading] = useState(false);
    const [showChart, setShowChart] = useState(false);

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

        if (
          !sectionsData?.statementOfFunds?.sectionData ||
          !Array.isArray(sectionsData.statementOfFunds.sectionData) ||
          sectionsData.statementOfFunds.sectionData.length === 0
        ) {
          throw new Error('Missing or empty dividend data');
        }
        const dividendData = sectionsData.statementOfFunds.sectionData.filter(div => div.activitycode == "DIV" || div.activitycode == "PIL")

        setShowChart(true);

        // Pass the chart data to parent component
        if (onChartDataReady) {
          onChartDataReady({
            type: 'dividends',
            data: dividendData,
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

    const hasData = sectionsData?.statementOfFunds?.sectionData?.length > 0;
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
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
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
