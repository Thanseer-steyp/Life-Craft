export const parseEventDate = (dateStr) => {
  if (!dateStr) return new Date();

  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return new Date(dateStr);
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "Date";

  try {
    const date = parseEventDate(dateStr);
    const monthNames = [
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

    const day = date.getDate().toString().padStart(2, "0");
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
};

// ✅ Sort by date & time
export const sortEventsByDateTime = (eventsList) => {
  return eventsList.sort((a, b) => {
    const getDateTime = (event) => {
      const datePart = parseEventDate(event.date);
      const timePart = event.time || "12:00 AM";

      const [rawTime, modifier] = timePart.split(" ");
      let [hours, minutes] = rawTime.split(":").map(Number);

      if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
      if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

      datePart.setHours(hours, minutes, 0, 0);
      return datePart;
    };

    return getDateTime(a) - getDateTime(b);
  });
};

export const isEventPast = (event) => {
  const now = new Date();
  const eventDate = parseEventDate(event.date);

  if (!event.time) {
    eventDate.setHours(23, 59, 59, 999);
    return now > eventDate;
  }

  const [rawTime, modifier] = event.time.split(" ");
  let [hours, minutes] = rawTime.split(":").map(Number);

  if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
  if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

  eventDate.setHours(hours, minutes, 0, 0);
  return now > eventDate;
};
