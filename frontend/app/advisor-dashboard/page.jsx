"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function AdvisorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    axios
      .get("http://localhost:8000/api/v1/advisor/inbox/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const submitAccept = async (id) => {
    try {
      const res = await axios.post(
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

      // ✅ Redirect to chatroom after accept
      if (res.data.chatroom_id) {
        setTimeout(() => {
          router.push(`/chat/${res.data.chatroom_id}`);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert("Failed to decline appointment");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">
        📅 Appointment Requests
      </h1>

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
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {appt.user_name}
                </h2>
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

              {/* Accepted view */}
              {appt.status === "accepted" && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700 text-sm">
                  <p>
                    <span className="font-medium">Day:</span>{" "}
                    {appt.preferred_day}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {appt.preferred_time}
                  </p>
                  <p>
                    <span className="font-medium">Method:</span>{" "}
                    {appt.communication_method}
                  </p>
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

              {/* Declined view */}
              {appt.status === "declined" && (
                <div className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                  <p>
                    <span className="font-medium">Reason:</span>{" "}
                    {appt.decline_message || "No reason provided"}
                  </p>
                </div>
              )}

              {/* Pending actions */}
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
                          handleChange(
                            appt.id,
                            "communication_method",
                            e.target.value
                          )
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
    </div>
  );
}

export default AdvisorDashboard;
