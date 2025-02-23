// src/App.js
import React, { useState } from 'react';
import CSVReader from 'react-csv-reader';
import { ResponsiveLine } from '@nivo/line';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Utility function to convert string to camelCase
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  };

  // Format data for Nivo Line chart
  const formatDataForNivo = (data) => {
    const lineData = {
      id: 'Dividends',
      data: data.map(item => ({
        x: item.date, // Date for x-axis
        y: parseFloat(item.amount) // Convert amount to number for y-axis
      }))
    };
    return [lineData];
  };

  const headersAndValues = (headers, values) => {
    let result = {}    
    headers.forEach((e, i) => result[toCamelCase(e)] = values[i])    
    return result
  }  

  const skipRow = (section, obj) => {
    if (["Dividends","Withholding Tax","Fees", "Deposits & Withdrawals", "Forex P/L Details", "Change in Dividend Accruals"].includes(section)) {
      return !obj?.date
    } else if (section == "Realized & Unrealized Performance Summary") {
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
      let currentSection = null;      
      let sectionsData = Object.groupBy(data, (element) => { return element[0] } )
      let sectionNames = Object.keys(sectionsData)

      sectionNames.forEach(sectionName => {        
        const [headers, ...values] = sectionsData[sectionName]
        const headerSectionNames = headers.slice(2, headers.length)
        const relevantValues = values.filter((e) => e[1] == "Data" )
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

      setResult(result);
    } catch (err) {
      setError('Error parsing CSV file: ' + err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error) => {
    setError('Error reading file: ' + error);
    setResult(null);
    setIsLoading(false);
  };

  const handleButtonClick = () => {
    const data = formatDataForNivo(result.dividends)
    console.log(data)
    setChartData(data);
    setShowChart(true);
  };

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
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
      </div>

      <button onClick={handleButtonClick}>Dividends</button>

      {showChart && (
              <div style={{ height: '400px', width: '800px', marginTop: '20px' }}>
                <ResponsiveLine
                  data={chartData}
                  margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                  xScale={{
                    type: 'time',
                    format: '%Y-%m-%d',
                    useUTC: false,
                    precision: 'day'
                  }}
                  xFormat="time:%Y-%m-%d"
                  yScale={{
                    type: 'linear',
                    min: 0,
                    max: 'auto',
                    stacked: false,
                    reverse: false
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    format: '%Y-%m-%d',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Date',
                    legendOffset: 36,
                    legendPosition: 'middle'
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Amount',
                    legendOffset: -40,
                    legendPosition: 'middle'
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabel="y"
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
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                />
              </div>
            )}

      {error && (
        <div className="error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result">
          <h3>Parsed Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;