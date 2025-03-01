import _ from 'lodash';
//   Generate totals per symbol, eg:
//   {"ADBE": [{ "symbol": "ADBE", "assetCategory": "Stocks", "realizedTotal": "0", "unrealizedTotal": "-913.392154", "total": "-913.392154" }]}

const processRealizedAndUnrealizedEntriesBySymbol = (result) => {
  const realizedAndUnrealizedRecords = result["realizedUnrealizedPerformanceSummary"].map((e) => {
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

const computeRealizedGains = (data) => {
  const res = Object.keys(data).map((key) => {
    const total = _.sumBy(data[key], "realizedTotal")
    return {
      "symbol": key,
      "total": total,
    }
  })
  return res.filter((e) => e.total > 0 && e.symbol.length > 0)
}

const computeRealizedGainsForSankey = (data) => {
  const realizedAndUnrealized = processRealizedAndUnrealizedEntriesBySymbol(data)
  return computeRealizedGains(realizedAndUnrealized)
}

const utils = { computeRealizedGainsForSankey };
export default utils;