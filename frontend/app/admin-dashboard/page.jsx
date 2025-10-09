"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserCheck, Clock, CheckCircle, XCircle, Mail, GraduationCap, TrendingUp } from "lucide-react";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    axios
      .get("http://localhost:8000/api/v1/admin/advisor-requests/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleAction = (id, action) => {
    const token = localStorage.getItem("access");
    setLoading(true);

    axios
      .post(
        "http://localhost:8000/api/v1/admin/advisor-requests/",
        { id, action },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setRequests(requests.filter((r) => r.id !== id));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/user/clients-list/")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/advisor/advisors-list/")
      .then((res) => {
        setAdvisors(res.data);
      })
      .catch((err) => {
        console.error("Error fetching advisors:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-300">Manage your platform with ease</p>
            </div>
            <div className="flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-400/30">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-purple-200 font-semibold">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/30 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-purple-300" />
              </div>
              <span className="text-3xl font-bold text-white">{requests.length}</span>
            </div>
            <h3 className="text-slate-300 font-medium">Pending Requests</h3>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/30 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <span className="text-3xl font-bold text-white">{users.length}</span>
            </div>
            <h3 className="text-slate-300 font-medium">Total Users</h3>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/30 p-3 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-300" />
              </div>
              <span className="text-3xl font-bold text-white">{advisors.length}</span>
            </div>
            <h3 className="text-slate-300 font-medium">Active Advisors</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-black/30 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "requests"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Advisor Requests
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "users"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("advisors")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "advisors"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Advisors
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === "requests" && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-purple-400" />
              Pending Advisor Requests
            </h2>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No pending requests at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="bg-purple-500/30 p-2 rounded-lg">
                            <Users className="w-4 h-4 text-purple-300" />
                          </div>
                          <span className="text-white font-semibold text-lg">{req.full_name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-300">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <span>{req.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-300">
                          <GraduationCap className="w-4 h-4 text-green-400" />
                          <span>{req.highest_qualification}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          disabled={loading}
                          onClick={() => handleAction(req.id, "accept")}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-green-500/30 hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(req.id, "decline")}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-red-500/30 hover:scale-105"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-400" />
              Registered Users
            </h2>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No users registered yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500/30 p-3 rounded-full">
                        <Users className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.username}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "advisors" && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <UserCheck className="w-6 h-6 mr-3 text-green-400" />
              Verified Advisors
            </h2>
            {advisors.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No verified advisors yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advisors.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500/30 p-3 rounded-full">
                        <UserCheck className="w-5 h-5 text-green-300" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{advisor.username}</p>
                        <p className="text-slate-400 text-sm">{advisor.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;