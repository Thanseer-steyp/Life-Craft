"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Users,
  User,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  GraduationCap,
  ScanSearch,
} from "lucide-react";

function AdminDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("login-status-changed"));
    router.push("/authentication");
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    axios
      .get("http://localhost:8000/api/v1/admin/advisor-requests/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRequests(res.data);
      })
      .catch((err) => {
        console.error("Error fetching advisor requests:", err);
      });
  }, []);

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

  const handleAction = async (id, action) => {
    const token = localStorage.getItem("access");
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8000/api/v1/admin/advisor-requests/",
        { id, action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state after successful action
      const updatedRequests = requests.filter((r) => r.id !== id);
      setRequests(updatedRequests);

      const affectedRequest = requests.find((r) => r.id === id);

      if (action === "accept" && affectedRequest) {
        setAdvisors((prev) => [...prev, affectedRequest]);
        setUsers((prev) =>
          prev.filter((u) => u.email !== affectedRequest.email)
        );
      }
    } catch (err) {
      console.error("Error updating advisor request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="wrapper py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage your platform with ease</p>
            </div>
            <div className="flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full border border-red-200" onClick={handleLogout}>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-semibold text-sm select-none">Logout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wrapper py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {requests.length}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">
              Pending Advisor Requests
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {users.length}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Verified Users</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {advisors.length}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Verified Advisors</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-8 mb-6 bg-white p-1.5 rounded-xl border border-gray-200 shadow-md">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "requests"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Advisor Requests
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "users"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("advisors")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "advisors"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Advisors
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-purple-600" />
              Pending Advisor Requests
            </h2>

            {requests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No pending requests at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-6 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-800 font-semibold text-lg">
                              {req.full_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span>{req.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <GraduationCap className="w-4 h-4 text-green-500" />
                            <span className="capitalize">
                              {req.advisor_type}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              setSelectedRequest(isSelected ? null : req)
                            }
                            className={`${
                              isSelected
                                ? "bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700"
                                : "bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-500 hover:to-blue-900"
                            } text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg hover:-translate-y-0.5`}
                          >
                            <ScanSearch className="w-4 h-4" />
                            <span>
                              {isSelected ? "Close Data" : "View Data"}
                            </span>
                          </button>

                          <button
                            disabled={loading}
                            onClick={() => handleAction(req.id, "accept")}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 shadow-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept</span>
                          </button>

                          <button
                            disabled={loading}
                            onClick={() => handleAction(req.id, "decline")}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 shadow-md"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>

                      {/* Show detailed section when selected */}
                      {selectedRequest && selectedRequest.id === req.id && (
                        <div className="mt-6 bg-white border-t border-gray-300 pt-6 rounded-xl p-6 shadow-inner">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Left: Profile Photo */}
                            <div className="w-1/4">
                              <img
                                src={`http://localhost:8000${selectedRequest.profile_photo}`}
                                alt="Profile"
                                className="w-full rounded-2xl border border-gray-200 shadow-sm"
                              />
                              <div className="mt-4 space-y-3">
                                <a
                                  href={
                                    selectedRequest.educational_certificate
                                      ? `http://localhost:8000${selectedRequest.educational_certificate}`
                                      : "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block ${
                                    selectedRequest.educational_certificate
                                      ? "text-blue-600 hover:underline"
                                      : "text-red-500 pointer-events-none"
                                  }`}
                                >
                                  📄{" "}
                                  {selectedRequest.educational_certificate
                                    ? "View Educational Certificate"
                                    : "Educational Certificate Not Provided"}
                                </a>

                                <a
                                  href={
                                    selectedRequest.resume
                                      ? `http://localhost:8000${selectedRequest.resume}`
                                      : "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block ${
                                    selectedRequest.resume
                                      ? "text-blue-600 hover:underline"
                                      : "text-red-500 pointer-events-none"
                                  }`}
                                >
                                  📘{" "}
                                  {selectedRequest.resume
                                    ? "View Resume"
                                    : "Resume Not Provided"}
                                </a>

                                <a
                                  href={
                                    selectedRequest.govt_id_file
                                      ? `http://localhost:8000${selectedRequest.govt_id_file}`
                                      : "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block ${
                                    selectedRequest.govt_id_file
                                      ? "text-blue-600 hover:underline"
                                      : "text-red-500 pointer-events-none"
                                  }`}
                                >
                                  🪪{" "}
                                  {selectedRequest.govt_id_file
                                    ? `View Govt ID (${selectedRequest.govt_id_type})`
                                    : "Govt ID Not Provided"}
                                </a>
                              </div>
                            </div>

                            {/* Right: Details */}
                            <div className="grid grid-cols-2 gap-4 w-3/4 text-black">
                              <p>
                                <strong>Full Name:</strong>{" "}
                                {selectedRequest.full_name}
                              </p>
                              <p>
                                <strong>Year/Age:</strong> {selectedRequest.dob_year} ({new Date().getFullYear() - selectedRequest.dob_year} Years)
                              </p>
                              <p>
                                <strong>Gender:</strong>{" "}
                                {selectedRequest.gender}
                              </p>
                              <p>
                                <strong>Email:</strong> {selectedRequest.email}
                              </p>
                              <p>
                                <strong>Phone:</strong>{" "}
                                {selectedRequest.phone_number}
                              </p>
                              <p>
                                <strong>Address:</strong>{" "}
                                {selectedRequest.state_address},{" "}
                                {selectedRequest.country_address}
                              </p>
                              <p>
                                <strong>Languages:</strong>{" "}
                                {selectedRequest.language_preferences}
                              </p>
                              <p className="capitalize">
                                <strong>Advisor Type:</strong>{" "}
                                {selectedRequest.advisor_type}
                              </p>
                              <p>
                                <strong>Experience:</strong>{" "}
                                {selectedRequest.experience_years} years
                              </p>
                              <p>
                                <strong>Company:</strong>{" "}
                                {selectedRequest.company ? (
                                  selectedRequest.company
                                ) : (
                                  <span className="text-red-500 font-medium">
                                    Not provided
                                  </span>
                                )}
                              </p>
                              <p>
                                <strong>Designation:</strong>{" "}
                                {selectedRequest.designation ? (
                                  selectedRequest.designation
                                ) : (
                                  <span className="text-red-500 font-medium">
                                    Not provided
                                  </span>
                                )}
                              </p>
                              <p className="capitalize">
                                <strong>Qualification:</strong>{" "}
                                {selectedRequest.highest_qualification}
                              </p>
                              <p>
                                <strong>Specialized In:</strong>{" "}
                                {selectedRequest.specialized_in ? (
                                  selectedRequest.specialized_in
                                ) : (
                                  <span className="text-red-500 font-medium">
                                    Not provided
                                  </span>
                                )}
                              </p>
                              <p>
                                <strong>Previous Companies:</strong>{" "}
                                {selectedRequest.previous_companies ? (
                                  selectedRequest.previous_companies
                                ) : (
                                  <span className="text-red-500 font-medium">
                                    Not provided
                                  </span>
                                )}
                              </p>
                              <p className="capitalize">
                                <strong>ID Proof:</strong>{" "}
                                {selectedRequest.govt_id_type}
                              </p>
                              <p>
                                <strong>Proof No:</strong>{" "}
                                {selectedRequest.govt_id_proof_id}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-600" />
              Registered Users
            </h2>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users registered yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {user.first_name}
                        </p>
                        <p className="text-gray-500 text-sm">{user.username}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "advisors" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <UserCheck className="w-6 h-6 mr-3 text-green-600" />
              Verified Advisors
            </h2>
            {advisors.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No verified advisors yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advisors.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-3 rounded-full">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {advisor.full_name}
                        </p>
                        <p className="text-gray-500 text-sm">{advisor.email}</p>
                        <p className="text-gray-500 text-sm capitalize">
                          {advisor.advisor_type} Advisor
                        </p>
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
