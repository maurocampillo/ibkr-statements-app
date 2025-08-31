import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import SankeyChart from '../../Chart/SankeyChart';
import { Autocomplete } from '../../shared';
import _ from 'lodash';
import { 
  formatRealizedGainsDataForSankeyChart,
  formatRealizedGainsDataForSankeyChartBySymbol,
  formatRealizedGainsDataForSankeyChartByCategory,
  getTopSourcesByAggregatedValue
} from './RealizedGainsHandler';
import './RealizedGainsComponent.css';

const RealizedGainsComponent = ({
  totals,
  sectionsData,
  className = "",
  showButtons = true,
  autoShow = false,
  defaultView = "overview" // "overview", "bySymbol", "byCategory"
}) => {
  const [activeChart, setActiveChart] = useState(autoShow ? defaultView : null);
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSources, setSelectedSources] = useState([]);

  const chartTypes = [
    {
      id: "overview",
      label: "Realized Gains Overview",
      description: "Total breakdown of interests, dividends, and realized gains",
      handler: () => formatRealizedGainsDataForSankeyChart(totals),
      requiredData: totals
    },
    {
      id: "bySymbol",
      label: "Realized Gains by Symbol",
      description: "Performance breakdown by individual symbols",
      handler: () => formatRealizedGainsDataForSankeyChartBySymbol(sectionsData),
      requiredData: sectionsData
    },
    {
      id: "byCategory",
      label: "Realized Gains by Category",
      description: "Performance grouped by category and symbol",
      handler: () => formatRealizedGainsDataForSankeyChartByCategory(sectionsData),
      requiredData: sectionsData
    }
  ];


  // Helper function to create aggregated nodes and links with totals
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

  // Helper function to create aggregated nodes and links with totals
  const createAggregatedChartDataBySymbol = (nodes, links) => {
    const aggregatedNodes = _.uniqBy(nodes.concat([
      { id: "total"}
    ]), 'id');
    return {
      nodes: aggregatedNodes,
      links: links
    };
  };

  // Extract all available sources from the current chart data
  const availableSources = useMemo(() => {
    if (!chartData?.links) return [];
    const sources = [...new Set(chartData.links.map(link => link.source))];
    switch(activeChart) {
      case "byCategory":
        return sources.sort().filter(source => source !== "realizedGains" && source !== "dividends" && source !== "total");
      case "bySymbol":
        return sources.sort().filter(source => source !== "total");
      case "overview":
        return sources.sort().filter(source => source !== "total");
      default:
        return sources.sort();
    }
  }, [chartData]);

    // Chart type strategies for handling different data processing needs
  const chartStrategies = {
    byCategory: {
      getDefaultData: (chartData) => {
        // Show top 10 sources by aggregated value for category view
        const links = getTopSourcesByAggregatedValue(chartData.links, 10);
        const symbols = links.map(link => link.source);
        const nodes = chartData.nodes.filter(node => symbols.includes(node.id));
        return { nodes, links };
      },
      processData: (nodes, links) => createAggregatedChartDataByCategory(nodes, links)
    },
    bySymbol: {
      getDefaultData: (chartData) => {
        // Show top 10 sources by individual value for symbol view
        const links = _.sortBy(chartData.links, 'value').reverse().slice(0, 10);
        const symbols = links.map(link => link.source);
        const nodes = chartData.nodes.filter(node => symbols.includes(node.id));
        return { nodes, links };
      },
      processData: (nodes, links) => createAggregatedChartDataBySymbol(nodes, links)
    },
    overview: {
      getDefaultData: (chartData) => {
        // For overview, use all data
        return { nodes: chartData.nodes, links: chartData.links };
      },
      processData: (nodes, links) => createAggregatedChartDataBySymbol(nodes, links)
    }
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

  // Create filtered chart data based on selected sources and active chart type
  const filteredChartData = useMemo(() => {
    // Early return for invalid data
    if (!chartData || !chartData.links || !activeChart) {
      return chartData;
    }

    const strategy = chartStrategies[activeChart];
    if (!strategy) {
      console.warn(`Unknown chart type: ${activeChart}`);
      return chartData;
    }

    // No sources selected - use default data for the chart type
    if (selectedSources.length === 0) {
      const { nodes, links } = strategy.getDefaultData(chartData);
      return strategy.processData(nodes, links);
    }

    // Sources selected - filter data and process according to chart type
    const filteredLinks = chartData.links.filter(link => 
      selectedSources.includes(link.source)
    );
    const filteredNodes = getFilteredNodes(chartData, filteredLinks);
    
    return strategy.processData(filteredNodes, filteredLinks);
  }, [chartData, selectedSources, activeChart]);

  const handleSourceSelectionChange = (newSelection) => {
    setSelectedSources(newSelection);
  };

  const handleShowTop10Sources = () => {
    if (!chartData?.links) return;
    
    const topSourceElements = getTopSourcesByAggregatedValue(chartData.links, 10);
    const topSources = [...new Set(topSourceElements.map(link => link.source))];
    setSelectedSources(topSources);
  };

  const handleChartClick = async (chartType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const chart = chartTypes.find(c => c.id === chartType);
      if (!chart) {
        throw new Error(`Unknown chart type: ${chartType}`);
      }

      if (!chart.requiredData) {
        throw new Error(`Missing required data for ${chart.label}`);
      }

      const data = chart.handler();
      setChartData(data);
      setActiveChart(chartType);
      // Reset filter when switching chart types
      setSelectedSources([]);
    } catch (err) {
      setError(err.message);
      console.error('Realized Gains Chart Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChart = () => {
    setActiveChart(null);
    setError(null);
  };

  const getActiveChartInfo = () => {
    return chartTypes.find(c => c.id === activeChart);
  };

  return (
    <div className={`realized-gains-component ${className}`}>
      {showButtons && (
        <div className="realized-gains-controls">
          <div className="realized-gains-buttons">
            {chartTypes.map((chart) => (
              <button
                key={chart.id}
                onClick={() => handleChartClick(chart.id)}
                disabled={isLoading || !chart.requiredData}
                className={`realized-gains-button ${activeChart === chart.id ? 'active' : ''}`}
                title={chart.description}
              >
                {isLoading && activeChart === chart.id ? 'Loading...' : chart.label}
              </button>
            ))}
          </div>
          
          {activeChart && (
            <button 
              onClick={handleCloseChart}
              className="realized-gains-close-button"
              aria-label="Close realized gains chart"
            >
              ×
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="realized-gains-error">
          <p>Error loading realized gains chart: {error}</p>
          <button onClick={() => setError(null)} className="error-dismiss-button">
            Dismiss
          </button>
        </div>
      )}

      {activeChart && !error && (
        <div className="realized-gains-container">
          <div className="realized-gains-header">
            <h3>{getActiveChartInfo()?.label}</h3>
            <p>{getActiveChartInfo()?.description}</p>
          </div>
          
          {availableSources.length > 0 && (
            <div className="realized-gains-filter-section">
              <div className="filter-section-header">
                <h4>Filter Sources</h4>
                <button 
                  onClick={handleShowTop10Sources}
                  className="top-sources-button"
                  title="Show top 10 sources by total value (dividends + realized gains)"
                >
                  📊 Top 10 Sources
                </button>
              </div>
              
              <Autocomplete
                options={availableSources}
                selectedValues={selectedSources}
                onSelectionChange={handleSourceSelectionChange}
                placeholder="Filter by source..."
                className="realized-gains-autocomplete"
                maxHeight={200}
                showSelectAll={true}
                showClearAll={true}
                noResultsText="No sources found matching"
                searchIconText="🔍"
              />
            </div>
          )}
          
          <div className="realized-gains-chart-wrapper">
            <SankeyChart chartData={filteredChartData} />
          </div>
          
          <div className="realized-gains-footer">            
            <small>Interactive Sankey diagram showing financial performance flows</small>
          </div>
        </div>
      )}
    </div>
  );
};

RealizedGainsComponent.propTypes = {
  totals: PropTypes.object,
  sectionsData: PropTypes.object,
  className: PropTypes.string,
  showButtons: PropTypes.bool,
  autoShow: PropTypes.bool,
  defaultView: PropTypes.oneOf(["overview", "bySymbol", "byCategory"])
};

export default RealizedGainsComponent;