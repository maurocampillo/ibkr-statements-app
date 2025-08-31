import _ from 'lodash';

const processRealizedAndUnrealizedEntriesBySymbol = (data) => {
  const realizedAndUnrealizedRecords = data["realizedUnrealizedPerformanceSummary"].map((e) => {
    return {
      "symbol": e.symbol.split(" ")[0],
      "assetCategory": e.assetCategory,
      "realizedTotal": parseFloat(e.realizedTotal),
      "unrealizedTotal": parseFloat(e.unrealizedTotal),
      "total": e.total,
    }
  })
  const totalPnLPerSymbolGrouped = Object.groupBy(realizedAndUnrealizedRecords, e => e.symbol)
  return totalPnLPerSymbolGrouped
}

const processDividends = (data) => {
  const dividends = data["dividends"].map((e) => {
    return {
      "symbol": e.description.split("(")[0],
      "amount": parseFloat(e.amount),
    }
  })

  const result = Object.groupBy(dividends, e => e.symbol)
  return result
}

const processDividendsWithholdingTax = (data) => {
  const dividendTaxes = data["withholdingTax"].map((e) => {
    return {
      "symbol": e.description.split("(")[0],
      "amount": parseFloat(e.amount),
    }
  })
  const result = Object.groupBy(dividendTaxes, e => e.symbol)
  return result
}

const processNetDividends = (dividends, withholdingTax) => {
  let result = {}
  Object.keys(dividends).reduce((accum, key) => {
    const totalDividend = _.sumBy(dividends[key], "amount")
    const totalTax = _.sumBy(withholdingTax[key], "amount")
    // Taxes come with a negative sign so we add them directly to the dividends
    accum[key] = {
      "symbol": key,
      "total": totalDividend + totalTax,
    }
    return accum
  }, result)
  return result
}

const computeRealizedGains = (data) => {
  let result = {}
  Object.keys(data).reduce((accum, key) => {
    const total = _.sumBy(data[key], "realizedTotal")
    if (total > 0 && key.length > 0) {
      accum[key] = {
        "symbol": key,
        "total": total,
      }
    }
    return accum
  }, result)
  return result
}

const combineRealizedGainsAndNetDividends = (gains, dividends) => {
  const keys = _.uniq(Object.keys(gains).concat(Object.keys(dividends)))
  return keys.reduce((accum, key) => {
    const gain = gains[key] ? gains[key].total : 0
    const dividend = dividends[key] ? dividends[key].total : 0
    const total =  gain + dividend
    accum[key] = {
      "symbol": key,
      "total": total,
    }
    return accum
  }, {})
}

const computeRealizedGainsByCategory = (data) => {
  const realizedAndUnrealized = processRealizedAndUnrealizedEntriesBySymbol(data)  
  const realizedGains = computeRealizedGains(realizedAndUnrealized)
  const grossDividends = processDividends(data)
  const dividendTaxes = processDividendsWithholdingTax(data)
  const dividends = processNetDividends(grossDividends, dividendTaxes)
  const total = combineRealizedGainsAndNetDividends(realizedGains, dividends)
  return {realizedGains, dividends, total}
}

const computeRealizedGainsForSankey = (data) => {
  const result = computeRealizedGainsByCategory(data).total

  const sortedArray = _.sortBy(Object.values(result), (e) => (-1) * e.total)
  const largerPartition = sortedArray.slice(0, 10)
  const smallerPartition = sortedArray.slice(10, sortedArray.length) || []
  const otherTotal = _.sumBy(smallerPartition, "total")
  const largerPartitionObject = {}
  largerPartition.reduce((accum, elem) => {
    accum[elem.symbol] = elem
    return accum
  }, largerPartitionObject)
  if(otherTotal > 0) {
    largerPartitionObject["other"] = { "symbol": "other", "total": otherTotal }
  }
  return largerPartitionObject
}

// eslint-disable-next-line no-unused-vars
const aggregateSmallerGains = (gains, n) => {
  const sortedGains = _.sortBy(Object.values(gains), (e) => (-1) * e.total)
  const largerPartition = sortedGains.slice(0, n)
  const smallerPartition = sortedGains.slice(n, sortedGains.length) || []
  const otherTotal = _.sumBy(smallerPartition, "total")
  const largerPartitionObject = {}
  largerPartition.reduce((accum, elem) => { 
    accum[elem.symbol] = elem
    return accum
  }, largerPartitionObject)
  if(otherTotal > 0) {
    largerPartitionObject["other"] = { "symbol": "other", "total": otherTotal }
  }
  return largerPartitionObject
}

const aggregaterGains = (gains) => {
  const sortedGains = _.sortBy(Object.values(gains), (e) => (-1) * e.total)  
  const largerPartitionObject = {}
  sortedGains.reduce((accum, elem) => { 
    accum[elem.symbol] = elem
    return accum
  }, largerPartitionObject)  
  return largerPartitionObject
}

const computeRealizedGainsByCategoryForSankey = (data) => {
  const {realizedGains, dividends, total} = computeRealizedGainsByCategory(data)

  const sortedArrayRealizedGains = aggregaterGains(realizedGains)
  const sortedArrayDividends = aggregaterGains(dividends)
  const sortedArrayTotal = aggregaterGains(total)

  return {
    realizedGains: sortedArrayRealizedGains,
    dividends: sortedArrayDividends,
    total: sortedArrayTotal,
  }
}

const utils = { computeRealizedGainsForSankey, computeRealizedGainsByCategoryForSankey };
export default utils;