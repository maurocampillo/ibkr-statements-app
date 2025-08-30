# RealizedGainsComponent

A comprehensive React component that wraps SankeyChart with integrated business logic for displaying realized gains data in multiple views.

## Features

- **Multiple Chart Views**: Three different perspectives on realized gains data
- **Integrated Buttons**: Built-in buttons for each chart type with active states
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Visual feedback during data processing
- **Interactive Legend**: Color-coded legend for data categories
- **Responsive Design**: Mobile-friendly layout and interactions
- **Custom Styling**: Component-specific CSS with modern design
- **Accessibility**: ARIA labels and keyboard navigation support

## Chart Types

### 1. Overview
- **Purpose**: Total breakdown of interests, dividends, and realized gains
- **Data Source**: `totals` prop
- **Description**: High-level financial performance summary

### 2. By Symbol
- **Purpose**: Performance breakdown by individual symbols
- **Data Source**: `sectionsData` prop
- **Description**: Detailed view of each symbol's contribution

### 3. By Category
- **Purpose**: Performance grouped by category and symbol
- **Data Source**: `sectionsData` prop
- **Description**: Hierarchical view showing category → symbol → total flow

## Usage

```jsx
import RealizedGainsComponent from './components/ChartComponents/RealizedGainsComponent';

<RealizedGainsComponent 
  totals={totals}
  sectionsData={sectionsData}
  className="custom-realized-gains"
  showButtons={true}
  autoShow={false}
  defaultView="overview"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totals` | Object | - | Financial totals data for overview chart |
| `sectionsData` | Object | - | Detailed sections data for symbol/category charts |
| `className` | String | "" | Additional CSS class for the component |
| `showButtons` | Boolean | true | Whether to show the chart type buttons |
| `autoShow` | Boolean | false | Whether to automatically show a chart on mount |
| `defaultView` | String | "overview" | Default chart type ("overview", "bySymbol", "byCategory") |

## Architecture

```
RealizedGainsComponent/
├── index.jsx                    # Main component
├── RealizedGainsHandler.jsx     # Business logic
├── RealizedGainsComponent.css   # Styling
└── README.md                    # Documentation
```

## Data Flow

1. User clicks one of the chart type buttons
2. Component validates required data for the selected chart type
3. Appropriate formatter function processes the data
4. SankeyChart renders the formatted data with interactive features
5. User can switch between chart types or close the current view

## Chart Data Processing

### Overview Chart
- Uses `formatRealizedGainsDataForSankeyChart(totals)`
- Creates nodes for interests, dividends, realized gains, and total
- Shows flow from individual categories to total

### By Symbol Chart
- Uses `formatRealizedGainsDataForSankeyChartBySymbol(sectionsData)`
- Creates nodes for each symbol and total
- Shows contribution of each symbol to total performance

### By Category Chart
- Uses `formatRealizedGainsDataForSankeyChartByCategory(sectionsData)`
- Creates hierarchical flow: symbols → categories → total
- Most detailed view showing complete data relationships

## Error Handling

- **Data Validation**: Checks for required data before processing
- **Chart Type Validation**: Ensures valid chart type selection
- **User-friendly Messages**: Clear error descriptions
- **Graceful Fallbacks**: Disabled states for missing data
- **Console Logging**: Detailed error information for debugging

## Styling Features

The component includes comprehensive CSS with:
- **Modern Gradient Buttons**: Eye-catching call-to-action buttons
- **Active States**: Visual feedback for selected chart type
- **Smooth Animations**: Slide-in effects and hover transitions
- **Interactive Legend**: Color-coded data category indicators
- **Loading Indicators**: Spinner animations during data processing
- **Responsive Breakpoints**: Mobile and tablet optimizations
- **Accessibility Support**: Focus states and high contrast mode

## Interactive Features

- **Button States**: Active, hover, disabled, and loading states
- **Chart Switching**: Seamless transitions between chart types
- **Close Functionality**: Easy chart dismissal
- **Error Dismissal**: User-controlled error state management
- **Tooltip Integration**: Built-in SankeyChart tooltips

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus indicators for interactive elements
- Semantic HTML structure

## Performance Considerations

- Efficient data processing with memoized calculations
- Lazy chart rendering (only when requested)
- Optimized CSS animations
- Minimal re-renders through proper state management