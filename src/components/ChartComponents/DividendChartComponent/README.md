# DividendChartComponent

A comprehensive React component that wraps LineChart with integrated business logic for displaying dividend income data over time.

## Features

- **Integrated Button**: Built-in button to trigger chart display
- **Stats Preview**: Quick overview of dividend statistics before viewing chart
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Visual feedback during data processing
- **Data Insights**: Calculated metrics like averages and diversification
- **Responsive Design**: Mobile-friendly layout and interactions
- **Custom Styling**: Component-specific CSS with modern design
- **Accessibility**: ARIA labels and keyboard navigation support

## Usage

```jsx
import DividendChartComponent from './components/ChartComponents/DividendChartComponent';

<DividendChartComponent
  sectionsData={sectionsData}
  buttonText='Dividends'
  className='custom-dividend-chart'
  showButton={true}
  autoShow={false}
/>;
```

## Props

| Prop           | Type    | Default     | Description                                      |
| -------------- | ------- | ----------- | ------------------------------------------------ |
| `sectionsData` | Object  | -           | Object containing dividends array                |
| `buttonText`   | String  | "Dividends" | Text displayed on the trigger button             |
| `className`    | String  | ""          | Additional CSS class for the component           |
| `showButton`   | Boolean | true        | Whether to show the trigger button               |
| `autoShow`     | Boolean | false       | Whether to automatically show the chart on mount |

## Architecture

```
DividendChartComponent/
├── index.jsx                    # Main component
├── DividendChartHandler.jsx     # Business logic
├── DividendChartComponent.css   # Styling
└── README.md                    # Documentation
```

## Data Flow

1. Component validates dividend data availability
2. User sees stats preview with key metrics
3. User clicks "Dividends" button to view chart
4. `formatDividendDataForLineChart` processes the data by month
5. LineChart renders the formatted data with interactive features
6. User can close the chart or view additional insights

## Stats Preview

The component displays a helpful stats preview showing:

- **Total Amount**: Sum of all dividend payments
- **Payment Count**: Number of dividend transactions
- **Symbol Count**: Number of unique dividend-paying symbols
- **Date Range**: Period covered by dividend data

## Chart Data Processing

### Data Formatting

- Uses `formatDividendDataForLineChart(dividends)`
- Groups dividends by month using `formatDate` utility
- Aggregates amounts for each month
- Sorts data chronologically for proper line chart display

### Date Handling

- Converts dates to "MMM YYYY" format (e.g., "Jan 2024")
- Groups multiple dividends in the same month
- Maintains chronological order for trend visualization

## Error Handling

- **Data Validation**: Checks for dividends array existence and length
- **Type Checking**: Ensures dividends is an array
- **Empty State**: Handles cases with no dividend data
- **User-friendly Messages**: Clear error descriptions
- **Graceful Fallbacks**: Disabled states for missing data
- **Console Logging**: Detailed error information for debugging

## Calculated Insights

The component automatically calculates and displays:

- **Average per Payment**: Total amount divided by payment count
- **Diversification**: Number of unique dividend-paying symbols
- **Date Range**: Earliest to latest dividend payment dates

## Styling Features

The component includes comprehensive CSS with:

- **Modern Gradient Button**: Green-to-teal gradient for positive financial theme
- **Stats Grid**: Responsive grid layout for key metrics
- **Hover Effects**: Interactive elements with smooth transitions
- **Loading Indicators**: Spinner animations during data processing
- **Responsive Breakpoints**: Mobile and tablet optimizations
- **Accessibility Support**: Focus states and high contrast mode

## Interactive Features

- **Button States**: Hover, disabled, and loading states
- **Stats Hover**: Interactive stat items with visual feedback
- **Chart Toggle**: Easy chart show/hide functionality
- **Error Dismissal**: User-controlled error state management
- **Responsive Layout**: Adaptive grid for different screen sizes

## Data Requirements

### Expected Data Structure

```javascript
sectionsData: {
  dividends: [
    {
      date: '2024-01-15',
      amount: '25.50',
      symbol: 'AAPL'
    }
    // ... more dividend entries
  ];
}
```

### Validation Rules

- `sectionsData` must be an object
- `dividends` must be an array
- Array must not be empty
- Each dividend should have `date`, `amount`, and `symbol` properties

## Performance Considerations

- Efficient data processing with memoized calculations
- Lazy chart rendering (only when requested)
- Optimized CSS animations
- Minimal re-renders through proper state management
- Smart data validation to prevent unnecessary processing

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus indicators for interactive elements
- Semantic HTML structure
- Descriptive button text and error messages

## Mobile Optimization

- Responsive grid layout for stats
- Touch-friendly button sizes
- Optimized spacing for small screens
- Readable typography at all sizes
- Efficient use of screen real estate

## Integration Benefits

- **Self-contained**: No external state dependencies
- **Reusable**: Can be used in multiple contexts
- **Maintainable**: Clear separation of concerns
- **Testable**: Isolated component logic
- **Consistent**: Follows established component patterns
