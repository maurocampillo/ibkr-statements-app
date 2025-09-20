// Format data for Nivo Line chart
const formatDate = date => {  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
};

const formatDividendDataForLineChart = data => {  
  const groupedData = Object.groupBy(data, d => formatDate(d.settledate));  
  const lineData = {
    id: 'Dividends',
    data: Object.keys(groupedData)
      .map(keyDate => ({
        x: keyDate, // Date for x-axis
        y: groupedData[keyDate].map(e => e.amount).reduce((a, b) => a + b, 0),
        id: keyDate // Date for x-axis
      }))
      .sort((a, b) => new Date(a.x) - new Date(b.x))
  };  
  return [lineData];
};

export { formatDividendDataForLineChart, formatDate };
