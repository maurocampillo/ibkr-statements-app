import _ from 'lodash';
//   Generate totals per symbol, eg:
//   {"ADBE": [{ "symbol": "ADBE", "assetCategory": "Stocks", "realizedTotal": "0", "unrealizedTotal": "-913.392154", "total": "-913.392154" }]}

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
  debugger
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
const computeRealizedGainsForSankey = (data) => {
  const realizedAndUnrealized = processRealizedAndUnrealizedEntriesBySymbol(data)
  const realizedGainsComputed = computeRealizedGains(realizedAndUnrealized)
  const dividends = processDividends(data)
  const dividendTaxes = processDividendsWithholdingTax(data)
  const netDividends = processNetDividends(dividends, dividendTaxes)
  let total = combineRealizedGainsAndNetDividends(realizedGainsComputed, netDividends)
  debugger
  return total
}

const utils = { computeRealizedGainsForSankey };
export default utils;