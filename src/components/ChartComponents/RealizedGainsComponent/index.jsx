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
  const createAggregatedChartData = (nodes, links) => {
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
    debugger
    return {
      nodes: aggregatedNodes,
      links: aggregatedLinks
    };
  };

  // Extract all available sources from the current chart data
  const availableSources = useMemo(() => {
    if (!chartData?.links) return [];
    const sources = [...new Set(chartData.links.map(link => link.source))];
    return sources.sort().filter(source => source !== "realizedGains" && source !== "dividends" && source !== "total");
  }, [chartData]);

  // Create filtered chart data based on selected sources
  const filteredChartData = useMemo(() => {
    if (!chartData || !chartData.links) {
      return chartData;
    } 
    
    if (selectedSources.length === 0) {
      // Show top 10 sources when no specific selection is made
      const links = getTopSourcesByAggregatedValue(chartData.links, 10);
      const symbols = links.map(link => link.source);
      const nodes = chartData.nodes.filter(node => symbols.includes(node.id));
      
      return createAggregatedChartData(nodes, links);
    }

    // Filter by selected sources
    const filteredLinks = chartData.links.filter(link => 
      selectedSources.includes(link.source)
    );

    // Get all nodes that are referenced in the filtered links
    const referencedNodeIds = new Set();
    filteredLinks.forEach(link => {
      referencedNodeIds.add(link.source);
      referencedNodeIds.add(link.target);
    });

    const filteredNodes = chartData.nodes.filter(node => 
      referencedNodeIds.has(node.id)
    );
    
    return createAggregatedChartData(filteredNodes, filteredLinks);
  }, [chartData, selectedSources]);

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
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color interests"></span>
                <span>Interests</span>
              </div>
              <div className="legend-item">
                <span className="legend-color dividends"></span>
                <span>Dividends</span>
              </div>
              <div className="legend-item">
                <span className="legend-color realized-gains"></span>
                <span>Realized Gains</span>
              </div>
              <div className="legend-item">
                <span className="legend-color total"></span>
                <span>Total</span>
              </div>
            </div>
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