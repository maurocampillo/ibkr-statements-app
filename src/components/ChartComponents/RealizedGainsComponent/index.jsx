import _ from 'lodash';
import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';

import SankeyChart from '../../Chart/SankeyChart';
import { Autocomplete } from '../../shared';

import {
  formatRealizedGainsDataForSankeyChartWithFilter,
  formatRealizedGainsDataForSankeyChartBySymbolWithFilter,
  formatRealizedGainsDataForSankeyChartByCategoryWithFilter
} from './RealizedGainsHandler';
import './RealizedGainsComponent.css';

const RealizedGainsComponent = ({ rawData, activeChart, title, description, className = '' }) => {
  // Local state for managing selected sources and processed data
  const [selectedSources, setSelectedSources] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Chart type configurations
  const getChartFormatter = chartType => {
    const formatters = {
      overview: formatRealizedGainsDataForSankeyChartWithFilter,
      bySymbol: formatRealizedGainsDataForSankeyChartBySymbolWithFilter,
      byCategory: formatRealizedGainsDataForSankeyChartByCategoryWithFilter
    };
    return formatters[chartType];
  };

  // Process data when rawData, activeChart, or selectedSources change
  useEffect(() => {
    if (!rawData || !activeChart) {
      setChartData(null);
      return;
    }

    const formatter = getChartFormatter(activeChart);
    if (!formatter) {
      setChartData(null);
      return;
    }

    const processedData = formatter(rawData, selectedSources);
    setChartData(processedData);
  }, [rawData, activeChart, selectedSources]);

  // Calculate available sources for autocomplete
  const availableSources = useMemo(() => {
    if (!chartData?.links) {
      return [];
    }

    const sources = chartData.links
      .filter(link => link.target === 'dividends' || link.target === 'realizedGains')
      .map(link => link.source);

    return _.uniq(sources).sort();
  }, [chartData?.links]);

  // Handlers for autocomplete
  const handleSourceSelectionChange = newSelectedSources => {
    setSelectedSources(newSelectedSources);
  };

  const handleShowTop10Sources = () => {
    if (!chartData?.links) {
      return;
    }

    const top10Sources = formatRealizedGainsDataForSankeyChartBySymbolWithFilter(rawData);
    const top10SourceNames = _.sortBy(_.uniq(top10Sources.links.map(item => item.source)));

    setSelectedSources(top10SourceNames);
  };

  // Calculate stats for the current chart
  const getChartStats = () => {
    if (!activeChart || !chartData?.links) {
      return null;
    }

    const links = chartData.links;

    // Calculate totals based on chart type
    let stats = {
      chartType: title || 'Unknown',
      totalLinks: links.length
    };

    if (activeChart === 'overview') {
      const realizedGainsTotal = links
        .filter(link => link.target === 'realizedGains')
        .reduce((sum, link) => sum + (link.value || 0), 0);
      const dividendsTotal = links
        .filter(link => link.target === 'dividends')
        .reduce((sum, link) => sum + (link.value || 0), 0);
      const interestsTotal = links
        .filter(link => link.target === 'interests')
        .reduce((sum, link) => sum + (link.value || 0), 0);

      stats = {
        ...stats,
        realizedGainsTotal,
        dividendsTotal,
        interestsTotal,
        totalValue: realizedGainsTotal + dividendsTotal + interestsTotal
      };
    } else {
      const totalValue = links.reduce((sum, link) => sum + (link.value || 0), 0);
      stats = { ...stats, totalValue };
    }

    return stats;
  };

  const stats = getChartStats();

  // The chart data is now processed entirely in the handler
  // This component just displays the data and manages UI state
  const displayData = chartData;

  // Show no-data message if there's no chart data
  if (!chartData || !displayData) {
    return (
      <div className={`realized-gains-component ${className}`}>
        <div className='realized-gains-container'>
          <div className='no-data-message'>
            <div className='no-data-icon'>📊</div>
            <p>
              No realized gains data available. Upload a CSV file with trading and dividend
              information to view analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`realized-gains-component ${className}`}>
      <div className='realized-gains-container'>
        <div className='realized-gains-header'>
          <h3>{title || 'Realized Gains Analysis'}</h3>
          <p>{description || 'Interactive Sankey diagram showing financial performance flows'}</p>
        </div>

        {/* Filter Section */}
        {availableSources.length > 0 && (
          <div className='realized-gains-filter-section'>
            <div className='filter-section-header'>
              <h4>🔍 Filter Sources</h4>
              <button
                onClick={handleShowTop10Sources}
                className='top-sources-button'
                title='Show top 10 sources by total value (dividends + realized gains)'
              >
                📊 Top 10 Sources
              </button>
            </div>

            <Autocomplete
              options={availableSources}
              selectedValues={selectedSources}
              onSelectionChange={handleSourceSelectionChange}
              placeholder='Filter by source...'
              className='realized-gains-autocomplete'
              maxHeight={200}
              showSelectAll={true}
              showClearAll={true}
              noResultsText='No sources found matching'
              searchIconText='🔍'
            />
          </div>
        )}

        <div className='realized-gains-chart-wrapper'>
          <SankeyChart chartData={displayData} />
        </div>

        {/* Stats Preview */}
        {stats && activeChart && (
          <div className='realized-gains-stats-preview'>
            <div className='stats-header'>
              <h4>📊 {stats.chartType} Summary</h4>
            </div>
            <div className='stats-grid'>
              {stats.totalValue !== undefined && (
                <div className='stat-item'>
                  <span className='stat-label'>Total Value:</span>
                  <span className='stat-value'>
                    {stats.totalValue.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </span>
                </div>
              )}
              {stats.realizedGainsTotal !== undefined && (
                <div className='stat-item'>
                  <span className='stat-label'>Realized Gains:</span>
                  <span className='stat-value'>
                    {stats.realizedGainsTotal.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </span>
                </div>
              )}
              {stats.dividendsTotal !== undefined && (
                <div className='stat-item'>
                  <span className='stat-label'>Dividends:</span>
                  <span className='stat-value'>
                    {stats.dividendsTotal.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </span>
                </div>
              )}
              {stats.interestsTotal !== undefined && (
                <div className='stat-item'>
                  <span className='stat-label'>Interests:</span>
                  <span className='stat-value'>
                    {stats.interestsTotal.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className='realized-gains-footer'>
          <small>Interactive Sankey diagram showing financial performance flows</small>
        </div>
      </div>
    </div>
  );
};

RealizedGainsComponent.propTypes = {
  rawData: PropTypes.shape({
    realizedGains: PropTypes.array,
    dividends: PropTypes.array,
    trades: PropTypes.array,
    cashReport: PropTypes.array
  }),
  activeChart: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string
};

export default RealizedGainsComponent;
