import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle } from 'react';
import '../../shared/ChartButton/ChartButton.css';
import './RealizedGainsComponent.css';

const RealizedGainsButtonsGroup = forwardRef(
  (
    {
      className = '',
      defaultView = 'overview', // "overview", "bySymbol", "byCategory"
      onChartTypeChange,
      isDataLoaded = false,
      isLoading = false
    },
    ref
  ) => {
    const [activeChart, setActiveChart] = useState(defaultView);

    // Expose reset function to parent component
    useImperativeHandle(ref, () => ({
      resetButton: () => {
        setActiveChart(null);
      }
    }));

    const handleChartClick = chartType => {
      // Toggle behavior: if the same chart is already active, hide it
      if (activeChart === chartType) {
        setActiveChart(null);
        if (onChartTypeChange) {
          onChartTypeChange(null); // Clear the chart
        }
        return;
      }

      // Set the active chart and notify parent
      setActiveChart(chartType);
      if (onChartTypeChange) {
        onChartTypeChange(chartType);
      }
    };

    return (
      <>
        {['overview', 'bySymbol', 'byCategory'].map(chartId => {
          const chartLabels = {
            overview: 'Realized Gains Overview',
            bySymbol: 'Realized Gains by Symbol',
            byCategory: 'Realized Gains by Category'
          };
          const chartIcons = {
            overview: '📊',
            bySymbol: '🏷️',
            byCategory: '📂'
          };
          return (
            <div key={chartId} className={`chart-button-component ${className}`}>
              <div className='chart-button-controls'>
                <button
                  onClick={() => handleChartClick(chartId)}
                  disabled={isLoading || !isDataLoaded}
                  className={`chart-button realized-gains ${activeChart === chartId ? 'active' : ''} ${!isDataLoaded ? 'disabled' : ''}`}
                  title={
                    isDataLoaded
                      ? `Visualize ${chartLabels[chartId]}`
                      : `Missing required data for ${chartLabels[chartId]}`
                  }
                >
                  <span className='button-icon'>{chartIcons[chartId]}</span>
                  <div className='button-content'>
                    <span className='button-label'>
                      {isLoading && activeChart === chartId ? 'Loading...' : chartLabels[chartId]}
                    </span>
                  </div>
                  {activeChart === chartId && <span className='active-indicator'>✓</span>}
                </button>
              </div>
            </div>
          );
        })}
      </>
    );
  }
);

RealizedGainsButtonsGroup.propTypes = {
  className: PropTypes.string,
  defaultView: PropTypes.oneOf(['overview', 'bySymbol', 'byCategory']),
  onChartTypeChange: PropTypes.func,
  isDataLoaded: PropTypes.bool,
  isLoading: PropTypes.bool
};

RealizedGainsButtonsGroup.defaultProps = {
  className: '',
  defaultView: 'overview',
  onChartTypeChange: () => {},
  isDataLoaded: false,
  isLoading: false
};

export default RealizedGainsButtonsGroup;
