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

const formatRealizedGainsDataForSankeyChartByCategory = data => {
  const realizedGainsBySymbol = {};
  const dividendsBySymbol = {};

  data.trades.forEach(trade => {
    if (trade.reportdate && trade.fifopnlrealized) {
      realizedGainsBySymbol[trade.underlyingsymbol] =
        (realizedGainsBySymbol[trade.underlyingsymbol] || 0) + (trade.fifopnlrealized || 0);
    }
  });

  // Process each dividend
  data.dividends.forEach(dividend => {
    dividendsBySymbol[dividend.underlyingsymbol] =
      (dividendsBySymbol[dividend.underlyingsymbol] || 0) + (dividend.amount || 0);
  });

  const realizedGainsSymbolsSorted = _.sortBy(Object.keys(realizedGainsBySymbol));

  const dividendsSymbolSorted = _.sortBy(Object.keys(dividendsBySymbol));

  const realizedGainsNodes = Object.keys(realizedGainsBySymbol)
    .map(d => {
      return { id: d };
    })
    .concat({ id: 'realizedGains' });

  const realizedNodes = Object.keys(dividendsBySymbol)
    .map(d => {
      return { id: d };
    })
    .concat({ id: 'dividends' });

  const totalNodes = [{ id: 'total' }];

  const realizedGainsLinks = realizedGainsSymbolsSorted.map(d => {
    return { source: d, value: realizedGainsBySymbol[d], target: 'realizedGains' };
  });
  const dividendsLinks = dividendsSymbolSorted.map(d => {
    return { source: d, value: dividendsBySymbol[d], target: 'dividends' };
  });

  const totalLinks = [
    {
      source: 'realizedGains',
      value: Object.values(realizedGainsBySymbol).reduce((a, b) => a + b, 0),
      target: 'total'
    },
    {
      source: 'dividends',
      value: Object.values(dividendsBySymbol).reduce((a, b) => a + b, 0),
      target: 'total'
    }
  ];

  const res = {
    nodes: realizedGainsNodes.concat(realizedNodes).concat(totalNodes),
    links: realizedGainsLinks.concat(dividendsLinks).concat(totalLinks)
  };

  return res;
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
  getTopSourcesByAggregatedValue
};
