"use client";
import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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
        // Update the list locally
        setRequests(requests.filter((r) => r.id !== id));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome Admin</h1>
      <h3 className="text-xl font-semibold mb-4">Advisor Requests</h3>

      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Name:</strong> {req.name}
                </p>
                <p>
                  <strong>Email:</strong> {req.user_email}
                </p>
                <p>
                  <strong>Education:</strong> {req.education}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={loading}
                  onClick={() => handleAction(req.id, "accept")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleAction(req.id, "decline")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
