"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, User, Video, Phone, Loader } from "lucide-react";

function AdvisorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [formData, setFormData] = useState({});

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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "from-yellow-500/20 to-orange-500/20 border-yellow-400/50 text-yellow-300";
      case "accepted":
        return "from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-300";
      case "declined":
        return "from-red-500/20 to-pink-500/20 border-red-400/50 text-red-300";
      default:
        return "from-slate-500/20 to-gray-500/20 border-slate-400/50 text-slate-300";
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "google_meet":
      case "zoom":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "whatsapp":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    accepted: appointments.filter((a) => a.status === "accepted").length,
    declined: appointments.filter((a) => a.status === "declined").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Advisor Dashboard
          </h1>
          <p className="text-slate-300 text-lg">Manage your appointment requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-slate-300 font-medium">Total Requests</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{stats.pending}</span>
            </div>
            <p className="text-slate-300 font-medium">Pending</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{stats.accepted}</span>
            </div>
            <p className="text-slate-300 font-medium">Accepted</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-400" />
              <span className="text-3xl font-bold text-white">{stats.declined}</span>
            </div>
            <p className="text-slate-300 font-medium">Declined</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <Loader className="w-12 h-12 text-purple-400 animate-spin" />
              <p className="text-slate-300 text-lg">Loading appointments...</p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No appointments yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-purple-400/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="bg-purple-500/30 p-3 rounded-full">
                      <User className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{appt.user_name}</h2>
                      <p className="text-sm text-slate-400">
                        Requested on {new Date(appt.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(appt.status)} border backdrop-blur-sm`}>
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </div>
                </div>

                {appt.status === "accepted" && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-6 mb-4">
                    <h3 className="text-green-300 font-semibold mb-4 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Appointment Confirmed</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-200">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-xs text-slate-400">Date</p>
                          <p className="font-medium">{appt.preferred_day}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-xs text-slate-400">Time</p>
                          <p className="font-medium">{appt.preferred_time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(appt.communication_method)}
                        <div>
                          <p className="text-xs text-slate-400">Method</p>
                          <p className="font-medium">{appt.communication_method}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {appt.status === "declined" && (
                  <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-400/30 rounded-xl p-6 mb-4">
                    <h3 className="text-red-300 font-semibold mb-3 flex items-center space-x-2">
                      <XCircle className="w-5 h-5" />
                      <span>Declined</span>
                    </h3>
                    <p className="text-slate-300">
                      <span className="font-medium">Reason:</span> {appt.decline_message || "No reason provided"}
                    </p>
                  </div>
                )}

                {appt.status === "pending" && (
                  <div className="space-y-4">
                    {acceptingId === appt.id && (
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                        <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Accept Appointment</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span>Preferred Date</span>
                            </label>
                            <input
                              type="date"
                              className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                              onChange={(e) => handleChange(appt.id, "preferred_day", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span>Preferred Time</span>
                            </label>
                            <input
                              type="time"
                              className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                              onChange={(e) => handleChange(appt.id, "preferred_time", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium flex items-center space-x-2">
                              <Video className="w-4 h-4 text-purple-400" />
                              <span>Communication Method</span>
                            </label>
                            <select
                              className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                              onChange={(e) => handleChange(appt.id, "communication_method", e.target.value)}
                            >
                              <option value="">Select Method</option>
                              <option value="google_meet">Google Meet</option>
                              <option value="whatsapp">WhatsApp Video Call</option>
                              <option value="zoom">Zoom</option>
                              <option value="phone">Phone Call</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => submitAccept(appt.id)}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span>Confirm Accept</span>
                          </button>
                          <button
                            onClick={() => setAcceptingId(null)}
                            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-600 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {decliningId === appt.id && (
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                        <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                          <XCircle className="w-5 h-5 text-red-400" />
                          <span>Decline Appointment</span>
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium">Reason for Declining</label>
                            <textarea
                              placeholder="Please provide a reason..."
                              className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 min-h-32 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                              onChange={(e) => handleChange(appt.id, "decline_message", e.target.value)}
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => submitDecline(appt.id)}
                              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                            >
                              <XCircle className="w-5 h-5" />
                              <span>Confirm Decline</span>
                            </button>
                            <button
                              onClick={() => setDecliningId(null)}
                              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-600 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {acceptingId !== appt.id && decliningId !== appt.id && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setAcceptingId(appt.id)}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => setDecliningId(appt.id)}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvisorDashboard;