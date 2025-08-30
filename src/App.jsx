// src/App.js
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Parser from './components/Parser';
import utils from './utils/parsing';
import DividendLineChart from './components/Chart/DividendLineChart';
import SankeyChart from './components/Chart/SankeyChart';
import CalendarChart from './components/Chart/CalendarChart';
import './App.css';
import _ from 'lodash';

function App() {
  const [sectionsData, setSectionsData] = useState(null);
  const [trades, setTrades] = useState(null);
  const [totals, setTotals] = useState(null);
  const [showChart, setShowChart] = useState(undefined)
  const [chartData, setChartData] = useState([]);

  // Format data for Nivo Line chart, TODO: Move to utils
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
  }

  const formatDividendDataForLineChart = (data) => {
    let groupedData = Object.groupBy(data, (d) => formatDate(d.date))
    const lineData = {
      id: 'Dividends',
      data: Object.keys(groupedData).map(keyDate => ({
        x: keyDate, // Date for x-axis
        y: groupedData[keyDate].map((e) => parseFloat(e.amount)).reduce((a,b) => a + b, 0),
        id: formatDate(keyDate), // Date for x-axis
      })).sort((a, b) => new Date(a.x) - new Date(b.x))
    };
    console.log("lineData", lineData)
    return [lineData];
  };

  // Format data for Nivo Line chart
  const formatRealizedGainsDataForSankeyChart = (data) => {
    return {
      "nodes": [
        {
          "id": "interests",
          "nodeColor": "hsl(56, 70%, 50%)"
        },
        {
          "id": "dividends",
          "nodeColor": "hsl(124, 70%, 50%)"
        },
        {
          "id": "realizedGainsFromTrades",
          "nodeColor": "hsl(356, 70%, 50%)"
        },
        {
          "id": "total",
          "nodeColor": "hsl(255, 70%, 50%)"
        },
      ],
      "links": [
        {
          "source": "interests",
          "target": "total",
          "value":  parseFloat(data.interest),
        },
        {
          "source": "dividends",
          "target": "total",
          "value": parseFloat(data.dividends),
        },
        {
          "source": "realizedGainsFromTrades",
          "target": "total",
          "value":  parseFloat(data.realizedUnrealizedPerformanceSummary.total.realizedTotal),
        },
      ]
    }
  };

  const formatRealizedGainsDataForSankeyChartBySymbol = () => {
    const data = utils.computeRealizedGainsForSankey(sectionsData)    
    const arrayForSankey = _.sortBy(Object.values(data), ["symbol"])
    const nodes = arrayForSankey.map((d) => {
      return { "id": d.symbol }
    })
    const links = arrayForSankey.map((d) => {
      return {"source": d.symbol, "value": d.total, "target": "total" }
    })
    return {
      "nodes": nodes.concat({ "id": "total" }),
      "links": links,
    }
  }

  const formatRealizedGainsDataForSankeyChartByCategory = () => {
    const {realizedGains, dividends, total} = utils.computeRealizedGainsByCategoryForSankey(sectionsData)
    
    const realizedGainsArrayForSankey = _.sortBy(Object.values(realizedGains), ["symbol"])
    
    const dividendsArrayForSankey = _.sortBy(Object.values(dividends), ["symbol"])
    
    const realizedGainsNodes = realizedGainsArrayForSankey.map((d) => {
      return { "id": d.symbol }
    }).concat({ "id": "realizedGains" })
    
    const realizedNodes = dividendsArrayForSankey.map((d) => {
      return { "id": d.symbol }
    }).concat({ "id": "dividends" })
    
    const totalNodes = [ { "id": "total" } ]

    
    const realizedGainsLinks = realizedGainsArrayForSankey.map((d) => {
      return {"source": d.symbol, "value": d.total, "target": "realizedGains" }
    })
    const dividendsLinks = dividendsArrayForSankey.map((d) => {
      return {"source": d.symbol, "value": d.total, "target": "dividends" }
    })
    
    const totalLinks = [ 
        {"source": "realizedGains", "value": Object.values(realizedGains).reduce((a,b) => a + b.total, 0), "target": "total" },
        {"source": "dividends", "value": Object.values(dividends).reduce((a,b) => a + b.total, 0), "target": "total" },
    ]
    
    const res = { 
      "nodes": realizedGainsNodes.concat(realizedNodes).concat(totalNodes),
      "links": realizedGainsLinks.concat(dividendsLinks).concat(totalLinks),
    }

    return res
  }

  const formatCalendarChartData = (trades, dividends) => {
    if (!trades || !trades.length) {
      return {};
    }

    // Initialize result object with all months
    const result = {
      "1": { value: 0 },
      "2": { value: 0 },
      "3": { value: 0 },
      "4": { value: 0 },
      "5": { value: 0 },
      "6": { value: 0 },
      "7": { value: 0 },
      "8": { value: 0 },
      "9": { value: 0 },
      "10": { value: 0 },
      "11": { value: 0 },
      "12": { value: 0  }
    };

    // Process each trade
    trades.forEach(trade => {
      if (trade.datetime && trade.realizedPl) {
        // Extract month from dateTime (format: "2025-01-03, 11:08:24")
        const month = parseInt(trade.datetime.split('-')[1]);
        if (month >= 1 && month <= 12) {
          result[month].value += trade.realizedPl;
        }
      }
    });

    dividends.forEach(dividend => {
      const month = parseInt(dividend.date.split('-')[1]);
      if (month >= 1 && month <= 12) {
        result[month].value += parseFloat(dividend.amount);
      }
    });
    
    // Round values to 2 decimal places
    Object.keys(result).forEach(month => {      
      result[month].value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
        .format(Math.round(result[month].value * 100) / 100);
    });

    return result;
  }

  const handleDividendsClick = () => {
    const data = formatDividendDataForLineChart(sectionsData.dividends)
    setChartData(data);
    setShowChart("dividendsLineChart");
  };

  const handleRealizedGainsClick = () => {
    const data = formatRealizedGainsDataForSankeyChart(totals)
    setChartData(data);
    setShowChart("realizedGainsSankeyCart");
  };

  const handleRealizedGainsBySymbolClick = () => {
    const data = formatRealizedGainsDataForSankeyChartBySymbol(totals)
    setChartData(data);
    setShowChart("realizedGainsSankeyCartBySymbol");
  }

  const handleRealizedGainsByCategoryClick = () => {
    const data = formatRealizedGainsDataForSankeyChartByCategory(totals)
    setChartData(data);
    setShowChart("realizedGainsSankeyCartByCategory");
  }

  const handleCalendarChartClick = () => {
    const data = formatCalendarChartData(trades, sectionsData.dividends)
    setChartData(data);
    setShowChart("calendarChart");
  }

  return (
    <div className="App">
      <h1>Client-Side CSV Parser</h1>
      
      <Parser setSectionsData={setSectionsData} setTotals={setTotals} setTrades={setTrades} />

      <button onClick={handleDividendsClick}>Dividends</button>
      <button onClick={handleRealizedGainsClick}>Realized Gains</button>
      <button onClick={handleRealizedGainsBySymbolClick}>Realized Gains by Symbol</button>
      <button onClick={handleRealizedGainsByCategoryClick}>Realized Gains by Category / Symbol</button>
      <button onClick={handleCalendarChartClick}>Calendar Chart</button>

      {showChart === "dividendsLineChart" && (
        <DividendLineChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCart" && (
        <SankeyChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCartBySymbol" && (
        <SankeyChart chartData={chartData}/>
      )}

      {showChart === "realizedGainsSankeyCartByCategory" && (
        <SankeyChart chartData={chartData}/>
      )}

      {showChart === "calendarChart" && (
        <CalendarChart 
          data={chartData}
          defaultBoxColor="#f5f5f5"
          boxBorderColor="#cccccc"
          rowCount={3}
        />
      )}

      {sectionsData && (
        <div className="result">
          <h3>Parsed Sections Data:</h3>          
          <ReactJson src={trades}/>
        </div>
      )}
    </div>
  );
}

export default App;