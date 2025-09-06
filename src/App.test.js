import { render, screen } from '@testing-library/react';

import App from './App';

// Mock the useTheme hook to avoid browser API issues in tests
jest.mock('./hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    switchToLight: jest.fn(),
    switchToDark: jest.fn(),
    switchToHighContrast: jest.fn(),
    toggleTheme: jest.fn(),
    themeInfo: {
      light: { label: 'Light', icon: '☀️' },
      dark: { label: 'Dark', icon: '🌙' },
      'high-contrast': { label: 'High Contrast', icon: '🔲' }
    }
  })
}));

// Mock the chart components to avoid ES module issues
jest.mock('./components/Chart/LineChart', () => {
  return function MockLineChart() {
    return <div data-testid='line-chart'>Line Chart</div>;
  };
});

jest.mock('./components/Chart/SankeyChart', () => {
  return function MockSankeyChart() {
    return <div data-testid='sankey-chart'>Sankey Chart</div>;
  };
});

jest.mock('./components/Chart/CalendarChart', () => {
  return function MockCalendarChart() {
    return <div data-testid='calendar-chart'>Calendar Chart</div>;
  };
});

test('renders CSV parser app', () => {
  render(<App />);
  const headerElement = screen.getByText(/Client-Side CSV Parser/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders dark mode toggle button', () => {
  render(<App />);
  const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
  expect(toggleButton).toBeInTheDocument();
});

test('app renders without crashing', () => {
  render(<App />);
  expect(screen.getByText(/Client-Side CSV Parser/i)).toBeInTheDocument();
});
