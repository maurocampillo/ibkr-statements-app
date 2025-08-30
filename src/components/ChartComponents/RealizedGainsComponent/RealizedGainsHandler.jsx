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

export { 
  handleRealizedGainsClick, 
  handleRealizedGainsBySymbolClick, 
  handleRealizedGainsByCategoryClick,
  formatRealizedGainsDataForSankeyChart,
  formatRealizedGainsDataForSankeyChartBySymbol,
  formatRealizedGainsDataForSankeyChartByCategory
};
