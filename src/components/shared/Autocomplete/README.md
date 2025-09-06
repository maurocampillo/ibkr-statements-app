# Autocomplete Component

A reusable, accessible autocomplete component with multi-selection capabilities, designed for filtering and selecting multiple options from a list.

## Features

### 🔍 **Core Functionality**

- **Real-time Search**: Type to filter options instantly
- **Multi-selection**: Select multiple options with visual tags
- **Keyboard Navigation**: Full keyboard accessibility (Arrow keys, Enter, Escape)
- **Click Selection**: Mouse-friendly option selection
- **Smart Filtering**: Case-insensitive substring matching

### 🎨 **User Experience**

- **Visual Feedback**: Selected options shown as removable tags
- **No Results State**: Helpful message when no matches found
- **Loading States**: Built-in support for loading/disabled states
- **Responsive Design**: Mobile-optimized with touch-friendly interactions
- **Smooth Animations**: Tag slide-in animations and transitions

### ♿ **Accessibility**

- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Focus Management**: Proper focus states and indicators
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast Mode**: Supports high contrast preferences

## Usage

### Basic Implementation

```jsx
import { Autocomplete } from '../../shared';

function MyComponent() {
  const [selectedSources, setSelectedSources] = useState([]);

  const options = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

  return (
    <Autocomplete
      options={options}
      selectedValues={selectedSources}
      onSelectionChange={setSelectedSources}
      placeholder='Search fruits...'
    />
  );
}
```

### Advanced Configuration

```jsx
<Autocomplete
  options={sourceOptions}
  selectedValues={selectedSources}
  onSelectionChange={handleSelectionChange}
  placeholder='Search and select sources...'
  className='my-custom-autocomplete'
  maxHeight={300}
  showSelectAll={true}
  showClearAll={true}
  disabled={isLoading}
  noResultsText='No sources found matching'
  searchIconText='🔍'
/>
```

## Props

| Prop                | Type       | Default                          | Description                                                        |
| ------------------- | ---------- | -------------------------------- | ------------------------------------------------------------------ |
| `options`           | `string[]` | `[]`                             | Array of available options to select from                          |
| `selectedValues`    | `string[]` | `[]`                             | Currently selected values                                          |
| `onSelectionChange` | `function` | **Required**                     | Callback when selection changes `(newSelection: string[]) => void` |
| `placeholder`       | `string`   | `"Search and select options..."` | Input placeholder text                                             |
| `className`         | `string`   | `""`                             | Additional CSS class for wrapper                                   |
| `disabled`          | `boolean`  | `false`                          | Disable the entire component                                       |
| `maxHeight`         | `number`   | `200`                            | Maximum height of dropdown in pixels                               |
| `showSelectAll`     | `boolean`  | `true`                           | Show "Select All" button                                           |
| `showClearAll`      | `boolean`  | `true`                           | Show "Clear All" button                                            |
| `noResultsText`     | `string`   | `"No options found matching"`    | Text shown when no search results                                  |
| `searchIconText`    | `string`   | `"🔍"`                           | Icon/text shown in search input                                    |

## Keyboard Shortcuts

| Key      | Action                         |
| -------- | ------------------------------ |
| `↓`      | Navigate down through options  |
| `↑`      | Navigate up through options    |
| `Enter`  | Select focused option          |
| `Escape` | Close dropdown and clear focus |
| `Tab`    | Standard tab navigation        |

## Styling

The component uses CSS modules with the following main classes:

- `.autocomplete-wrapper` - Main container
- `.autocomplete-input` - Search input field
- `.autocomplete-dropdown` - Options dropdown
- `.autocomplete-option` - Individual option
- `.selected-value-tag` - Selected value tags
- `.autocomplete-action-btn` - Select All/Clear All buttons

### Custom Styling Example

```css
.my-custom-autocomplete .autocomplete-input {
  border-color: #custom-color;
  border-radius: 12px;
}

.my-custom-autocomplete .selected-value-tag {
  background: linear-gradient(135deg, #custom1, #custom2);
}
```

## State Management

The component is controlled, meaning the parent component manages the selection state:

```jsx
const [selectedValues, setSelectedValues] = useState([]);

const handleSelectionChange = newSelection => {
  // Custom logic before updating state
  console.log('Selection changed:', newSelection);
  setSelectedValues(newSelection);
};
```

## Integration Examples

### With SankeyChart

```jsx
// In SankeyChart component
import { Autocomplete } from '../../shared';

function SankeyChartComponent({ chartData }) {
  const [selectedSources, setSelectedSources] = useState([]);

  const sourceOptions = useMemo(() => {
    if (!chartData?.links) return [];
    return [...new Set(chartData.links.map(link => link.source))].sort();
  }, [chartData]);

  return (
    <div>
      <Autocomplete
        options={sourceOptions}
        selectedValues={selectedSources}
        onSelectionChange={setSelectedSources}
        placeholder='Filter by source...'
      />
      {/* Chart rendering */}
    </div>
  );
}
```

### With API Data

```jsx
function DataFilterComponent() {
  const [options, setOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptions().then(data => {
      setOptions(data);
      setLoading(false);
    });
  }, []);

  return (
    <Autocomplete
      options={options}
      selectedValues={selectedValues}
      onSelectionChange={setSelectedValues}
      disabled={loading}
      placeholder={loading ? 'Loading options...' : 'Search options...'}
    />
  );
}
```

## Performance Considerations

- **Memoized Filtering**: Uses `useMemo` for efficient option filtering
- **Minimal Re-renders**: Optimized state updates and event handlers
- **Virtual Scrolling**: Consider implementing for very large option lists (1000+ items)
- **Debounced Search**: For API-based filtering, consider debouncing the search input

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Accessibility**: NVDA, JAWS, VoiceOver compatible

## Migration from Multiselect

If migrating from a checkbox-based multiselect:

```jsx
// Before (Multiselect)
{
  options.map(option => (
    <label key={option}>
      <input
        type='checkbox'
        checked={selected.includes(option)}
        onChange={() => handleToggle(option)}
      />
      {option}
    </label>
  ));
}

// After (Autocomplete)
<Autocomplete options={options} selectedValues={selected} onSelectionChange={setSelected} />;
```

## Contributing

When extending this component:

1. **Maintain Accessibility**: Ensure keyboard navigation and screen reader support
2. **Test Responsiveness**: Verify mobile and desktop experiences
3. **Performance**: Use memoization for expensive operations
4. **Styling**: Follow existing CSS patterns and naming conventions
5. **Documentation**: Update this README for new features

## Dependencies

- React 16.8+ (for hooks)
- PropTypes (for prop validation)
- CSS (no external styling dependencies)

The component is designed to be lightweight and dependency-free while providing a rich, accessible user experience.
