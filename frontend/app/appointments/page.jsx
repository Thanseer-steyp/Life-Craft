"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/components/config/AxiosInstance";
import CustomAlert from "@/components/includes/CustomAlert";

function UserDashboard() {
  const COMMUNICATION_LABELS = {
    google_meet: "Google Meet",
    whatsapp_video_call: "WhatsApp Video Call",
    zoom: "Zoom",
    phone_call: "Phone Call",
  };

  const router = useRouter();
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [appointments, setAppointments] = useState([]);
  const [ratings, setRatings] = useState({});
  const [hoveredStar, setHoveredStar] = useState({});

  useEffect(() => {
    axiosInstance
      .get("api/v1/user/my-appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleMarkAsAttended = async (appointmentId) => {
    try {
      await axiosInstance.post(
        `api/v1/user/appointment/${appointmentId}/attended/`
      );
      setAlert({ message: "Appointment mark as attended", type: "success" });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...appt, is_attended: true } : appt
        )
      );
    } catch (err) {
      setAlert({
        message: err.response?.data?.error || "Failed to mark as attended",
        type: "error",
      });
    }
  };

  const handleSubmitRating = async (appointmentId) => {
    const ratingValue = ratings[appointmentId];

    if (!ratingValue) {
      setAlert({
        message: "Please select a rating before submitting",
        type: "warning",
      });
      return;
    }

    try {
      await axiosInstance.post(
        `api/v1/advisor/rate-appointment/${appointmentId}/`,
        { rating: ratingValue }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId
            ? { ...appt, rating_given: true, rating_value: ratingValue }
            : appt
        )
      );

      setAlert({
        message: `You rated this appointment ${ratingValue} ★ successfully!`,
        type: "success",
      });
    } catch (err) {
      setAlert({
        message: err.response?.data?.error || "Failed to submit rating",
        type: "error",
      });
    }
  };

  const canMarkAsAttended = (appt) => {
    if (!appt.preferred_day || !appt.preferred_time) return false;
    const [hour, minute] = appt.preferred_time.split(":").map(Number);
    const scheduledTime = new Date(appt.preferred_day);
    scheduledTime.setHours(hour);
    scheduledTime.setMinutes(minute);
    scheduledTime.setSeconds(0);
    return new Date() >= scheduledTime;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-amber-100 text-amber-800 border border-amber-200",
      accepted: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      declined: "bg-red-100 text-red-800 border border-red-200",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            My Appointments
          </h1>
          <p className="text-slate-600">
            Manage and track your advisory sessions
          </p>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No appointments yet
            </h3>
            <p className="text-slate-500">
              Your scheduled appointments will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex justify-between mb-4 pb-4 border-b border-slate-100">
                    <div className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-14">
                        <img
                          src={`${axiosInstance.defaults.baseURL}${appt.advisor_photo}`}
                          alt={appt.advisor_name}
                          className="w-full rounded-lg"
                        />
                      </div>
                      <div>
                        <h4 className="text-black text-lg">
                          {appt.advisor_name}
                        </h4>
                        <h5 className="capitalize text-gray-600 text-sm">
                          {appt.advisor_type} Advisor
                        </h5>
                        <h5 className="text-gray-600 text-sm">
                          {appt.advisor_email}
                        </h5>
                      </div>
                    </div>
                    <span
                      className={`flex items-center px-4 py-2 w-max h-max rounded-2xl text-sm font-medium capitalize ${getStatusBadge(
                        appt.status
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  {/* Accepted Appointment Details */}
                  {appt.status === "accepted" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Date
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(appt.preferred_day)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Time
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {formatTime(appt.preferred_time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Method
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {COMMUNICATION_LABELS[appt.communication_method]}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Declined Message */}
                  {appt.status === "declined" && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">Decline Reason:</span>{" "}
                        {appt.decline_message}
                      </p>
                    </div>
                  )}

                  {/* Pending Message */}
                  {appt.status === "pending" && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center space-x-3">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-amber-800">
                        Waiting for advisor approval...
                      </p>
                    </div>
                  )}

                  {/* Action Buttons for Accepted Appointments */}
                  {appt.status === "accepted" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => router.push(`/chat/${appt.id}`)}
                          className="inline-flex text-sm w-max h-max items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          Chat
                        </button>

                        {!appt.is_attended ? (
                          <button
                            onClick={() => handleMarkAsAttended(appt.id)}
                            disabled={!canMarkAsAttended(appt)}
                            className={`inline-flex text-sm h-max w-max items-center px-6 py-3 font-medium rounded-xl shadow-sm transition-all duration-200 ${
                              canMarkAsAttended(appt)
                                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-md"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Mark as Attended
                          </button>
                        ) : (
                          <div className="inline-flex w-max h-max items-center text-sm px-6 py-3 bg-green-50 border border-green-200 text-green-700 font-medium rounded-xl">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            Attended
                          </div>
                        )}
                        {appt.is_attended && !appt.rating_given && (
                          <div className="px-2 flex items-center bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onMouseEnter={() =>
                                      setHoveredStar((prev) => ({
                                        ...prev,
                                        [appt.id]: star,
                                      }))
                                    }
                                    onMouseLeave={() =>
                                      setHoveredStar((prev) => ({
                                        ...prev,
                                        [appt.id]: 0,
                                      }))
                                    }
                                    onClick={() =>
                                      setRatings((prev) => ({
                                        ...prev,
                                        [appt.id]: star,
                                      }))
                                    }
                                    className={`text-3xl transition-all duration-150 hover:scale-110 ${
                                      hoveredStar[appt.id] >= star ||
                                      ratings[appt.id] >= star
                                        ? "text-yellow-400"
                                        : "text-gray-300 hover:text-yellow-200"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => handleSubmitRating(appt.id)}
                                className="px-5 py-2 text-black bg-gradient-to-br from-blue-50 to-indigo-50  font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                              >
                                Submit Rating
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Given Rating Display */}
                        {appt.rating_given && (
                          <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
                            <svg
                              className="w-5 h-5 text-yellow-500 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-xs text-amber-700">
                              You have rated successfully.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rating Section */}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
    </div>
  );
}

export default UserDashboard;
