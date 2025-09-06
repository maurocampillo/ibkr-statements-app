import { useState } from 'react';
import CSVReader from 'react-csv-reader';
// import _ from 'lodash';

function Parser(props) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Utility function to convert string to camelCase
  const toCamelCase = str => {
    return str
      .replace(/[()]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  };

  const rowToObject = (headers, values) => {
    const result = {};
    headers.forEach((e, i) => (result[toCamelCase(e)] = values[i]));
    return result;
  };

  const skipFromResults = (section, obj) => {
    if (
      [
        'Dividends',
        'Withholding Tax',
        'Fees',
        'Deposits & Withdrawals',
        'Change in Dividend Accruals'
      ].includes(section)
    ) {
      return !obj?.date;
    } else if (section === 'Realized & Unrealized Performance Summary') {
      return !obj?.assetCategory;
    } else if (section === 'Forex P/L Details') {
      return !obj?.dateTime;
    } else {
      return false;
    }
  };

  const generateTrades = (sectionName, headers, values) => {
    // Return empty if not trades data
    if (sectionName !== 'Trades') {
      return [];
    }

    // Get the index of the "Header" column
    const headerIndex = headers.indexOf('Header');
    // Process each row and return array of trade objects
    return values.reduce((trades, row) => {
      // Skip if not a "Data" row
      if (row[headerIndex] !== 'Data') {
        return trades;
      }

      const tradeObject = {};
      headers.forEach((header, index) => {
        const value = row[index];

        // Handle numeric fields
        if (
          ['Quantity', 'T. Price', 'Proceeds', 'Comm/Fee', 'Basis', 'Realized P/L'].includes(header)
        ) {
          // Remove commas from numbers and convert to float
          const numericValue = value ? parseFloat(value.replace(/,/g, '')) : null;
          // Convert the header to camelCase
          const fieldName = header
            .toLowerCase()
            .replace(/[/.]/g, '') // Remove dots and slashes
            .replace(/\s+(.)/g, (match, group1) => group1.toUpperCase());
          tradeObject[fieldName] = !isNaN(numericValue) ? numericValue : null;
        } else {
          // Convert the header to camelCase
          const fieldName = header
            .toLowerCase()
            .replace(/[/.]/g, '') // Remove dots and slashes
            .replace(/\s+(.)/g, (match, group1) => group1.toUpperCase());
          tradeObject[fieldName] = value || null;
        }
      });

      trades.push(tradeObject);
      return trades;
    }, []);
  };

  const generateSectionTotals = (section, headerSectionNames, values) => {
    if (
      [
        'Deposits & Withdrawals',
        'Dividends',
        'Interest',
        'Withholding Tax',
        'Change in Dividend Accruals'
      ].includes(section)
    ) {
      // Generic total extraction for sections which contains the total as last row element
      return values
        .at(-1)
        .filter(v => v !== '')
        .at(-1);
    } else if (section === 'Realized & Unrealized Performance Summary') {
      // Special case for Realized & Unrealized Performance Summary
      const totals = {};
      values.reduce((accum, elem, index) => {
        const obj = rowToObject(headerSectionNames, elem.slice(2, elem.length));
        if (obj.assetCategory === 'Total') {
          const previousAssetCategory = toCamelCase(values[index - 1][2]);
          accum[previousAssetCategory] = obj;
        } else if (obj.assetCategory === 'Total (All Assets)') {
          accum['total'] = obj;
        }
        return accum;
      }, totals);
      return totals;
    } else {
      console.log('Unknown totals for section: ', section);
    }
  };

  const handleCSVLoad = (data, fileInfo) => {
    setIsLoading(true);
    setError(null);
    const totals = {};
    try {
      const result = {};
      const sectionsData = Object.groupBy(data, element => {
        return element[0];
      });
      const sectionNames = Object.keys(sectionsData);

      sectionNames.forEach(sectionName => {
        const [headers, ...values] = sectionsData[sectionName];
        if (sectionName === 'Trades') {
          // Process the trades data
          const generatedTrades = generateTrades(sectionName, headers, values);
          props.setTrades(generatedTrades);
        } else {
          // Process the other sections data
          const headerSectionNames = headers.slice(2, headers.length);
          const camelCasedSectionName = toCamelCase(sectionName);
          const sectionParsedData = [];
          const sectionTotals = generateSectionTotals(sectionName, headerSectionNames, values);

          if (sectionTotals) {
            totals[camelCasedSectionName] = sectionTotals;
          }
          values.forEach((rv, index) => {
            const r = rv.slice(2, rv.length);
            const obj = rowToObject(headerSectionNames, r);

            if (!skipFromResults(sectionName, obj)) {
              sectionParsedData.push(obj);
            }
          });

          result[camelCasedSectionName] = sectionParsedData;
        }
      });
      props.setTotals(totals);
      props.setSectionsData(result);
    } catch (err) {
      setError('Error parsing CSV file: ' + err.message);
      props.setSectionsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = error => {
    setError('Error reading file: ' + error);
    props.setSectionsData(null);
    setIsLoading(false);
  };

  return (
    <div className='file-upload'>
      <CSVReader
        onFileLoaded={handleCSVLoad}
        onError={handleError}
        parserOptions={{
          skipEmptyLines: true,
          dynamicTyping: false
        }}
        inputId='csvInput'
        inputStyle={{
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}
      />
      {isLoading && <span>Processing...</span>}
      {error && (
        <div className='error'>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default Parser;
