import React, { useState } from 'react';
import CSVReader from 'react-csv-reader';

function Parser(props) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Utility function to convert string to camelCase
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  };

  const headersAndValues = (headers, values) => {
    let result = {}
    headers.forEach((e, i) => result[toCamelCase(e)] = values[i])
    return result
  }

  const skipRow = (section, obj) => {
    if (["Dividends","Withholding Tax","Fees", "Deposits & Withdrawals", "Forex P/L Details", "Change in Dividend Accruals"].includes(section)) {
      return !obj?.date
    } else if (section === "Realized & Unrealized Performance Summary") {
      return !obj?.assetCategory
    } else {
      return false
    }
  }

  const handleCSVLoad = (data, fileInfo) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = {};
      let sectionsData = Object.groupBy(data, (element) => { return element[0] } )
      let sectionNames = Object.keys(sectionsData)

      sectionNames.forEach(sectionName => {
        const [headers, ...values] = sectionsData[sectionName]
        const headerSectionNames = headers.slice(2, headers.length)
        const relevantValues = values.filter((e) => e[1] === "Data" )
        let sectionParsedData = []

        relevantValues.forEach((rv) => {
          let r = rv.slice(2, rv.length)
          let obj = headersAndValues(headerSectionNames, r)

          if (!skipRow(sectionName, obj)){
            sectionParsedData.push(obj)
          }
        })

        result[toCamelCase(sectionName)] = sectionParsedData
      });

      props.setResult(result);
    } catch (err) {
      setError('Error parsing CSV file: ' + err.message);
      props.setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error) => {
    setError('Error reading file: ' + error);
    props.setResult(null);
    setIsLoading(false);
  };

  return (
    <div className="file-upload">
      <CSVReader
        onFileLoaded={handleCSVLoad}
        onError={handleError}
        parserOptions={{
          skipEmptyLines: true,
          dynamicTyping: false,
        }}
        inputId="csvInput"
        inputStyle={{
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      {isLoading && <span>Processing...</span>}
      {error && (
        <div className="error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default Parser;