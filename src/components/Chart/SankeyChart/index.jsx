import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ResponsiveSankey } from '@nivo/sankey'
import { BasicTooltip } from '@nivo/tooltip'
import './SankeyChart.css';

function SankeyChartComponent(props) {
  const [selectedSources, setSelectedSources] = useState([]);
  const prevSourceOptionsRef = useRef([]);    
  // Extract unique source options from chartData
  const sourceOptions = useMemo(() => {
    if (!props.chartData?.links) return [];
    const sources = [...new Set(props.chartData.links.map(link => link.source))];
    setSelectedSources([]);
    return sources.sort();
  }, [props.chartData]);

  // Reset selectedSources when sourceOptions change to prevent stale state
  useEffect(() => {
    const prevSourceOptions = prevSourceOptionsRef.current;
    const sourceOptionsChanged = JSON.stringify(prevSourceOptions) !== JSON.stringify(sourceOptions);
    
    if (sourceOptionsChanged) {
      if (sourceOptions.length > 0) {
        // Check if any of the current selected sources still exist in the new data
        const validSelectedSources = selectedSources.filter(source => 
          sourceOptions.includes(source)
        );
        
        // Update selection to only include valid sources
        setSelectedSources(validSelectedSources);
      } else {
        // If no sources available, clear selection
        setSelectedSources([]);
      }
      
      // Update the ref with current sourceOptions
      prevSourceOptionsRef.current = sourceOptions;
    }
  }, [sourceOptions, selectedSources]);

  // Filter chart data based on selected sources
  const filteredChartData = useMemo(() => {
    if (!props.chartData || selectedSources.length === 0) {
      return props.chartData;
    }

    const filteredLinks = props.chartData.links.filter(link => 
      selectedSources.includes(link.source)
    );

    // Get all nodes that are referenced in filtered links
    const referencedNodes = new Set();
    filteredLinks.forEach(link => {
      referencedNodes.add(link.source);
      referencedNodes.add(link.target);
    });

    const filteredNodes = props.chartData.nodes.filter(node => 
      referencedNodes.has(node.id)
    );

    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [props.chartData, selectedSources]);

  const handleSourceToggle = (source) => {
    setSelectedSources(prev => {
      if (prev.includes(source)) {
        return prev.filter(s => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedSources(sourceOptions);
  };

  const handleClearAll = () => {
    setSelectedSources([]);
  };

  const isAllSelected = selectedSources.length === sourceOptions.length;
  const isNoneSelected = selectedSources.length === 0;

  return (
    <div className="sankey-chart-container">
      {sourceOptions.length > 0 && (
        <div className="sankey-filter-controls">
          <div className="filter-header">
            <h4>Filter by Source</h4>
            <div className="filter-actions">
              <button 
                onClick={handleSelectAll}
                disabled={isAllSelected}
                className="filter-action-btn select-all"
              >
                Select All
              </button>
              <button 
                onClick={handleClearAll}
                disabled={isNoneSelected}
                className="filter-action-btn clear-all"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="multiselect-container">
            {sourceOptions.map(source => (
              <label key={source} className="multiselect-option">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={() => handleSourceToggle(source)}
                  className="multiselect-checkbox"
                />
                <span className="multiselect-label">{source}</span>
              </label>
            ))}
          </div>
          
          <div className="filter-summary">
            {isNoneSelected ? (
              <span className="summary-text">Showing all sources ({sourceOptions.length})</span>
            ) : (
              <span className="summary-text">
                Showing {selectedSources.length} of {sourceOptions.length} sources
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="sankey-chart-wrapper" style={{ height: '800px', width: '100%', marginTop: '20px' }}>
        <ResponsiveSankey
          data={filteredChartData}
        margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
        align="justify"
        colors={{ scheme: 'category10' }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={10}
        nodeBorderWidth={0}
        nodeBorderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.8
                ]
            ]
        }}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient={true}
        enableLabels={true}
        labelPosition="inside"
        sort="input"
        valueFormat={value =>
          `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        labelPadding={16}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1
                ]
            ]
        }}
        nodeTooltip={({
            node
          }) => {
            return <BasicTooltip
              id={node.label}
              value={node.formattedValue}
              enableChip={true}
              color={node.color}
            />
          }
        }
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 130,
                itemWidth: 100,
                itemHeight: 14,
                itemDirection: 'right-to-left',
                itemsSpacing: 2,
                itemTextColor: '#999',
                symbolSize: 14,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
      />
      </div>
    </div>)
}

export default SankeyChartComponent;