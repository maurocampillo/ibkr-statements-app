import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

const CalendarChart = ({ 
  data = {}, 
  defaultBoxColor = '#ffffff',
  boxBorderColor = '#000000',
  rowCount = 1 
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const boxesPerRow = Math.ceil(12 / rowCount);

  const getMonthName = (month) => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'short' });
  };

  const renderBox = (month) => {
    const monthData = data[month] || {};
    const style = {
      backgroundColor: monthData.color || defaultBoxColor,
      borderColor: boxBorderColor,
    };

    return (
      <div key={month} className="calendar-box" style={style}>
        <div className="month-name">{getMonthName(month)}</div>
        {monthData.value && <div className="value">{monthData.value}</div>}
        {monthData.caption && <div className="caption">{monthData.caption}</div>}
      </div>
    );
  };

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const startIdx = i * boxesPerRow;
      const rowMonths = months.slice(startIdx, startIdx + boxesPerRow);
      rows.push(
        <div key={i} className="calendar-row">
          {rowMonths.map(month => renderBox(month))}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="calendar-chart">
      {renderRows()}
    </div>
  );
};

CalendarChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.shape({
    value: PropTypes.string,
    caption: PropTypes.string,
    color: PropTypes.string
  })),
  defaultBoxColor: PropTypes.string,
  boxBorderColor: PropTypes.string,
  rowCount: PropTypes.oneOf([1, 2, 3, 4, 6, 12])
};

export default CalendarChart; 