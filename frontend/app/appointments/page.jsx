"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axiosInstance from "@/components/config/axiosInstance";

function UserDashboard() {
  const COMMUNICATION_LABELS = {
    google_meet: "Google Meet",
    whatsapp_video_call: "WhatsApp Video Call",
    zoom: "Zoom",
    phone_call: "Phone Call",
  };

  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [ratings, setRatings] = useState({}); // Store temporary rating values

  // ✅ Fetch appointments
  useEffect(() => {
    axiosInstance
      .get("api/v1/user/my-appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Mark appointment as attended
  const handleMarkAsAttended = async (appointmentId) => {
    try {
      await axiosInstance.post(
        `api/v1/user/appointment/${appointmentId}/attended/`
      );
      toast.success("Appointment marked as attended!");
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...appt, is_attended: true } : appt
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to mark as attended");
    }
  };

  // ✅ Submit rating
  const handleSubmitRating = async (appointmentId) => {
    const ratingValue = ratings[appointmentId];
    if (!ratingValue) {
      toast.error("Please select a rating before submitting");
      return;
    }

    try {
      await axiosInstance.post(
        `api/v1/advisor/rate-appointment/${appointmentId}/`,
        { rating: ratingValue }
      );
      toast.success("Rating submitted successfully!");
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId
            ? { ...appt, rating_given: true, rating_value: ratingValue }
            : appt
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit rating");
    }
  };

  // ✅ Check if appointment time has passed
  const canMarkAsAttended = (appt) => {
    if (!appt.preferred_day || !appt.preferred_time) return false;
    const [hour, minute] = appt.preferred_time.split(":").map(Number);
    const scheduledTime = new Date(appt.preferred_day);
    scheduledTime.setHours(hour);
    scheduledTime.setMinutes(minute);
    scheduledTime.setSeconds(0);
    return new Date() >= scheduledTime;
  };

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

              {/* Accepted Appointment Details */}
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
                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => router.push(`/chat/${appt.id}`)}
                      className="bg-[#bfa8fe] text-white px-3 py-2 rounded-lg"
                    >
                      Chat Now
                    </button>

                    {!appt.is_attended && (
                      <button
                        onClick={() => handleMarkAsAttended(appt.id)}
                        disabled={!canMarkAsAttended(appt)}
                        className={`px-3 py-2 rounded-lg text-white transition ${
                          canMarkAsAttended(appt)
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {canMarkAsAttended(appt)
                          ? "Mark as Attended"
                          : "Mark as Attended (Locked)"}
                      </button>
                    )}

                    {appt.is_attended && (
                      <span className="text-green-700 font-medium">
                        ✅ Attended
                      </span>
                    )}
                  </div>

                  {/* ✅ Rating section appears after attendance */}
                  {appt.is_attended && !appt.rating_given && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">Rate your advisor:</p>
                      <div className="flex gap-1 items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() =>
                              setRatings((prev) => ({
                                ...prev,
                                [appt.id]: star,
                              }))
                            }
                            className={`text-2xl ${
                              ratings[appt.id] >= star
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                        <button
                          onClick={() => handleSubmitRating(appt.id)}
                          className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ✅ Show given rating */}
                  {appt.rating_given && (
                    <p className="text-yellow-500 font-medium mt-1">
                      ⭐ You rated: {appt.rating_value}/5
                    </p>
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

export default UserDashboard;
