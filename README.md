# IBKR Statements App

This project is a React application for parsing and visualizing Interactive Brokers (IBKR) statement data. It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

- Node.js (version 18.19.0 or higher)
- Yarn package manager

## Available Scripts

In the project directory, you can run:

### Development Commands

#### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### Build Commands

#### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

#### `yarn build:ci`

Builds the app for CI environments with `CI=false` to avoid treating warnings as errors.

### Code Quality Commands

#### `yarn format`

Formats all JavaScript, JSX, CSS, and Markdown files using Prettier.

#### `yarn format:check`

Checks if all files are properly formatted without making changes.

#### `yarn lint`

Runs ESLint to check for code quality issues and potential errors.

#### `yarn lint:fix`

Runs ESLint with auto-fix to resolve fixable issues automatically.

#### `yarn code-quality`

Runs both linting and format checking (for CI/validation).

#### `yarn code-quality:fix`

Runs both linting with auto-fix and formatting (for development).

#### `yarn deps:check`

Checks for unused dependencies in the project.

### Alternative: npm Commands

If you prefer using npm instead of yarn, you can use:

- `npm start` instead of `yarn start`
- `npm test` instead of `yarn test`
- `npm run build` instead of `yarn build`
- `npm run format` instead of `yarn format`
- etc.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Features

### IBKR CSV Parser

This application includes a sophisticated CSV parser specifically designed for Interactive Brokers statement files:

- **Multi-section parsing**: Automatically detects and parses multiple CSV sections within a single file
- **Control marker filtering**: Filters out IBKR control markers (BOF, BOA, BOS, EOA, EOS, EOF)
- **Automatic date parsing**: Converts IBKR date integers (YYYYMMDD) to JavaScript Date objects
- **CamelCase conversion**: Transforms header names to camelCase for consistent JavaScript usage
- **Error handling**: Robust error handling with user-friendly feedback

### Supported IBKR Sections

The parser can handle various IBKR statement sections including:

- Realized & Unrealized Performance Summary
- Cash Report
- Statement of Funds
- Position Reports
- Net Stock Position Summary
- Trades
- Dividend Accruals
- And more...

### Chart Components

The application provides various visualization components for financial data analysis:

- Calendar charts for dividend tracking
- Realized gains analysis
- Performance summaries
- Interactive data exploration

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
