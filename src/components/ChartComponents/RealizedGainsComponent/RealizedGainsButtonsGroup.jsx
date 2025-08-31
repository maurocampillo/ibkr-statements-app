import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from '../../shared';
import { 
  formatRealizedGainsDataForSankeyChart,
  formatRealizedGainsDataForSankeyChartBySymbol,
  formatRealizedGainsDataForSankeyChartByCategory,
  getTopSourcesByAggregatedValue
} from './RealizedGainsHandler';
import './RealizedGainsComponent.css';

const RealizedGainsButtonsGroup = ({
  totals,
  sectionsData,
  className = "",
  defaultView = "overview", // "overview", "bySymbol", "byCategory"
  onChartDataReady,
  onError,
  showStats = true
}) => {
  const [activeChart, setActiveChart] = useState(null);
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);

  const chartTypes = [
    {
      id: "overview",
      label: "Realized Gains Overview",
      description: "Total breakdown of interests, dividends, and realized gains",
      icon: "📊",
      handler: () => formatRealizedGainsDataForSankeyChart(totals),
      requiredData: totals
    },
    {
      id: "bySymbol",
      label: "Realized Gains by Symbol",
      description: "Performance breakdown by individual symbols",
      icon: "🏷️",
      handler: () => formatRealizedGainsDataForSankeyChartBySymbol(sectionsData),
      requiredData: sectionsData
    },
    {
      id: "byCategory",
      label: "Realized Gains by Category",
      description: "Performance grouped by category and symbol",
      icon: "📂",
      handler: () => formatRealizedGainsDataForSankeyChartByCategory(sectionsData),
      requiredData: sectionsData
    }
  ];

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
  }, [chartData, activeChart]);

  const handleChartClick = async (chartType) => {
    try {
      setIsLoading(true);
      
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

      // Pass the chart data to parent component
      if (onChartDataReady) {
        onChartDataReady({
          type: 'realized-gains',
          subType: chartType,
          data: data,
          title: chart.label,
          description: chart.description,
          availableSources: [...new Set(data.links?.map(link => link.source) || [])],
          selectedSources: []
        });
      }
    } catch (err) {
      if (onError) {
        onError(err.message);
      }
      console.error('Realized Gains Chart Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChart = () => {
    setActiveChart(null);
    setSelectedSources([]);
    if (onChartDataReady) {
      onChartDataReady(null); // Clear the chart
    }
  };

  const handleSourceSelectionChange = (newSelection) => {
    setSelectedSources(newSelection);
    
    // Update parent with new selection
    if (onChartDataReady && activeChart && chartData) {
      const chart = chartTypes.find(c => c.id === activeChart);
      onChartDataReady({
        type: 'realized-gains',
        subType: activeChart,
        data: chartData,
        title: chart?.label || 'Realized Gains',
        description: chart?.description || '',
        availableSources: availableSources,
        selectedSources: newSelection
      });
    }
  };

  const handleShowTop10Sources = () => {
    if (!chartData?.links) return;
    
    const topSourceElements = getTopSourcesByAggregatedValue(chartData.links, 10);
    const topSources = [...new Set(topSourceElements.map(link => link.source))];
    setSelectedSources(topSources);
    handleSourceSelectionChange(topSources);
  };

  const getChartStats = () => {
    if (!activeChart || !chartData?.links) return null;

    const chart = chartTypes.find(c => c.id === activeChart);
    const links = chartData.links;
    
    // Calculate totals based on chart type
    let stats = {
      chartType: chart?.label || 'Unknown',
      totalSources: availableSources.length,
      selectedSources: selectedSources.length,
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
  const hasAnyData = totals || sectionsData;

  return (
    <div className={`realized-gains-buttons-group ${className}`}>
      <div className="realized-gains-controls">
        <div className="realized-gains-buttons">
          {chartTypes.map((chart) => (
            <button
              key={chart.id}
              onClick={() => handleChartClick(chart.id)}
              disabled={isLoading || !chart.requiredData}
              className={`realized-gains-button ${activeChart === chart.id ? 'active' : ''} ${!chart.requiredData ? 'disabled' : ''}`}
              title={chart.requiredData ? chart.description : `Missing required data for ${chart.label}`}
            >
              <span className="button-icon">{chart.icon}</span>
              <div className="button-content">
                <span className="button-label">
                  {isLoading && activeChart === chart.id ? 'Loading...' : chart.label}
                </span>
                <span className="button-description">
                  {chart.description}
                </span>
              </div>
              {activeChart === chart.id && (
                <span className="active-indicator">✓</span>
              )}
            </button>
          ))}
        </div>
        
        {activeChart && (
          <button 
            onClick={handleCloseChart}
            className="realized-gains-close-button"
            aria-label="Close realized gains chart"
            title="Close realized gains chart"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Section */}
      {activeChart && availableSources.length > 0 && (
        <div className="realized-gains-filter-section">
          <div className="filter-section-header">
            <h4>🔍 Filter Sources</h4>
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

      {/* Stats Preview */}
      {stats && activeChart && showStats && (
        <div className="realized-gains-stats-preview">
          <div className="stats-header">
            <h4>📊 {stats.chartType} Summary</h4>
          </div>
          <div className="stats-grid">
            {stats.totalValue !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Total Value:</span>
                <span className="stat-value">
                  {stats.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            )}
            {stats.realizedGainsTotal !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Realized Gains:</span>
                <span className="stat-value">
                  {stats.realizedGainsTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            )}
            {stats.dividendsTotal !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Dividends:</span>
                <span className="stat-value">
                  {stats.dividendsTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            )}
            {stats.interestsTotal !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Interests:</span>
                <span className="stat-value">
                  {stats.interestsTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            )}
            <div className="stat-item">
              <span className="stat-label">Available Sources:</span>
              <span className="stat-value">{stats.totalSources}</span>
            </div>
            {stats.selectedSources > 0 && (
              <div className="stat-item">
                <span className="stat-label">Selected Sources:</span>
                <span className="stat-value">{stats.selectedSources}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasAnyData && (
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <p>No realized gains data available. Upload a CSV file with trading and dividend information to view analysis.</p>
        </div>
      )}
    </div>
  );
};

RealizedGainsButtonsGroup.propTypes = {
  totals: PropTypes.object,
  sectionsData: PropTypes.object,
  className: PropTypes.string,
  defaultView: PropTypes.oneOf(["overview", "bySymbol", "byCategory"]),
  onChartDataReady: PropTypes.func,
  onError: PropTypes.func,
  showStats: PropTypes.bool
};

RealizedGainsButtonsGroup.defaultProps = {
  className: "",
  defaultView: "overview",
  showStats: true,
  onChartDataReady: () => {},
  onError: () => {}
};

export default RealizedGainsButtonsGroup;