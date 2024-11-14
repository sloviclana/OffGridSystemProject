import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ onDateRangeSelect }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Handler za promenu početnog datuma
  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(null); // Ako je početni datum posle krajnjeg, poništava kraj
    }
  };

  // Handler za promenu krajnjeg datuma
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // Kada korisnik odabere interval, pozivamo callback
  const handleSubmit = () => {
    if (startDate && endDate) {
      onDateRangeSelect({ startDate, endDate });
    } else {
      alert("Please choose both dates.");
    }
  };

  return (
    <div>
      <h3>Pick dates for report</h3>
      
      {/* Početni datum */}
      <div>
        <label>Start date:</label>
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy/MM/dd"
        />
      </div>

      {/* Krajnji datum */}
      <div>
        <label>End date:</label>
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate} // Ne može se izabrati datum pre početnog
          dateFormat="yyyy/MM/dd"
        />
      </div>

      {/* Dugme za potvrdu */}
      <button onClick={handleSubmit}>Potvrdi</button>
    </div>
  );
};

export default DateRangePicker;
