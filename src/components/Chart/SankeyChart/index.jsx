import React from 'react';
import { ResponsiveSankey } from '@nivo/sankey'
import './SankeyChart.css';

function SankeyChartComponent(props) {
  console.log(props.chartData);

  return (
    <div className="sankey-chart-container">
      <div className="sankey-chart-wrapper" style={{ height: '800px', width: '100%' }}>
        
        <ResponsiveSankey
          data={props.chartData}
          margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
          align="justify"
          colors={{ scheme: 'category10' }}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={18}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderColor={{
            from: 'color',
            modifiers: [['darker', 0.8]]
          }}
          nodeBorderRadius={3}
          linkOpacity={0.5}
          linkHoverOthersOpacity={0.1}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="vertical"
          labelPadding={16}
          legends={[]}
          valueFormat={value => `$${Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 2
          })}`} 
          tooltip={({ node }) => (
            <div className="sankey-tooltip">
              <div className="sankey-tooltip-header">
                <div 
                  className="sankey-tooltip-color" 
                  style={{ backgroundColor: node.color }}
                />
                <span className="sankey-tooltip-label">{node.id}</span>
              </div>
              <div className="sankey-tooltip-value">
                {`$${Number(node.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default SankeyChartComponent;