// Format data for Nivo Line chart
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
}

const formatDividendDataForLineChart = (data) => {
  let groupedData = Object.groupBy(data, (d) => formatDate(d.date))
  const lineData = {
    id: 'Dividends',
    data: Object.keys(groupedData).map(keyDate => ({
      x: keyDate, // Date for x-axis
      y: groupedData[keyDate].map((e) => parseFloat(e.amount)).reduce((a,b) => a + b, 0),
      id: formatDate(keyDate), // Date for x-axis
    })).sort((a, b) => new Date(a.x) - new Date(b.x))
  };
  console.log("lineData", lineData)
  return [lineData];
};

const handleDividendsClick = (sectionsData, setChartData, setShowChart) => {
  const data = formatDividendDataForLineChart(sectionsData.dividends)
  setChartData(data);
  setShowChart("dividendsLineChart");
};

export { handleDividendsClick, formatDividendDataForLineChart, formatDate };
