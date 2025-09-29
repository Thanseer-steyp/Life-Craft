"use client";
import { useEffect, useState } from "react";
import axios from "axios";

function AdvisorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({}); // store accept form per appointment

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

  const handleAction = async (id, action) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/advisor/manage-appointment/${id}/`,
        action === "decline"
          ? { action }
          : {
              action,
              preferred_day: formData[id]?.preferred_day,
              preferred_time: formData[id]?.preferred_time,
              communication_method: formData[id]?.communication_method,
            },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    }
  };

  const handleChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📅 Appointment Requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appt) => (
            <li key={appt.id} className="p-4 border rounded-lg shadow">
              <p className="font-semibold text-lg">{appt.user_name}</p>
              <p className="text-sm text-gray-500">
                Requested on {new Date(appt.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={
                    appt.status === "pending"
                      ? "text-yellow-600"
                      : appt.status === "accepted"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {appt.status}
                </span>
              </p>

              {appt.status === "pending" && (
                <div className="mt-3 space-y-2">
                  <input
                    type="date"
                    className="border rounded p-1 w-full text-black"
                    onChange={(e) =>
                      handleChange(appt.id, "preferred_day", e.target.value)
                    }
                  />
                  <input
                    type="time"
                    className="border rounded p-1 w-full text-black"
                    onChange={(e) =>
                      handleChange(appt.id, "preferred_time", e.target.value)
                    }
                  />
                  <select
                    className="border rounded p-1 w-full text-black"
                    onChange={(e) =>
                      handleChange(appt.id, "communication_method", e.target.value)
                    }
                  >
                    <option value="">Select Communication Method</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="whatsapp">WhatsApp Video Call</option>
                    <option value="zoom">Zoom</option>
                    <option value="phone">Phone Call</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(appt.id, "accept")}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(appt.id, "decline")}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {appt.status === "accepted" && (
                <div className="mt-2 text-sm text-gray-700">
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
