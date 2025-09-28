import PropTypes from 'prop-types';
import './styles.css';

const CalendarChart = ({
  data = {},
  defaultBoxColor = '#ffffff',
  boxBorderColor: _boxBorderColor = '#000000',
  rowCount = 1
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const boxesPerRow = Math.ceil(12 / rowCount);

  const getMonthName = month => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'short' });
  };

  const renderBox = month => {
    const monthData = data[month] || {};

    // Only apply custom colors if they exist, otherwise let CSS theme variables handle it
    const customStyle = {};
    if (monthData.color && monthData.color !== defaultBoxColor) {
      customStyle.backgroundColor = monthData.color;
    }

    // Add a data attribute to indicate if this month has data for styling
    const hasData = monthData.value && monthData.value !== 0;

    return (
      <div
        key={month}
        className={`calendar-box ${hasData ? 'has-data' : 'no-data'}`}
        style={customStyle}
        data-month={month}
      >
        <div className='month-name'>{getMonthName(month)}</div>
        {monthData.value && <div className='value'>{monthData.formattedValue}</div>}
        {monthData.caption && <div className='caption'>{monthData.caption}</div>}
      </div>
    );
  };

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const startIdx = i * boxesPerRow;
      const rowMonths = months.slice(startIdx, startIdx + boxesPerRow);
      rows.push(
        <div key={i} className='calendar-row'>
          {rowMonths.map(month => renderBox(month))}
        </div>
      );
    }
    return rows;
  };

  return <div className='calendar-chart'>{renderRows()}</div>;
};

CalendarChart.propTypes = {
  data: PropTypes.objectOf(
    PropTypes.shape({
      value: PropTypes.string,
      caption: PropTypes.string,
      color: PropTypes.string
    })
  ),
  defaultBoxColor: PropTypes.string,
  boxBorderColor: PropTypes.string,
  rowCount: PropTypes.oneOf([1, 2, 3, 4, 6, 12])
};

export default CalendarChart;
