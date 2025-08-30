// Format data for Calendar chart
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

const handleCalendarChartClick = (trades, sectionsData, setChartData, setShowChart) => {
  const data = formatCalendarChartData(trades, sectionsData.dividends)
  setChartData(data);
  setShowChart("calendarChart");
}

export { handleCalendarChartClick, formatCalendarChartData };
