import React, { useState } from "react";

const CustomDatePicker = ({ formData, setFormData, setDisplayDate, setShowCustomDatePicker }) => {
  // Get today's date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(currentDate);

  // Generate years (current year + next 5 years)
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Month names
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get valid dates for selected month/year
  const getValidDates = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const dates = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(selectedYear, selectedMonth, i);
      // Only include dates from today onwards
      if (dateObj >= new Date(currentYear, currentMonth, currentDate)) {
        dates.push(i);
      }
    }
    return dates;
  };

  const validDates = getValidDates();

  // Update selected date when month/year changes
  const handleMonthYearChange = (newYear, newMonth) => {
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    // Reset selected date to first valid date if current selection is invalid
    const validDatesForNewMonth = [];
    const daysInMonth = getDaysInMonth(newYear, newMonth);

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(newYear, newMonth, i);
      if (dateObj >= new Date(currentYear, currentMonth, currentDate)) {
        validDatesForNewMonth.push(i);
      }
    }

    if (
      validDatesForNewMonth.length > 0 &&
      !validDatesForNewMonth.includes(selectedDate)
    ) {
      setSelectedDate(validDatesForNewMonth[0]);
    }
  };

  const handleDateSelect = () => {
    const dateObj = new Date(selectedYear, selectedMonth, selectedDate);
    const formattedDate = dateObj.toLocaleDateString("en-CA");
    const displayFormattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    setFormData({
      ...formData,
      date: formattedDate,
    });
    setDisplayDate(displayFormattedDate);
    setShowCustomDatePicker(false);
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-[#1a2a3a] border border-gray-600 rounded-lg p-4 shadow-lg z-20 w-full">
      <div className="space-y-3">
        {/* Year and Month selectors */}
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) =>
              handleMonthYearChange(parseInt(e.target.value), selectedMonth)
            }
            className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) =>
              handleMonthYearChange(selectedYear, parseInt(e.target.value))
            }
            className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
          >
            {months.map((month, index) => {
              // Disable past months for current year
              const isDisabled =
                selectedYear === currentYear && index < currentMonth;
              return (
                <option key={index} value={index} disabled={isDisabled}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>

        {/* Date selector */}
        <div className="max-h-32 overflow-y-auto">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(parseInt(e.target.value))}
            className="w-full bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
            size="6"
          >
            {validDates.map((date) => (
              <option key={date} value={date}>
                {date} {months[selectedMonth]} {selectedYear}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleDateSelect}
          className="flex-1 bg-yellow-400 text-black py-2 px-4 rounded font-semibold hover:bg-yellow-500"
        >
          Select
        </button>
        <button
          type="button"
          onClick={() => setShowCustomDatePicker(false)}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CustomDatePicker;