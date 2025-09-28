import _ from 'lodash';

// Format data for Nivo Sankey chart
const formatRealizedGainsDataForSankeyChart = data => {
  // Process each trade
  const tradesTotal = data.trades
    .filter(trade => trade.reportdate && trade.fifopnlrealized)
    .map(trade => trade.fifopnlrealized);

  // Process each dividend
  const dividendsTotal = data.dividends.map(dividend => dividend.amount);

  const interestsTotal = data.cashReport.find(
    e => e.currencyprimary === 'BASE_SUMMARY'
  )?.brokerinterest;

  return {
    nodes: [
      { id: 'interests' },
      { id: 'dividends' },
      { id: 'realizedGainsFromTrades' },
      { id: 'total' }
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
        value: _.sum(dividendsTotal)
      },
      {
        source: 'realizedGainsFromTrades',
        target: 'total',
        value: _.sum(tradesTotal)
      }
    ]
  };
};

// Receives an object with multiple symbols and totals, and returns an object
//  with the top N symbols by aggregated value
// { AMZN: 100, GOOGL: 40 }
const getTopNSourcesByAggregatedValue = (data, topN = 10) => {
  const top10DataSortedAsArray = _.sortBy(_.values(data), '[total]').reverse().slice(0, topN);

  return _.mapValues(_.keyBy(top10DataSortedAsArray, 'symbol'), 'total');
};

// Receives the raw data object and returns the realized gains iterating over the trades. It determines if the element is a realized gain by checking the fifopnlrealized.
// Supports receiving a list of assetclasses and a list of symbols to filter the trades.
// The output is: { AMZN: { symbol: 'AMZN', total: 100 } }
const computeTradeGainsBySymbol = (data, assetclass = [], symbols = []) => {
  // Process each trade
  return data.trades.reduce((acc, trade) => {
    if (
      trade.reportdate &&
      trade.fifopnlrealized &&
      assetclass.includes(trade.assetclass) &&
      (symbols.length === 0 || symbols.includes(trade.underlyingsymbol))
    ) {
      const elem = { symbol: trade.underlyingsymbol, total: trade.fifopnlrealized };

      if (acc[trade.underlyingsymbol]) {
        elem.total += acc[trade.underlyingsymbol].total;
      }

      acc[trade.underlyingsymbol] = elem;
    }
    return acc;
  }, {});
};

// Receives the raw data object and returns the dividends iterating over the dividends. It supports receiving a list of symbols to filter the dividends.
// The output is: { AMZN: { symbol: 'AMZN', total: 100 } }
const computeDividendsBySymbol = (data, symbols = []) => {
  return data.dividends.reduce((acc, dividend) => {
    if (symbols.length === 0 || symbols.includes(dividend.underlyingsymbol)) {
      const elem = { symbol: dividend.underlyingsymbol, total: dividend.amount };

      if (acc[dividend.underlyingsymbol]) {
        elem.total += acc[dividend.underlyingsymbol].total;
      }

      acc[dividend.underlyingsymbol] = elem;
    }
    return acc;
  }, {});
};

// Receives the raw data object from the store and returns the data formatted for the sankey chart
// by grouping the realized gains and dividends by symbol
// The output is:
//  {
//    nodes: [{ id: 'AMZN', id: 'GOOGL', id: 'total' }],
//    links: [{ source: 'AMZN', value: 100, target: 'total' }, { source: 'GOOGL', value: 200, target: 'total' }]
//  }
const formatRealizedGainsDataForSankeyChartBySymbol = (data, symbols = []) => {
  const tradesBySymbol = computeTradeGainsBySymbol(data, ['STK', 'OPT'], symbols);
  const dividendsBySymbol = computeDividendsBySymbol(data, symbols);
  const totalBySymbol = {};

  _.values(tradesBySymbol)
    .concat(_.values(dividendsBySymbol))
    .reduce((acc, e) => {
      const elem = { symbol: e.symbol, total: e.total };

      if (acc[e.symbol]) {
        elem.total += acc[e.symbol].total;
      }

      acc[e.symbol] = elem;

      return acc;
    }, totalBySymbol);

  const arrayForSankey = _.sortBy(Object.values(totalBySymbol), ['symbol']);

  const nodes = arrayForSankey.map(d => {
    return { id: d.symbol };
  });
  const links = arrayForSankey.map(d => ({ source: d.symbol, value: d.total, target: 'total' }));

  return {
    nodes: nodes.concat({ id: 'total' }),
    links: links
  };
};

// Just returns an array of symbols
const getTopNPerformersSymbols = (data, topN = 10) => {
  const tradesBySymbol = computeTradeGainsBySymbol(data, ['STK', 'OPT'], []);
  const dividendsBySymbol = computeDividendsBySymbol(data, []);
  const totalBySymbol = {};

  _.values(tradesBySymbol)
    .concat(_.values(dividendsBySymbol))
    .reduce((acc, e) => {
      const elem = { symbol: e.symbol, total: e.total };

      if (acc[e.symbol]) {
        elem.total += acc[e.symbol].total;
      }

      acc[e.symbol] = elem;
      return acc;
    }, totalBySymbol);

  return Object.keys(getTopNSourcesByAggregatedValue(totalBySymbol, topN));
};

const computeRealizedGainsByCategory = (data, symbols = []) => {
  return {
    stocksBySymbol: computeTradeGainsBySymbol(data, ['STK'], symbols),
    optionsBySymbol: computeTradeGainsBySymbol(data, ['OPT'], symbols),
    dividendsBySymbol: computeDividendsBySymbol(data, symbols)
  };
};

const getInstrumentBySymbolForSankeyChart = (instrumentBySymbol, target) => {
  const nodes = instrumentBySymbol.map(e => e.symbol);
  const realizedGainsLinks = _.sortBy(instrumentBySymbol, ['total'])
    .reverse()
    .map(d => {
      return { source: d.symbol, value: d.total, target: target };
    });

  return {
    nodes: nodes,
    links: realizedGainsLinks,
    total: instrumentBySymbol.map(e => e.total).reduce((a, b) => a + b, 0)
  };
};

// Receives the raw data object from the store and returns the data formatted for the sankey chart
// by grouping the stocks, options and dividend gains by symbol
// The output is:
//  {
//    nodes: [{ id: 'AMZN' }, { id: 'stocks' }, { id: 'options' }, { id: 'dividends' }, { id: 'total' }],
//    links: [{ source: 'AMZN', target: 'stocks', value: 100 }, { source: 'AMZN', target: 'options', value: 200 }, { source: 'options', target: 'total', value: 200 }, { source: 'stocks', target: 'total', value: 100 }]
//  }
const computeRealizedGainsByCategoryForSankeyChart = (
  stocksBySymbol,
  optionsBySymbol,
  dividendsBySymbol
) => {
  const stocksBySymbolData = getInstrumentBySymbolForSankeyChart(stocksBySymbol, 'stocks');
  const optionsBySymbolData = getInstrumentBySymbolForSankeyChart(optionsBySymbol, 'options');
  const dividendsBySymbolData = getInstrumentBySymbolForSankeyChart(dividendsBySymbol, 'dividends');

  const nodes = _.uniq(
    stocksBySymbolData.nodes.concat(optionsBySymbolData.nodes).concat(dividendsBySymbolData.nodes)
  )
    .map(d => ({ id: d }))
    .concat({ id: 'total' })
    .concat({ id: 'stocks' })
    .concat({ id: 'options' })
    .concat({ id: 'dividends' });

  const totalLinks = [
    {
      source: 'stocks',
      value: stocksBySymbolData.total,
      target: 'total'
    },
    {
      source: 'options',
      value: optionsBySymbolData.total,
      target: 'total'
    },
    {
      source: 'dividends',
      value: dividendsBySymbolData.total,
      target: 'total'
    }
  ];

  return {
    nodes: nodes,
    links: stocksBySymbolData.links
      .concat(optionsBySymbolData.links)
      .concat(dividendsBySymbolData.links)
      .concat(totalLinks)
  };
};

const formatRealizedGainsDataForSankeyChartByCategory = (data, symbols = []) => {
  const { stocksBySymbol, optionsBySymbol, dividendsBySymbol } = computeRealizedGainsByCategory(
    data,
    symbols
  );

  return computeRealizedGainsByCategoryForSankeyChart(
    _.values(stocksBySymbol),
    _.values(optionsBySymbol),
    _.values(dividendsBySymbol)
  );
};

// Helper function to create aggregated nodes and links with totals for symbol view
const createAggregatedChartDataBySymbol = (nodes, links) => {
  const aggregatedNodes = _.uniqBy(nodes.concat([{ id: 'total' }]), 'id');
  return {
    nodes: aggregatedNodes,
    links: links
  };
};

// Helper function to get filtered nodes from links
const getFilteredNodes = (allNodes, links) => {
  const referencedNodeIds = new Set();
  links.forEach(link => {
    referencedNodeIds.add(link.source);
    referencedNodeIds.add(link.target);
  });
  return allNodes.filter(node => referencedNodeIds.has(node.id));
};

// New filtered formatter functions that handle selectedSources parameter
const formatRealizedGainsDataForSankeyChartWithFilter = (data, selectedSources = []) => {
  // Get the base chart data
  const baseData = formatRealizedGainsDataForSankeyChart(data);

  // If no sources selected, return base data
  if (selectedSources.length === 0) {
    return baseData;
  }

  // Filter links based on selected sources
  const filteredLinks = baseData.links.filter(
    link => selectedSources.includes(link.source) || link.target === 'total' // Always include total aggregation links
  );

  const filteredNodes = getFilteredNodes(baseData.nodes, filteredLinks);

  return createAggregatedChartDataBySymbol(filteredNodes, filteredLinks);
};

const formatRealizedGainsDataForSankeyChartBySymbolWithFilter = data => {
  const symbols = getTopNPerformersSymbols(data);
  return formatRealizedGainsDataForSankeyChartBySymbol(data, symbols);
};

const formatRealizedGainsDataForSankeyChartByCategoryWithFilter = (data, selectedSources = []) => {
  if (selectedSources.length === 0) {
    const symbols = getTopNPerformersSymbols(data);
    return formatRealizedGainsDataForSankeyChartByCategory(data, symbols);
  } else {
    return formatRealizedGainsDataForSankeyChartByCategory(data, selectedSources);
  }
};

export {
  formatRealizedGainsDataForSankeyChartWithFilter,
  formatRealizedGainsDataForSankeyChartBySymbolWithFilter,
  formatRealizedGainsDataForSankeyChartByCategoryWithFilter
};
