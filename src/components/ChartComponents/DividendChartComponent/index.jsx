import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import LineChart from '../../Chart/LineChart';
import { formatDividendDataForLineChart } from './DividendChartHandler';
import './DividendChartComponent.css';

const DividendChartComponent = ({ dividendData, className = '', showStats = true }) => {  
  const [formattedDividendData, setFormattedDividendData] = useState(null);
  
  useEffect(() => {
    const formatedData = formatDividendDataForLineChart(dividendData);
    setFormattedDividendData(formatedData);
  }, [dividendData]);
  
  const getDividendStats = () => {
    if (!dividendData || !Array.isArray(dividendData)) {
      return null;
    }

    const totalAmount = dividendData.reduce((sum, div) => sum + div.amount, 0);
    const uniqueSymbols = new Set(dividendData.map(div => div.underlyingsymbol)).size;    
    const dateRange =
      dividendData.length > 0
        ? {
            start: new Date(Math.min(...dividendData.map(div => div.settledate))),
            end: new Date(Math.max(...dividendData.map(div => div.settledate)))
          }
        : null;
    
    return {
      totalAmount,
      count: dividendData?.length || 0,
      uniqueSymbols,
      dateRange
    };
  };

  const stats = getDividendStats();
  const hasData = dividendData?.length > 0;

  return (
    <div className={`dividend-chart-component ${className}`}>
      <div className='dividend-chart-container'>
        <div className='dividend-chart-header'>
          <h3>Dividend Income Over Time</h3>
          <p>Monthly dividend payments aggregated by date</p>
        </div>

        {!hasData ? (
          <div className='no-data-message'>
            <div className='no-data-icon'>📊</div>
            <p>
              No dividend data available. Upload a CSV file with dividend information to view
              analysis.
            </p>
          </div>
        ) : (
          <>
            <div className='dividend-chart-wrapper'>
              <LineChart chartData={formattedDividendData} />
            </div>

            {stats && showStats && (
              <div className='dividend-stats-preview'>
                <div className='stats-header'>
                  <h4>📊 Dividend Summary</h4>
                </div>
                <div className='stats-grid'>
                  <div className='stat-item'>
                    <span className='stat-label'>Total Amount:</span>
                    <span className='stat-value'>
                      {stats.totalAmount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-label'>Total Payments:</span>
                    <span className='stat-value'>{stats.count}</span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-label'>Unique Symbols:</span>
                    <span className='stat-value'>{stats.uniqueSymbols}</span>
                  </div>
                  {stats.dateRange && (
                    <div className='stat-item'>
                      <span className='stat-label'>Date Range:</span>
                      <span className='stat-value'>
                        {stats.dateRange.start.toLocaleDateString()} -{' '}
                        {stats.dateRange.end.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className='dividend-chart-footer'>
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
  className: PropTypes.string,
  showStats: PropTypes.bool
};

export default DividendChartComponent;
