import { ResponsiveLine } from '@nivo/line';

function DividendLineChart(props) {
  return (
    <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
      <ResponsiveLine
        data={props.chartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{
          type: 'point',
        }}
        yScale={{
          type: 'linear',
          min: 0,
          max: 'auto',
          stacked: true,
          reverse: false
        }}
        yFormat=" >$.2f"
        curve="monotoneX"
        enableCrosshair={false}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 7,
          tickRotation: 0,
          legend: 'Months',
          legendOffset: 40,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          format: (v) => {
            //Move to utils
            return v.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
           });
          }
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel="y"
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .06)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
      />
    </div>)
}

export default DividendLineChart;