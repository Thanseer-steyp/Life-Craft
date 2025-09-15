import React, { useState } from "react";

const CustomTimePicker = ({ formData, setFormData, setDisplayTime, setShowCustomTimePicker }) => {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (time12) => {
    if (!time12) return "";

    const [time, period] = time12.split(" ");
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours, 10);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleTimeSelect = () => {
    const time12 = `${hour}:${minute} ${period}`;
    const time24 = convertTo24Hour(time12);

    setFormData({
      ...formData,
      time: time24,
    });
    setDisplayTime(time12);
    setShowCustomTimePicker(false);
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-[#1a2a3a] border border-gray-600 rounded-lg p-3 shadow-lg z-20 w-full">
      <div className="flex gap-1 items-center justify-between">
        {/* Hour selector */}
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className="bg-[#0f1b2a] text-white px-1 py-2 rounded border border-gray-600"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <span className="text-white text-xl">:</span>

        {/* Minute selector */}
        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className="bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
        >
          {minutes
            .filter((_, i) => i % 5 === 0)
            .map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
        </select>

        {/* AM/PM selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleTimeSelect}
          className="flex-1 bg-yellow-400 text-black py-2 px-4 rounded font-semibold hover:bg-yellow-500"
        >
          Select
        </button>
        <button
          type="button"
          onClick={() => setShowCustomTimePicker(false)}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CustomTimePicker;