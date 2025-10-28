"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function AdvisorDashboard() {
  const [activeTab, setActiveTab] = useState("appointments"); // ✅ Tabs
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [formData, setFormData] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const router = useRouter();

  const defaultWeek = [
    { day: "monday", is_available: false, total_slots: 0, time_range: "" },
    { day: "tuesday", is_available: false, total_slots: 0, time_range: "" },
    { day: "wednesday", is_available: false, total_slots: 0, time_range: "" },
    { day: "thursday", is_available: false, total_slots: 0, time_range: "" },
    { day: "friday", is_available: false, total_slots: 0, time_range: "" },
    { day: "saturday", is_available: false, total_slots: 0, time_range: "" },
    { day: "sunday", is_available: false, total_slots: 0, time_range: "" },
  ];
  const [availability, setAvailability] = useState(defaultWeek);

  useEffect(() => {
    fetchAppointments();
    fetchAvailability();
  }, []);

  const fetchAvailability = () => {
    setAvailabilityLoading(true);
    axios
      .get("http://localhost:8000/api/v1/advisor/availability/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => {
        const merged = defaultWeek.map((day) => {
          const serverDay = res.data.find(
            (d) => d.day.toLowerCase() === day.day.toLowerCase()
          );
          return serverDay ? { ...day, ...serverDay } : day;
        });
        setAvailability(merged);
      })
      .catch((err) => console.error(err))
      .finally(() => setAvailabilityLoading(false));
  };

  const updateAvailability = (day, field, value) => {
    setAvailability((prev) =>
      prev.map((item) => {
        if (item.day === day) {
          if (field === "is_available" && value === false) {
            return {
              ...item,
              is_available: false,
              total_slots: 0,
              time_range: "",
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const saveAvailability = (dayData) => {
    if (dayData.is_available) {
      if (!dayData.total_slots || !dayData.time_range.trim()) {
        alert("Please fill in both 'Total Slots' and 'Time Range' before saving.");
        return;
      }
    }

    axios
      .put("http://localhost:8000/api/v1/advisor/availability/", dayData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then(() => {
        alert(`${dayData.day} availability updated successfully`);
        fetchAvailability();
      })
      .catch(() => alert("Failed to update availability"));
  };

  const fetchAppointments = () => {
    axios
      .get("http://localhost:8000/api/v1/advisor/inbox/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("login-status-changed"));
    router.push("/authentication");
  };

  const submitAccept = async (id) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/advisor/manage-appointment/${id}/`,
        {
          action: "accept",
          preferred_day: formData[id]?.preferred_day,
          preferred_time: formData[id]?.preferred_time,
          communication_method: formData[id]?.communication_method,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setAcceptingId(null);
      fetchAppointments();
    } catch {
      alert("Failed to accept appointment");
    }
  };

  const submitDecline = async (id) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/advisor/manage-appointment/${id}/`,
        {
          action: "decline",
          decline_message: formData[id]?.decline_message,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setDecliningId(null);
      fetchAppointments();
    } catch {
      alert("Failed to decline appointment");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* ---------------- TAB HEADERS ---------------- */}
      <div className="flex gap-4 mb-6 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-2 px-4 font-semibold ${
            activeTab === "appointments"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📅 Appointments
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`pb-2 px-4 font-semibold ${
            activeTab === "availability"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🗓️ Availability Setup
        </button>
        <button
          onClick={handleLogout}
          className="ml-auto bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* ---------------- TAB CONTENT ---------------- */}
      {activeTab === "appointments" ? (
        <>
          {loading ? (
            <p className="text-gray-500">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500">No appointments yet.</p>
          ) : (
            <ul className="space-y-6">
              {appointments.map((appt) => (
                <li
                  key={appt.id}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">{appt.user_name}</h2>
                    <span
                      className={`font-medium px-3 py-1 rounded-full text-sm ${
                        appt.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appt.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-2">
                    Requested on {new Date(appt.created_at).toLocaleString()}
                  </p>

                  {appt.status === "accepted" && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700 text-sm">
                      <p><span className="font-medium">Day:</span> {appt.preferred_day}</p>
                      <p><span className="font-medium">Time:</span> {appt.preferred_time}</p>
                      <p><span className="font-medium">Method:</span> {appt.communication_method}</p>
                      <div className="sm:col-span-3 mt-3">
                        <button
                          onClick={() => router.push(`/chat/${appt.id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                          💬 Open Chat
                        </button>
                      </div>
                    </div>
                  )}

                  {appt.status === "declined" && (
                    <div className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                      <p>
                        <span className="font-medium">Reason:</span>{" "}
                        {appt.decline_message || "No reason provided"}
                      </p>
                    </div>
                  )}

                  {appt.status === "pending" && (
                    <div className="mt-4 space-y-3">
                      {acceptingId === appt.id && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="date"
                            className="border rounded px-3 py-2 w-full text-gray-800"
                            onChange={(e) =>
                              handleChange(appt.id, "preferred_day", e.target.value)
                            }
                          />
                          <input
                            type="time"
                            className="border rounded px-3 py-2 w-full text-gray-800"
                            onChange={(e) =>
                              handleChange(appt.id, "preferred_time", e.target.value)
                            }
                          />
                          <select
                            className="border rounded px-3 py-2 w-full text-gray-800"
                            onChange={(e) =>
                              handleChange(appt.id, "communication_method", e.target.value)
                            }
                          >
                            <option value="">Select Method</option>
                            <option value="google_meet">Google Meet</option>
                            <option value="whatsapp">WhatsApp Video Call</option>
                            <option value="zoom">Zoom</option>
                            <option value="phone">Phone Call</option>
                          </select>
                          <div className="sm:col-span-3 flex gap-3 mt-2">
                            <button
                              onClick={() => submitAccept(appt.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                            >
                              Submit Accept
                            </button>
                            <button
                              onClick={() => setAcceptingId(null)}
                              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {decliningId === appt.id && (
                        <div className="mt-2 space-y-2">
                          <textarea
                            placeholder="Reason for declining"
                            className="border rounded p-3 w-full text-gray-800"
                            onChange={(e) =>
                              handleChange(appt.id, "decline_message", e.target.value)
                            }
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => submitDecline(appt.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                            >
                              Submit Decline
                            </button>
                            <button
                              onClick={() => setDecliningId(null)}
                              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {acceptingId !== appt.id && decliningId !== appt.id && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setAcceptingId(appt.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setDecliningId(appt.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        /* ---------------- AVAILABILITY TAB ---------------- */
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🗓️ Weekly Availability Setup
          </h2>

          {availabilityLoading ? (
            <p className="text-gray-500">Loading availability...</p>
          ) : (
            <div className="space-y-3">
              {availability.map((day) => {
                const [startTime, endTime] = day.time_range
                  ? day.time_range.split("-").map((t) => t.trim())
                  : ["", ""];

                const parseTime = (time) => {
                  if (!time) return { hour: "", period: "AM" };
                  const [hour, period] = time.split(" ");
                  return { hour, period };
                };

                const start = parseTime(startTime);
                const end = parseTime(endTime);

                return (
                  <div
                    key={day.day}
                    className="flex gap-4 items-center bg-white border border-gray-100 rounded-lg p-3"
                  >
                    <div className="flex w-[170px] items-center">
                      <span className="capitalize font-medium text-gray-800 flex-1">
                        {day.day}
                      </span>

                      <select
                        className="border rounded p-2 text-gray-800"
                        value={day.is_available ? "yes" : "no"}
                        onChange={(e) =>
                          updateAvailability(
                            day.day,
                            "is_available",
                            e.target.value === "yes"
                          )
                        }
                      >
                        <option value="yes">✓</option>
                        <option value="no">✗</option>
                      </select>
                    </div>

                    {day.is_available && (
                      <>
                        <input
                          type="number"
                          placeholder="Total slots"
                          className="border rounded p-2 text-gray-800 no-arrows"
                          value={day.total_slots || ""}
                          onChange={(e) =>
                            updateAvailability(day.day, "total_slots", e.target.value)
                          }
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Start Time */}
                          <div className="border text-gray-800 rounded flex items-center">
                            <input
                              type="number"
                              min="1"
                              max="12"
                              placeholder="Start"
                              className="px-2 py-2 w-20 no-arrows"
                              value={start.hour || ""}
                              onChange={(e) => {
                                const newStart = `${e.target.value} ${start.period}`;
                                const newRange = `${newStart} - ${
                                  end.hour ? `${end.hour} ${end.period}` : ""
                                }`;
                                updateAvailability(day.day, "time_range", newRange);
                              }}
                            />
                            <select
                              className="px-2 py-2"
                              value={start.period}
                              onChange={(e) => {
                                const newStart = `${start.hour} ${e.target.value}`;
                                const newRange = `${newStart} - ${
                                  end.hour ? `${end.hour} ${end.period}` : ""
                                }`;
                                updateAvailability(day.day, "time_range", newRange);
                              }}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>

                          <span className="text-gray-600 font-medium">to</span>

                          {/* End Time */}
                          <div className="border text-gray-800 rounded flex items-center">
                            <input
                              type="number"
                              min="1"
                              max="12"
                              placeholder="End"
                              className="px-2 py-2 w-20 no-arrows"
                              value={end.hour || ""}
                              onChange={(e) => {
                                const newEnd = `${e.target.value} ${end.period}`;
                                const newRange = `${
                                  start.hour ? `${start.hour} ${start.period}` : ""
                                } - ${newEnd}`;
                                updateAvailability(day.day, "time_range", newRange);
                              }}
                            />
                            <select
                              className="px-2 py-2"
                              value={end.period}
                              onChange={(e) => {
                                const newEnd = `${end.hour} ${e.target.value}`;
                                const newRange = `${
                                  start.hour ? `${start.hour} ${start.period}` : ""
                                } - ${newEnd}`;
                                updateAvailability(day.day, "time_range", newRange);
                              }}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex-1 flex justify-end">
                      <button
                        onClick={() => saveAvailability(day)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdvisorDashboard;
