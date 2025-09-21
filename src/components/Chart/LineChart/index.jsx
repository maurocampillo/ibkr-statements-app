import { ResponsiveLine } from '@nivo/line';
import { useState, useEffect } from 'react';

import { useTheme } from '../../../hooks/useTheme';

function LineChartComponent(props) {
  const { theme } = useTheme();
  const [themeColors, setThemeColors] = useState({});

  // Theme-aware colors
  const isDark = theme === 'dark';
  const isHighContrast = theme === 'high-contrast';

  // Get computed CSS variables from the document
  const getComputedCSSVar = varName => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
    return '';
  };

  // Update theme colors when theme changes
  useEffect(() => {
    const updateThemeColors = () => {
      const newColors = {
        text: getComputedCSSVar('--text-primary') || (isDark ? '#e2e8f0' : '#2d3748'),
        grid: getComputedCSSVar('--border-secondary') || (isDark ? '#4a5568' : '#e2e8f0'),
        background: getComputedCSSVar('--bg-primary') || (isDark ? '#2d3748' : '#ffffff'),
        legendBackground: isDark ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        legendHover: isDark ? 'rgba(226, 232, 240, 0.1)' : 'rgba(0, 0, 0, 0.06)'
      };

      setThemeColors(newColors);
    };

    // Initial load
    updateThemeColors();

    // Small delay to ensure CSS variables are loaded
    const timeoutId = setTimeout(updateThemeColors, 100);

    return () => clearTimeout(timeoutId);
  }, [theme, isDark]);

  // Don't render until theme colors are loaded
  if (!themeColors.text) {
    return (
      <div
        style={{
          height: '400px',
          width: '100%',
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px'
        }}
      >
        <div>Loading chart...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '400px',
        width: '100%',
        marginTop: '20px',
        backgroundColor: themeColors.background,
        borderRadius: '8px',
        transition: 'background-color 0.3s ease'
      }}
    >
      <ResponsiveLine
        key={`line-${theme}-${JSON.stringify(themeColors)}`}
        data={props.chartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{
          type: 'point'
        }}
        yScale={{
          type: 'linear',
          min: 0,
          max: 'auto',
          stacked: true,
          reverse: false
        }}
        yFormat=' >$.2f'
        curve='monotoneX'
        enableCrosshair={false}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 7,
          tickRotation: 0,
          legend: 'Months',
          legendOffset: 40,
          legendPosition: 'middle',
          tickColor: themeColors.grid,
          legendTextColor: themeColors.text
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          tickColor: themeColors.grid,
          legendTextColor: themeColors.text,
          format: v => {
            //Move to utils
            return v.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            });
          }
        }}
        theme={{
          background: themeColors.background,
          text: {
            fontSize: 12,
            fill: themeColors.text,
            outlineWidth: 0,
            outlineColor: 'transparent'
          },
          axis: {
            domain: {
              line: {
                stroke: themeColors.grid,
                strokeWidth: 1
              }
            },
            legend: {
              text: {
                fontSize: 12,
                fill: themeColors.text,
                outlineWidth: 0,
                outlineColor: 'transparent'
              }
            },
            ticks: {
              line: {
                stroke: themeColors.grid,
                strokeWidth: 1
              },
              text: {
                fontSize: 11,
                fill: themeColors.text,
                outlineWidth: 0,
                outlineColor: 'transparent'
              }
            }
          },
          grid: {
            line: {
              stroke: themeColors.grid,
              strokeWidth: 1
            }
          },
          crosshair: {
            line: {
              stroke: themeColors.text,
              strokeWidth: 1,
              strokeOpacity: 0.35
            }
          }
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel='y'
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
            symbolBorderColor: isDark ? 'rgba(226, 232, 240, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            itemTextColor: themeColors.text,
            itemBackground: themeColors.legendBackground,
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: themeColors.legendHover,
                  itemOpacity: 1,
                  itemTextColor: themeColors.text
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
}

export default LineChartComponent;
