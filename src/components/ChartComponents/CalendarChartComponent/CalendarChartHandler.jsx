// Format data for Calendar chart
const formatCalendarChartData = (trades, dividends) => {
  if (!trades || !trades.length) {
    return {};
  }

  // Initialize result object with all months
  const result = {
    "1": { value: 0, hasData: false },
    "2": { value: 0, hasData: false },
    "3": { value: 0, hasData: false },
    "4": { value: 0, hasData: false },
    "5": { value: 0, hasData: false },
    "6": { value: 0, hasData: false },
    "7": { value: 0, hasData: false },
    "8": { value: 0, hasData: false },
    "9": { value: 0, hasData: false },
    "10": { value: 0, hasData: false },
    "11": { value: 0, hasData: false },
    "12": { value: 0, hasData: false }
  };

  // Process each trade
  trades.forEach(trade => {
    if (trade.datetime && trade.realizedPl) {
      // Extract month from dateTime (format: "2025-01-03, 11:08:24")
      const month = parseInt(trade.datetime.split('-')[1]);      
      if (month >= 1 && month <= 12) {
        result[month].value += trade.realizedPl;
        result[month].hasData = true;
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
    result[month].formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(Math.round(result[month].value * 100) / 100);
  });

  return result;
}

const handleCalendarChartClick = (trades, sectionsData, setChartData, setShowChart) => {
  const data = formatCalendarChartData(trades, sectionsData.dividends)
  setChartData(data);
  setShowChart("calendarChart");
}

export { handleCalendarChartClick, formatCalendarChartData };
