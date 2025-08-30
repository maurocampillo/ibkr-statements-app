import { ResponsiveSankey } from '@nivo/sankey'
import { BasicTooltip } from '@nivo/tooltip'

function SankeyChartComponent(props) {
  return (
    <div style={{ height: '800px', width: '100%', marginTop: '20px' }}>
      <ResponsiveSankey
        data={props.chartData}
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
    </div>)
}

export default SankeyChartComponent;