"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function UserDashboard() {
  const COMMUNICATION_LABELS = {
    google_meet: "Google Meet",
    whatsapp_video_call: "WhatsApp Video Call",
    zoom: "Zoom",
    phone_call: "Phone Call",
  };
  const router = useRouter()
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/user/my-appointments/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => {
        setAppointments(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📅 My Appointments</h1>
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appt) => (
            <li key={appt.id} className="p-4 border rounded-lg shadow">
              <p className="font-semibold">Advisor: {appt.advisor_name}</p>
              <p>
                Status:
                <span
                  className={
                    appt.status === "pending"
                      ? "text-yellow-600"
                      : appt.status === "accepted"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {" "}
                  {appt.status}
                </span>
              </p>

              {appt.status === "accepted" && (
                <div className="mt-2 text-sm text-white">
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
                    {COMMUNICATION_LABELS[appt.communication_method]}
                  </p>
                </div>
              )}

              {appt.status === "declined" && (
                <p className="text-red-600 mt-2">
                  message : {appt.decline_message}
                </p>
              )}

              {appt.status === "pending" && (
                <p className="text-yellow-600 mt-2">
                  ⌛ Waiting for advisor approval...
                </p>
              )}
              {appt.status === "accepted" && (
                <button
                  onClick={() => router.push(`/chat/${appt.id}`)}
                  className="bg-[#bfa8fe] text-white px-3 py-2 rounded-lg"
                >
                  Chat Now
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserDashboard;
