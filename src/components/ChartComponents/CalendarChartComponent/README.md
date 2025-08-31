# CalendarChartComponent

A self-contained React component that wraps the CalendarChart with integrated business logic, styling, and user interactions.

## Features

- **Integrated Button**: Built-in button to trigger chart display
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Visual feedback during data processing
- **Responsive Design**: Mobile-friendly layout and interactions
- **Custom Styling**: Component-specific CSS with modern design
- **Accessibility**: ARIA labels and keyboard navigation support

## Usage

```jsx
import CalendarChartComponent from './components/ChartComponents/CalendarChartComponent';

<CalendarChartComponent 
  dateData={trades}
  sectionsData={sectionsData}
  buttonText="Calendar Chart"
  defaultBoxColor="#f5f5f5"
  boxBorderColor="#cccccc"
  rowCount={3}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dateData` | Array | - | Array of date-based data objects (e.g., trades) |
| `sectionsData` | Object | - | Object containing dividends array |
| `buttonText` | String | "Calendar Chart" | Text displayed on the trigger button |
| `defaultBoxColor` | String | "#f5f5f5" | Default background color for calendar boxes |
| `boxBorderColor` | String | "#cccccc" | Border color for calendar boxes |
| `rowCount` | Number | 3 | Number of rows to display (1, 2, 3, 4, 6, or 12) |
| `className` | String | "" | Additional CSS class for the component |
| `showButton` | Boolean | true | Whether to show the trigger button |
| `autoShow` | Boolean | false | Whether to automatically show the chart on mount |

## Architecture

```
CalendarChartComponent/
├── index.jsx                    # Main component
├── CalendarChartHandler.jsx     # Business logic
├── CalendarChartComponent.css   # Styling
└── README.md                    # Documentation
```

## Data Flow

1. User clicks "Calendar Chart" button
2. Component validates required data (dateData, dividends)
3. `formatCalendarChartData` processes the data by month
4. CalendarChart renders the formatted data
5. User can close the chart or view different configurations

## Error Handling

- Missing data validation (dateData and dividends)
- User-friendly error messages
- Graceful fallbacks for invalid data
- Console logging for debugging

## Styling

The component includes comprehensive CSS with:
- Modern gradient buttons
- Smooth animations and transitions
- Responsive breakpoints
- Loading indicators
- Error state styling
- Accessibility considerations