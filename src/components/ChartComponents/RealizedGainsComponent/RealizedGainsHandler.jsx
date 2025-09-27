import _ from 'lodash';

// Format data for Nivo Sankey chart
const formatRealizedGainsDataForSankeyChart = data => {
  let tradesTotal = 0;
  let dividendsTotal = 0;
  let interestsTotal = 0;
  // Process each trade
  data.trades.forEach(trade => {
    if (trade.reportdate && trade.fifopnlrealized) {
      tradesTotal += trade.fifopnlrealized;
    }
  });

  // Process each dividend
  data.dividends.forEach(dividend => {
    dividendsTotal += dividend.amount;
  });

  interestsTotal = data.cashReport.find(e => e.currencyprimary === 'BASE_SUMMARY')?.brokerinterest;

  return {
    nodes: [
      {
        id: 'interests',
        nodeColor: 'hsl(56, 70%, 50%)'
      },
      {
        id: 'dividends',
        nodeColor: 'hsl(124, 70%, 50%)'
      },
      {
        id: 'realizedGainsFromTrades',
        nodeColor: 'hsl(356, 70%, 50%)'
      },
      {
        id: 'total',
        nodeColor: 'hsl(255, 70%, 50%)'
      }
    ],
    links: [
      {
        source: 'interests',
        target: 'total',
        value: interestsTotal
      },
      {
        source: 'dividends',
        target: 'total',
        value: dividendsTotal
      },
      {
        source: 'realizedGainsFromTrades',
        target: 'total',
        value: tradesTotal
      }
    ]
  };
};

const formatRealizedGainsDataForSankeyChartBySymbol = data => {
  const totalBySymbol = {};

  data.trades.forEach(trade => {
    if (trade.reportdate && trade.fifopnlrealized) {
      totalBySymbol[trade.underlyingsymbol] =
        (totalBySymbol[trade.underlyingsymbol] || 0) + (trade.fifopnlrealized || 0);
    }
  });

  // Process each dividend
  data.dividends.forEach(dividend => {
    totalBySymbol[dividend.underlyingsymbol] =
      (totalBySymbol[dividend.underlyingsymbol] || 0) + (dividend.amount || 0);
  });

  const totalBySymbolArray = Object.entries(totalBySymbol).reduce((acc, [symbol, total]) => {
    acc[symbol] = { symbol, total };
    return acc;
  }, {});

  const arrayForSankey = _.sortBy(Object.values(totalBySymbolArray), ['symbol']);

  const nodes = arrayForSankey.map(d => {
    return { id: d.symbol };
  });
  const links = arrayForSankey.map(d => {
    return { source: d.symbol, value: d.total, target: 'total' };
  });
  return {
    nodes: nodes.concat({ id: 'total' }),
    links: links
  };
};

const computeRealizedGainsByCategory = data => {
  // Process each trade
  const stocksBySymbol = data.trades.reduce((acc, trade) => {
    if (trade.reportdate && trade.fifopnlrealized && trade.assetclass == "STK") {
      acc[trade.underlyingsymbol] =
        (acc[trade.underlyingsymbol] || 0) + (trade.fifopnlrealized || 0);
    }
    return acc;
  }, {});

  // Process each option
  const optionsBySymbol = data.trades.reduce((acc, trade) => {
    if (trade.reportdate && trade.fifopnlrealized && trade.assetclass == "OPT") {
      acc[trade.underlyingsymbol] =
        (acc[trade.underlyingsymbol] || 0) + (trade.fifopnlrealized || 0);
    }
    return acc;
  }, {});

  // Process each dividend
  const dividendsBySymbol = data.dividends.reduce((acc, dividend) => {
    acc[dividend.underlyingsymbol] =
      (acc[dividend.underlyingsymbol] || 0) + (dividend.amount || 0);
    return acc;  
  }, {});

  return {
    stocksBySymbol: stocksBySymbol,
    optionsBySymbol: optionsBySymbol,
    dividendsBySymbol: dividendsBySymbol
  };
}

const computeRealizedGainsByCategoryForSankeyChart = (stocksBySymbol, optionsBySymbol, dividendsBySymbol) => {
  const realizedGainsSymbolsSorted = _.sortBy(Object.keys(stocksBySymbol));

  const optionsBySymbolSorted = _.sortBy(Object.keys(optionsBySymbol));

  const dividendsSymbolSorted = _.sortBy(Object.keys(dividendsBySymbol));
  
  const nodes = _.uniq(realizedGainsSymbolsSorted.concat(optionsBySymbolSorted).concat(dividendsSymbolSorted))
    .map(d => {
      return { id: d };
    })
    .concat({ id: 'total' })
    .concat({ id: 'realizedGains' })
    .concat({ id: 'options' })
    .concat({ id: 'dividends' })  

  const realizedGainsLinks = realizedGainsSymbolsSorted.map(d => {
    return { source: d, value: stocksBySymbol[d], target: 'realizedGains' };
  });
  const optionLinks = optionsBySymbolSorted.map(d => {
    return { source: d, value: optionsBySymbol[d], target: 'options' };
  });
  const dividendsLinks = dividendsSymbolSorted.map(d => {
    return { source: d, value: dividendsBySymbol[d], target: 'dividends' };
  });

  const totalLinks = [
    {
      source: 'realizedGains',
      value: Object.values(stocksBySymbol).reduce((a, b) => a + b, 0),
      target: 'total'
    },
    {
      source: 'options',
      value: Object.values(optionsBySymbol).reduce((a, b) => a + b, 0),
      target: 'total'
    },
    {
      source: 'dividends',
      value: Object.values(dividendsBySymbol).reduce((a, b) => a + b, 0),
      target: 'total'
    }
  ];

  const res = {
    nodes: nodes,
    links: realizedGainsLinks.concat(optionLinks).concat(dividendsLinks).concat(totalLinks)
  };
  
  return res;
}

const formatRealizedGainsDataForSankeyChartByCategory = data => {
  const { stocksBySymbol, optionsBySymbol, dividendsBySymbol } = computeRealizedGainsByCategory(data)
  formatRealizedGainsDataForSankeyChartByCategoryTop10(data) //TODO: remove
  return computeRealizedGainsByCategoryForSankeyChart(stocksBySymbol, optionsBySymbol, dividendsBySymbol)
};

// Receives an object and returns an object with the top 10 sources by aggregated value
const getTop10SourcesByAggregatedValue = (data) => {
  const top10DataSortedAsArray = Object.keys(data).map(key => ({ symbol: key, total: data[key] }) ).sort((a, b) => b.total - a.total).slice(0, 10)
  return _.mapValues(_.keyBy(top10DataSortedAsArray, 'symbol'), 'total')
}


const formatRealizedGainsDataForSankeyChartByCategoryTop10 = data => {
  const { stocksBySymbol, optionsBySymbol, dividendsBySymbol } = computeRealizedGainsByCategory(data)
  
  const stocksBySymbolTop10 = getTop10SourcesByAggregatedValue(stocksBySymbol)
  const optionsBySymbolTop10 = getTop10SourcesByAggregatedValue(optionsBySymbol)
  const dividendsBySymbolTop10 = getTop10SourcesByAggregatedValue(dividendsBySymbol)
  
  return computeRealizedGainsByCategoryForSankeyChart(
      stocksBySymbolTop10,
      optionsBySymbolTop10,
      dividendsBySymbolTop10,
  )
};

const handleRealizedGainsClick = (chartRawData, setChartData, setShowChart) => {
  const formattedData = formatRealizedGainsDataForSankeyChart(chartRawData);
  setChartData(formattedData);
  setShowChart('realizedGainsSankeyCart');
};

const handleRealizedGainsBySymbolClick = (chartRawData, setChartData, setShowChart) => {
  const formattedData = formatRealizedGainsDataForSankeyChartBySymbol(chartRawData);
  setChartData(formattedData);
  setShowChart('realizedGainsSankeyCartBySymbol');
};

const handleRealizedGainsByCategoryClick = (chartRawData, setChartData, setShowChart) => {
  const formattedData = formatRealizedGainsDataForSankeyChartByCategory(chartRawData);
  setChartData(formattedData);
  setShowChart('realizedGainsSankeyCartByCategory');
};

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
  const sourceLinks = links.filter(
    link => link.target !== 'total' && link.source && typeof link.value === 'number'
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
  getTopSourcesByAggregatedValue,
  formatRealizedGainsDataForSankeyChartByCategoryTop10
};
