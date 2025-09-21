import _ from 'lodash';
import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';

import SankeyChart from '../../Chart/SankeyChart';
import { Autocomplete } from '../../shared';

import { getTopSourcesByAggregatedValue } from './RealizedGainsHandler';
import './RealizedGainsComponent.css';

const RealizedGainsComponent = ({
  chartData,
  selectedSources: initialSelectedSources = [],
  activeChart,
  title,
  description,
  className = ''
}) => {
  // Local state for managing selected sources in the autocomplete
  const [selectedSources, setSelectedSources] = useState(initialSelectedSources);

  // Sync selectedSources state when initialSelectedSources prop changes
  useEffect(() => {
    setSelectedSources(initialSelectedSources);
  }, [initialSelectedSources]);

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

    const top10Sources = getTopSourcesByAggregatedValue(chartData.links, 10);
    const top10SourceNames = _.sortBy(_.uniq(top10Sources.map(item => item.source)));

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

  // Helper function to create aggregated nodes and links with totals for category view
  const createAggregatedChartDataByCategory = (nodes, links) => {
    const realizedGainsTotal = _.sumBy(
      links.filter(e => e.target === 'realizedGains'),
      'value'
    );
    const dividendsTotal = _.sumBy(
      links.filter(e => e.target === 'dividends'),
      'value'
    );

    const aggregatedNodes = _.uniqBy(
      nodes.concat([{ id: 'realizedGains' }, { id: 'dividends' }, { id: 'total' }]),
      'id'
    );

    const aggregatedLinks = links.concat([
      { source: 'realizedGains', target: 'total', value: realizedGainsTotal },
      { source: 'dividends', target: 'total', value: dividendsTotal }
    ]);

    return {
      nodes: aggregatedNodes,
      links: aggregatedLinks
    };
  };

  // Helper function to create aggregated nodes and links with totals for symbol view
  const createAggregatedChartDataBySymbol = (nodes, links) => {
    const aggregatedNodes = _.uniqBy(nodes.concat([{ id: 'total' }]), 'id');
    return {
      nodes: aggregatedNodes,
      links: links
    };
  };

  // Helper function to get filtered nodes from links
  const getFilteredNodes = (chartData, links) => {
    const referencedNodeIds = new Set();
    links.forEach(link => {
      referencedNodeIds.add(link.source);
      referencedNodeIds.add(link.target);
    });
    return chartData.nodes.filter(node => referencedNodeIds.has(node.id));
  };

  // Chart type strategies for handling different data processing needs
  const chartStrategies = {
    byCategory: {
      getDefaultData: chartData => {
        const links = getTopSourcesByAggregatedValue(chartData.links, 10);
        const symbols = links.map(link => link.source);
        const nodes = chartData.nodes.filter(node => symbols.includes(node.id));
        return { nodes, links };
      },
      processData: (nodes, links) => createAggregatedChartDataByCategory(nodes, links)
    },
    bySymbol: {
      getDefaultData: chartData => {
        const links = _.sortBy(chartData.links, 'value').reverse().slice(0, 10);
        const symbols = links.map(link => link.source);
        const nodes = chartData.nodes.filter(node => symbols.includes(node.id));
        return { nodes, links };
      },
      processData: (nodes, links) => createAggregatedChartDataBySymbol(nodes, links)
    },
    overview: {
      getDefaultData: chartData => {
        return { nodes: chartData.nodes, links: chartData.links };
      },
      processData: (nodes, links) => createAggregatedChartDataBySymbol(nodes, links)
    }
  };

  // Create filtered chart data based on selected sources and active chart type
  const filteredChartData = useMemo(() => {
    if (!chartData || !chartData.links || !activeChart) {
      return chartData;
    }

    const strategy = chartStrategies[activeChart];
    if (!strategy) {      
      return chartData;
    }

    if (selectedSources.length === 0) {
      const { nodes, links } = strategy.getDefaultData(chartData);
      return strategy.processData(nodes, links);
    }

    const filteredLinks = chartData.links.filter(link => selectedSources.includes(link.source));
    const filteredNodes = getFilteredNodes(chartData, filteredLinks);

    return strategy.processData(filteredNodes, filteredLinks);
  }, [chartData, selectedSources, activeChart]);

  // Show no-data message if there's no chart data
  if (!chartData || !filteredChartData) {
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
          <SankeyChart chartData={filteredChartData} />
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
  chartData: PropTypes.shape({
    nodes: PropTypes.array,
    links: PropTypes.array
  }),
  selectedSources: PropTypes.array,
  activeChart: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string
};

export default RealizedGainsComponent;
