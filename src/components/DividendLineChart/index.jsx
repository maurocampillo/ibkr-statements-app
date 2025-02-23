import { ResponsiveLine } from '@nivo/line';

function DividendLineChart(props) {
  return (
    <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
      <ResponsiveLine
        data={props.chartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          useUTC: false,
          precision: 'day'
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: 'linear',
          min: 0,
          max: 'auto',
          stacked: false,
          reverse: false
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          format: '%Y-%m-%d',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Date',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Amount',
          legendOffset: -40,
          legendPosition: 'middle'
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
                  itemBackground: 'rgba(0, 0, 0, .03)',
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