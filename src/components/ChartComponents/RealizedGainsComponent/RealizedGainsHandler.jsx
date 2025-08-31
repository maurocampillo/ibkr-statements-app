import utils from '../../../utils/parsing';
import _ from 'lodash';

// Format data for Nivo Sankey chart
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

const formatRealizedGainsDataForSankeyChartBySymbol = (sectionsData) => {
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

const formatRealizedGainsDataForSankeyChartByCategory = (sectionsData) => {
  const {realizedGains, dividends} = utils.computeRealizedGainsByCategoryForSankey(sectionsData)
  
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

const handleRealizedGainsClick = (totals, setChartData, setShowChart) => {
  const data = formatRealizedGainsDataForSankeyChart(totals)
  setChartData(data);
  setShowChart("realizedGainsSankeyCart");
};

const handleRealizedGainsBySymbolClick = (sectionsData, setChartData, setShowChart) => {
  const data = formatRealizedGainsDataForSankeyChartBySymbol(sectionsData)
  setChartData(data);
  setShowChart("realizedGainsSankeyCartBySymbol");
}

const handleRealizedGainsByCategoryClick = (sectionsData, setChartData, setShowChart) => {
  const data = formatRealizedGainsDataForSankeyChartByCategory(sectionsData)
  setChartData(data);
  setShowChart("realizedGainsSankeyCartByCategory");
}

/**
 * Extracts the top N sources by aggregated value from chart data links
 * @param {Array} links - Array of link objects with source, target, and value properties
 * @param {number} topN - Number of top sources to return (default: 10)
 * @returns {Array} Array of individual link elements for the top N sources by aggregated value
 */
const getTopSourcesByAggregatedValue = (links, topN = 10) => {
  if (!links || !Array.isArray(links)) {
    return [];
  }

  // Filter out links that go to "total" as these are aggregation links, not source data
  const sourceLinks = links.filter(link => 
    link.target !== 'total' && 
    link.source && 
    typeof link.value === 'number'
  );

  // Group by source and calculate total value for each source
  const sourceAggregates = {};
  sourceLinks.forEach(link => {
    if (!sourceAggregates[link.source]) {
      sourceAggregates[link.source] = {
        totalValue: 0,
        elements: []
      };
    }
    sourceAggregates[link.source].totalValue += link.value;
    sourceAggregates[link.source].elements.push(link);
  });

  // Sort sources by total aggregated value (descending)
  const sortedSources = Object.entries(sourceAggregates)
    .sort(([, a], [, b]) => b.totalValue - a.totalValue)
    .slice(0, topN);

  // Return all individual elements for the top N sources
  const topSourceElements = [];
  sortedSources.forEach(([source, data]) => {
    topSourceElements.push(...data.elements);
  });

  return topSourceElements;
};

export {
  handleRealizedGainsClick,
  handleRealizedGainsBySymbolClick,
  handleRealizedGainsByCategoryClick,
  formatRealizedGainsDataForSankeyChart,
  formatRealizedGainsDataForSankeyChartBySymbol,
  formatRealizedGainsDataForSankeyChartByCategory,
  getTopSourcesByAggregatedValue
};
