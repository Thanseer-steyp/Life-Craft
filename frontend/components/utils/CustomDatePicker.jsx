// import React, { useState } from "react";

// const CustomDatePicker = ({ formData, setFormData, setDisplayDate, setShowCustomDatePicker }) => {
//   // Get today's date
//   const today = new Date();
//   const currentYear = today.getFullYear();
//   const currentMonth = today.getMonth();
//   const currentDate = today.getDate();

//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [selectedDate, setSelectedDate] = useState(currentDate);

//   // Generate years (current year + next 5 years)
//   const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

//   // Month names
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//   ];

//   // Get days in month
//   const getDaysInMonth = (year, month) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   // Get valid dates for selected month/year
//   const getValidDates = () => {
//     const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
//     const dates = [];

//     for (let i = 1; i <= daysInMonth; i++) {
//       const dateObj = new Date(selectedYear, selectedMonth, i);
//       // Only include dates from today onwards
//       if (dateObj >= new Date(currentYear, currentMonth, currentDate)) {
//         dates.push(i);
//       }
//     }
//     return dates;
//   };

//   const validDates = getValidDates();

//   // Update selected date when month/year changes
//   const handleMonthYearChange = (newYear, newMonth) => {
//     setSelectedYear(newYear);
//     setSelectedMonth(newMonth);

//     // Reset selected date to first valid date if current selection is invalid
//     const validDatesForNewMonth = [];
//     const daysInMonth = getDaysInMonth(newYear, newMonth);

//     for (let i = 1; i <= daysInMonth; i++) {
//       const dateObj = new Date(newYear, newMonth, i);
//       if (dateObj >= new Date(currentYear, currentMonth, currentDate)) {
//         validDatesForNewMonth.push(i);
//       }
//     }

//     if (
//       validDatesForNewMonth.length > 0 &&
//       !validDatesForNewMonth.includes(selectedDate)
//     ) {
//       setSelectedDate(validDatesForNewMonth[0]);
//     }
//   };

//   const handleDateSelect = () => {
//     const dateObj = new Date(selectedYear, selectedMonth, selectedDate);
//     const formattedDate = dateObj.toLocaleDateString("en-CA");
//     const displayFormattedDate = dateObj.toLocaleDateString("en-US", {
//       weekday: "short",
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });

//     setFormData({
//       ...formData,
//       date: formattedDate,
//     });
//     setDisplayDate(displayFormattedDate);
//     setShowCustomDatePicker(false);
//   };

//   return (
//     <div className="absolute top-full left-0 mt-1 bg-[#1a2a3a] border border-gray-600 rounded-lg p-4 shadow-lg z-20 w-full">
//       <div className="space-y-3">
//         {/* Year and Month selectors */}
//         <div className="flex gap-2">
//           <select
//             value={selectedYear}
//             onChange={(e) =>
//               handleMonthYearChange(parseInt(e.target.value), selectedMonth)
//             }
//             className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
//           >
//             {years.map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>

//           <select
//             value={selectedMonth}
//             onChange={(e) =>
//               handleMonthYearChange(selectedYear, parseInt(e.target.value))
//             }
//             className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
//           >
//             {months.map((month, index) => {
//               // Disable past months for current year
//               const isDisabled =
//                 selectedYear === currentYear && index < currentMonth;
//               return (
//                 <option key={index} value={index} disabled={isDisabled}>
//                   {month}
//                 </option>
//               );
//             })}
//           </select>
//         </div>

//         {/* Date selector */}
//         <div className="max-h-32 overflow-y-auto">
//           <select
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(parseInt(e.target.value))}
//             className="w-full bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
//             size="6"
//           >
//             {validDates.map((date) => (
//               <option key={date} value={date}>
//                 {date} {months[selectedMonth]} {selectedYear}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="flex gap-2 mt-3">
//         <button
//           type="button"
//           onClick={handleDateSelect}
//           className="flex-1 bg-yellow-400 text-black py-2 px-4 rounded font-semibold hover:bg-yellow-500"
//         >
//           Select
//         </button>
//         <button
//           type="button"
//           onClick={() => setShowCustomDatePicker(false)}
//           className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CustomDatePicker;
"use client";
import React, { useState } from "react";

const CustomDatePicker = ({
  formData,
  setFormData,
  setDisplayDate,
  setShowCustomDatePicker,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  // Max allowed age = 18 years old
  const maxYear = currentYear - 18;
  const maxMonth = currentMonth;
  const maxDay = currentDate;

  const [selectedYear, setSelectedYear] = useState(maxYear);
  const [selectedMonth, setSelectedMonth] = useState(maxMonth);
  const [selectedDate, setSelectedDate] = useState(maxDay);

  // Generate years (maxYear going back 80 years)
  const years = Array.from({ length: 80 }, (_, i) => maxYear - i);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getValidDates = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const dates = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(selectedYear, selectedMonth, i);
      const maxDOB = new Date(maxYear, maxMonth, maxDay);

      if (dateObj <= maxDOB) {
        dates.push(i);
      }
    }
    return dates;
  };

  const validDates = getValidDates();

  const handleMonthYearChange = (newYear, newMonth) => {
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    const daysInMonth = getDaysInMonth(newYear, newMonth);
    const validDatesForNewMonth = [];
    const maxDOB = new Date(maxYear, maxMonth, maxDay);

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(newYear, newMonth, i);
      if (dateObj <= maxDOB) validDatesForNewMonth.push(i);
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
    
    // Format as YYYY-MM-DD for Django backend
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Format for display as "15 Nov 2000"
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const displayFormattedDate = `${selectedDate} ${monthNames[selectedMonth]} ${selectedYear}`;

    setFormData({ ...formData, dob: formattedDate });
    setDisplayDate(displayFormattedDate);
    setShowCustomDatePicker(false);
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-[#1a2a3a] border border-gray-600 rounded-lg p-4 shadow-lg z-20 w-full">
      <div className="space-y-3">
        {/* Year + Month */}
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
              const isDisabled = selectedYear === maxYear && index > maxMonth;
              return (
                <option key={index} value={index} disabled={isDisabled}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>

        {/* Calendar Grid */}
        <div className="mt-2 grid grid-cols-7 gap-2 text-center">
          {/* Empty slots before 1st date */}
          {Array.from(
            { length: new Date(selectedYear, selectedMonth, 1).getDay() },
            (_, i) => (
              <div key={"empty-" + i}></div>
            )
          )}

          {/* Dates */}
          {Array.from(
            { length: getDaysInMonth(selectedYear, selectedMonth) },
            (_, i) => {
              const day = i + 1;
              const dateObj = new Date(selectedYear, selectedMonth, day);
              const maxDOB = new Date(maxYear, maxMonth, maxDay);
              const isDisabled = dateObj > maxDOB;
              const isSelected = selectedDate === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDisabled && setSelectedDate(day)}
                  className={`
                    p-2 rounded text-sm
                    ${
                      isDisabled
                        ? "text-gray-600 cursor-not-allowed bg-[#0f1b2a] opacity-30"
                        : isSelected
                        ? "bg-yellow-400 text-black font-bold"
                        : "bg-[#0f1b2a] text-white hover:bg-[#183048]"
                    }
                  `}
                  disabled={isDisabled}
                >
                  {day}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Buttons */}
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