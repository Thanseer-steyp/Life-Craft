"use client";
import { AnimatePresence, motion } from "framer-motion";
import PulseLoader from "react-spinners/PulseLoader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Star } from "lucide-react";

function AdvisorsPage() {
  const [advisors, setAdvisors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  // New states for day-selection booking
  const [showDaySelect, setShowDaySelect] = useState(false);
  const [availableDates, setAvailableDates] = useState([]); // {day, date}
  const [selectedDay, setSelectedDay] = useState(null);
  const [communicationMethod, setCommunicationMethod] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Fetch advisors
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/advisor/advisors-list/")
      .then((res) => {
        setAdvisors(res.data);

        // Extract unique advisor types as categories
        const uniqueCategories = [
          "All",
          ...new Set(res.data.map((item) => item.advisor_type)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error(err));
  }, []);

  const isAdvisorAvailable =
    selected?.availability?.some((slot) => slot.is_available) || false;

  const handleAdvisorClick = (advisor) => {
    if (selected?.id === advisor.id) {
      // Clicking the same advisor closes the right panel
      setSelected(null);
    } else {
      setSelected(advisor);
    }
  };

  // Fetch booking status when advisor selected
  useEffect(() => {
    if (!selected) return;
    const token = localStorage.getItem("access");
    if (!token) return;

    axios
      .get(
        `http://localhost:8000/api/v1/user/check-appointment/${selected.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setBookingStatus(res.data.status || null);
      })
      .catch(() => setBookingStatus(null));
  }, [selected]);

  // ---------- Booking: open modal showing upcoming dates (derived from advisor.availability) ----------
  const handleBook = (advisor) => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login to book an appointment.");
      router.push("/authentication");
      return;
    }

    if (!advisor || !advisor.availability) {
      alert("Advisor availability not found.");
      return;
    }

    // Extract available weekdays from advisor data
    const availableDays = advisor.availability
      .filter((slot) => slot.is_available)
      .map((slot) => slot.day.toLowerCase());

    if (availableDays.length === 0) {
      alert("This advisor has no available days.");
      return;
    }

    // Generate upcoming dates (next 3 occurrences per weekday, within next 21 days)
    const today = new Date();
    const daysMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const upcomingDates = [];

    // We'll collect up to 3 occurrences per available weekday
    availableDays.forEach((dayName) => {
      const targetWeekday = daysMap[dayName];
      if (typeof targetWeekday === "undefined") return;

      // Iterate next 21 days and pick matches
      let count = 0;
      for (let i = 1; i <= 70 && count < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        if (d.getDay() === targetWeekday) {
          upcomingDates.push({
            day: dayName,
            date: d.toISOString().split("T")[0],
          });
          count++;
        }
      }
    });

    // Sort by date ascending for predictable order
    upcomingDates.sort((a, b) => (a.date > b.date ? 1 : -1));

    setSelected(advisor);
    setAvailableDates(upcomingDates.slice(0, 9)); // limit to 9 combined dates
    setSelectedDay(null);
    setCommunicationMethod("");
    setShowDaySelect(true);
  };

  // Confirm booking: send advisor_id and preferred_day (YYYY-MM-DD) to backend
  const confirmBooking = async () => {
    if (!selectedDay) {
      alert("Please select a date first.");
      return;
    }
    if (!communicationMethod) {
      alert("Please select a communication method.");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please login to book an appointment.");
      router.push("/authentication");
      return;
    }

    try {
      setIsBooking(true);
      await axios.post(
        "http://localhost:8000/api/v1/user/book-appointment/",
        {
          advisor_id: selected.id,
          preferred_day: selectedDay,
          communication_method: communicationMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await new Promise((res) => setTimeout(res, 1000));
      alert(`Appointment booked successfully for ${selectedDay}`);
      setShowDaySelect(false);
      setSelectedDay(null);
      setSelected(null);
    } catch (err) {
      console.error(err);
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data ||
        "Failed to book appointment";
      alert(errMsg);
    } finally {
      setIsBooking(false);
    }
  };

  // Filter advisors by category
  const filteredAdvisors =
    selectedCategory === "All"
      ? advisors
      : advisors.filter((advisor) => advisor.advisor_type === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Bubbles */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Choose Advisor Category
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelected(null); // 🔹 Close right panel when switching filter
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition border ${
                  selectedCategory === category
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} Advisor
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Advisors List */}
          <div className="w-1/3 space-y-3 bg-white p-4 rounded-xl h-max">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Choose Advisor
            </h2>

            {filteredAdvisors.map((advisor) => (
              <div
                key={advisor.id}
                onClick={() => handleAdvisorClick(advisor)}
                className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                  selected?.id === advisor.id
                    ? "border-cyan-400 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={`http://localhost:8000${advisor.profile_photo}`}
                    alt={advisor.full_name}
                    className="w-15 h-15 rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {advisor.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {advisor.advisor_type} Advisor
                    </p>
                    <p className="text-xs text-gray-500">
                      {advisor.experience_years} years experience
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.9</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      • Available on:{" "}
                      {advisor.availability
                        ?.filter((a) => a.is_available)
                        .map(
                          (a) => a.day.charAt(0).toUpperCase() + a.day.slice(1)
                        )
                        .join(", ") || "No availability"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      • Online Consultation
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      • {advisor.language_preferences}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Consultation Fee
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    ₹200
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Advisor Details */}
          {selected && (
            <div className="flex-1 bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <img
                    src={`http://localhost:8000${selected.profile_photo}`}
                    alt={selected.full_name}
                    className="w-20 h-20 rounded-lg"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selected.full_name}
                    </h2>
                    <p className="text-gray-600 capitalize">
                      {selected.advisor_type} Advisor •{" "}
                      {selected.experience_years} years experience
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-700 font-medium">
                        4.9
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {bookingStatus === "pending" ? (
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                    >
                      Booking Pending...
                    </button>
                  ) : !isAdvisorAvailable ? (
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  ) : bookingStatus === "accepted" ? (
                    <button
                      onClick={() => handleBook(selected)}
                      className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
                    >
                      Book Another Appointment
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBook(selected)}
                      className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
                    >
                      Book Appointment
                    </button>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-graduation-cap-icon lucide-graduation-cap"
                    >
                      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                      <path d="M22 10v6" />
                      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-400 text-xs">Qualification</p>
                    <h6 className="capitalize text-gray-800 text-sm">
                      {selected.highest_qualification}
                    </h6>
                  </div>
                </div>
                {selected.specialized_in && (
                  <div className="flex items-center">
                    <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-telescope-icon lucide-telescope"
                      >
                        <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
                        <path d="m13.56 11.747 4.332-.924" />
                        <path d="m16 21-3.105-6.21" />
                        <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z" />
                        <path d="m6.158 8.633 1.114 4.456" />
                        <path d="m8 21 3.105-6.21" />
                        <circle cx="12" cy="13" r="2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-400 text-xs">Specialized in</p>
                      <h6 className="capitalize text-gray-800 text-sm">
                        {selected.specialized_in}
                      </h6>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-user-check-icon lucide-user-check"
                    >
                      <path d="m16 11 2 2 4-4" />
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-400 text-xs">LC Certified</p>
                    <h6 className="capitalize text-gray-800 text-sm">
                      {selected.educational_certificate ? "Certified" : "Fraud"}
                    </h6>
                  </div>
                </div>
                {selected.company && (
                  <div className="flex items-center">
                    <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-contact-round-icon lucide-contact-round"
                      >
                        <path d="M16 2v2" />
                        <path d="M17.915 22a6 6 0 0 0-12 0" />
                        <path d="M8 2v2" />
                        <circle cx="12" cy="12" r="4" />
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-400 text-xs">Working at</p>
                      <h6 className="capitalize text-gray-800 text-sm">
                        {selected.company}
                      </h6>
                    </div>
                  </div>
                )}
                {selected.designation && (
                  <div className="flex items-center">
                    <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-briefcase-icon lucide-briefcase"
                      >
                        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        <rect width="20" height="14" x="2" y="6" rx="2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-400 text-xs">Working as</p>
                      <h6 className="capitalize text-gray-800 text-sm">
                        {selected.designation}
                      </h6>
                    </div>
                  </div>
                )}
                {selected.previous_companies && (
                  <div className="flex items-center">
                    <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-building2-icon lucide-building-2"
                      >
                        <path d="M10 12h4" />
                        <path d="M10 8h4" />
                        <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
                        <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
                        <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-400 text-xs">
                        Previously worked for
                      </p>
                      <h6 className="capitalize text-gray-800 text-sm">
                        {selected.previous_companies}
                      </h6>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-map-pinned-icon lucide-map-pinned"
                    >
                      <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
                      <circle cx="12" cy="8" r="2" />
                      <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-400 text-xs">Country</p>
                    <h6 className="capitalize text-gray-800 text-sm">
                      {selected.country_address}
                    </h6>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-map-pin-icon lucide-map-pin"
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-400 text-xs">State</p>
                    <h6 className="capitalize text-gray-800 text-sm">
                      {selected.state_address}
                    </h6>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center shadow-lg p-2 rounded-xl bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-at-sign-icon lucide-at-sign"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-400 text-xs">Contact</p>
                    <h6 className="text-gray-800 text-sm">{selected.email}</h6>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Weekly Availability
                </h3>

                <div className="bg-gray-50 rounded-xl">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((dayName, index) => {
                    // ✅ Your helper functions included inside

                    const slot = selected.availability.find(
                      (s) => s.day === dayName
                    ) || {
                      day: dayName,
                      is_available: false,
                      total_slots: 0,
                      time_range: "",
                    };

                    return (
                      <div
                        key={dayName}
                        className={`flex items-center justify-between p-3 ${
                          index !== 6 ? "border-b border-gray-200" : ""
                        }`}
                      >
                        {/* Left side */}
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              slot.is_available ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <span className="font-medium text-gray-800 capitalize min-w-24">
                            {slot.day}
                          </span>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-4">
                          {slot.is_available ? (
                            <>
                              <span className="text-sm text-gray-600">
                                {slot.time_range}
                              </span>
                              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                {slot.total_slots} slots
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!selected && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-lg">Select an advisor to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Select Day Modal */}
      {showDaySelect && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Select Day & Communication Method
            </h2>

            {/* Available dates list */}
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {availableDates.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">
                  No available days found.
                </p>
              ) : (
                availableDates.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedDay(item.date)}
                    className={`p-3 rounded-lg border cursor-pointer transition text-black ${
                      selectedDay === item.date
                        ? "bg-cyan-500  border-cyan-500"
                        : "border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className="capitalize">{item.day}</span> - {item.date}
                  </div>
                ))
              )}
            </div>

            {/* Communication method selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose Communication Method:
              </label>
              <select
                value={communicationMethod}
                onChange={(e) => setCommunicationMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
              >
                <option value="">-- Select Method --</option>
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="phone">Phone Call</option>
                <option value="whatsapp">Whatsapp Video Call</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDaySelect(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center bg-white h-1/2 p-8 rounded-xl">
              <PulseLoader color="#06b6d4" margin={4} size={10} />

              <h3 className="text-lg font-semibold text-gray-800">
                Booking Appointment...
              </h3>

              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm text-gray-500"
              >
                Please wait while we confirm your booking and send details.
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdvisorsPage;
