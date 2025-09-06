module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'none',
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Line length
  printWidth: 100,
  
  // JSX specific
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Other
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  
  // File overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80
      }
    },
    {
      files: '*.css',
      options: {
        singleQuote: false
      }
    }
  ]
};