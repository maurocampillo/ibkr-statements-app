import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import LineChart from '../../Chart/LineChart';
import { formatDividendDataForLineChart } from './DividendChartHandler';
import './DividendChartComponent.css';

const DividendChartComponent = ({
  sectionsData,
  className = ""
}) => {
  const chartData = useMemo(() => {
    if (!sectionsData?.dividends || !Array.isArray(sectionsData.dividends) || sectionsData.dividends.length === 0) {
      return null;
    }
    
    try {
      return formatDividendDataForLineChart(sectionsData.dividends);
    } catch (err) {
      console.error('Dividend Chart Error:', err);
      return null;
    }
  }, [sectionsData?.dividends]);

  if (!chartData) {
    return null;
  }

  return (
    <div className={`dividend-chart-component ${className}`}>
      <div className="dividend-chart-container">
        <div className="dividend-chart-header">
          <h3>Dividend Income Over Time</h3>
          <p>Monthly dividend payments aggregated by date</p>
        </div>
        
        <div className="dividend-chart-wrapper">
          <LineChart chartData={chartData} />
        </div>
        
        <div className="dividend-chart-footer">
          <small>Interactive line chart showing dividend income trends</small>
        </div>
      </div>
    </div>
  );
};

DividendChartComponent.propTypes = {
  sectionsData: PropTypes.shape({
    dividends: PropTypes.array
  }),
  className: PropTypes.string
};

export default DividendChartComponent;