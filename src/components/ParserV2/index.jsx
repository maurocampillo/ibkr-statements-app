import { useState } from 'react';
import CSVReader from 'react-csv-reader';

import { useDataStore } from '../../store/DataStoreContext.tsx';

function ParserV2() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setRawData } = useDataStore();

  // Utility function to convert string to camelCase
  const toCamelCase = str => {
    return str
      .replace(/[()]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  };

  // Parse IBKR date format (YYYYMMDD) to Date object
  const parseIBKRDate = dateInt => {
    if (!dateInt || dateInt === '' || dateInt === '0') {
      return null;
    }

    const dateStr = dateInt.toString();
    if (dateStr.length !== 8) {
      return null;
    }

    try {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-indexed
      const day = parseInt(dateStr.substring(6, 8));

      // Validate the date components
      if (year < 1900 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
        return null;
      }

      return new Date(year, month, day);
    } catch (error) {
      return null;
    }
  };

  // Convert array row to object using headers with automatic date parsing
  const rowToObject = (headers, values) => {
    const result = {};
    headers.forEach((header, index) => {
      const camelCaseKey = toCamelCase(header);
      const rawValue = values[index] || '';

      // Check if this field contains 'date' and try to parse it as a date
      if (header.toLowerCase().includes('date') && rawValue) {
        const parsedDate = parseIBKRDate(rawValue);
        result[camelCaseKey] = parsedDate || rawValue; // fallback to original value if parsing fails
      } else {
        result[camelCaseKey] = rawValue;
      }
    });
    return result;
  };

  const parseCSVSections = csvData => {
    const sections = {};
    let currentSection = null;
    let currentHeaders = [];
    let currentData = [];
    let i = 0;

    // Skip BOF line if present
    if (csvData[0] && csvData[0][0] === 'BOF') {
      i = 1;
    }

    // Skip BOA line if present (there's typically only one at the beginning)
    if (csvData[i] && csvData[i][0] === 'BOA') {
      i++;
    }

    while (i < csvData.length) {
      const row = csvData[i];

      if (!row || row.length === 0) {
        i++;
        continue;
      }

      const firstColumn = row[0];

      // Section definition (BOS) - this starts a new section
      if (firstColumn === 'BOS') {
        // Save previous section if it exists
        if (currentSection && currentHeaders.length > 0) {
          sections[currentSection.key] = {
            sectionName: currentSection.name,
            sectionData: currentData.map(dataRow => rowToObject(currentHeaders, dataRow))
          };
        }

        // Start new section
        const sectionName = row[2] || 'Unknown Section';
        const sectionKey = toCamelCase(sectionName);

        currentSection = {
          name: sectionName,
          key: sectionKey
        };

        // Next line should contain headers
        i++;
        if (i < csvData.length) {
          currentHeaders = csvData[i];
          currentData = [];
        }
        i++;
        continue;
      }

      // Regular data row - but skip control markers
      if (currentSection && currentHeaders.length > 0) {
        // Skip control markers: BOF, BOA, BOS, EOA, EOS, EOF
        const controlMarkers = ['BOF', 'BOA', 'BOS', 'EOA', 'EOS', 'EOF'];
        if (!controlMarkers.includes(firstColumn)) {
          currentData.push(row);
        }
      }

      i++;
    }

    // Don't forget the last section
    if (currentSection && currentHeaders.length > 0) {
      sections[currentSection.key] = {
        sectionName: currentSection.name,
        sectionData: currentData.map(dataRow => rowToObject(currentHeaders, dataRow))
      };
    }

    return sections;
  };

  const handleCSVLoad = data => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse the multi-section CSV
      const parsedSections = parseCSVSections(data);

      // Store the parsed data in DataStore
      setRawData(parsedSections);
    } catch (err) {
      setError('Failed to parse CSV file. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVError = () => {
    setError('Error reading CSV file. Please try again.');
    setIsLoading(false);
  };

  return (
    <div className='parser-v2'>
      <h3>CSV Parser V2</h3>

      {error && (
        <div className='error-message' style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      {isLoading && (
        <div className='loading-message' style={{ color: 'blue', marginBottom: '10px' }}>
          Processing CSV file...
        </div>
      )}

      <CSVReader
        onFileLoaded={handleCSVLoad}
        onError={handleCSVError}
        inputStyle={{ marginBottom: '10px' }}
        label='Select CSV file to parse'
        parserOptions={{
          quotes: true,
          skipEmptyLines: true,
          dynamicTyping: true
        }}
      />
    </div>
  );
}

export default ParserV2;
