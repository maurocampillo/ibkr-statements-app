import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import SankeyChart from '../../Chart/SankeyChart';
import _ from 'lodash';
import { getTopSourcesByAggregatedValue } from './RealizedGainsHandler';
import './RealizedGainsComponent.css';

const RealizedGainsComponent = ({
  chartData,
  selectedSources = [],
  activeChart,
  title,
  description,
  className = ""
}) => {
  // Helper function to create aggregated nodes and links with totals for category view
  const createAggregatedChartDataByCategory = (nodes, links) => {
    const realizedGainsTotal = _.sumBy(
      links.filter(e => e.target === "realizedGains"), 
      'value'
    );
    const dividendsTotal = _.sumBy(
      links.filter(e => e.target === "dividends"), 
      'value'
    );
    
    const aggregatedNodes = _.uniqBy(nodes.concat([
      { id: "realizedGains"}, 
      { id: "dividends"}, 
      { id: "total"}
    ]), 'id');
    
    const aggregatedLinks = links.concat([
      { source: "realizedGains", target: "total", value: realizedGainsTotal }, 
      { source: "dividends", target: "total", value: dividendsTotal }
    ]);
    
    return {
      nodes: aggregatedNodes,
      links: aggregatedLinks
    };
  };

  // Helper function to create aggregated nodes and links with totals for symbol view
  const createAggregatedChartDataBySymbol = (nodes, links) => {
    const aggregatedNodes = _.uniqBy(nodes.concat([
      { id: "total"}
    ]), 'id');
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
      getDefaultData: (chartData) => {
        const links = getTopSourcesByAggregatedValue(chartData.links, 10);
        const symbols = links.map(link => link.source);
        const nodes = chartData.nodes.filter(node => symbols.includes(node.id));
        return { nodes, links };
      },
      processData: (nodes, links) => createAggregatedChartDataByCategory(nodes, links)
    },
    bySymbol: {
      getDefaultData: (chartData) => {
        const links = _.sortBy(chartData.links, 'value').reverse().slice(0, 10);
        const symbols = links.map(link => link.source);
        const nodes = chartData.nodes.filter(node => symbols.includes(node.id));
        return { nodes, links };
      },
      processData: (nodes, links) => createAggregatedChartDataBySymbol(nodes, links)
    },
    overview: {
      getDefaultData: (chartData) => {
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
      console.warn(`Unknown chart type: ${activeChart}`);
      return chartData;
    }

    if (selectedSources.length === 0) {
      const { nodes, links } = strategy.getDefaultData(chartData);
      return strategy.processData(nodes, links);
    }

    const filteredLinks = chartData.links.filter(link => 
      selectedSources.includes(link.source)
    );
    const filteredNodes = getFilteredNodes(chartData, filteredLinks);
    
    return strategy.processData(filteredNodes, filteredLinks);
  }, [chartData, selectedSources, activeChart]);

  if (!chartData || !filteredChartData) {
    return null;
  }

  return (
    <div className={`realized-gains-component ${className}`}>
      <div className="realized-gains-container">
        <div className="realized-gains-header">
          <h3>{title || 'Realized Gains Analysis'}</h3>
          <p>{description || 'Interactive Sankey diagram showing financial performance flows'}</p>
        </div>
        
        <div className="realized-gains-chart-wrapper">
          <SankeyChart chartData={filteredChartData} />
        </div>
        
        <div className="realized-gains-footer">            
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