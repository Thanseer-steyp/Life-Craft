"use client";
import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [advisors, setAdvsiors] = useState([]);

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

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/user/clients-list/") // 👈 match your Django URL
      .then((res) => {
        setUsers(res.data); // store response in state
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/advisor/advisors-list/") // 👈 match your Django URL
      .then((res) => {
        setAdvsiors(res.data); // store response in state
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  return (
    <div className="p-6 space-y-15">
      <h1 className="text-4xl font-bold text-center">Welcome Admin</h1>
      <div>
        <h3 className="text-2xl font-semibold">Advisor Requests</h3>

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
                    <strong>Name:</strong> {req.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {req.email}
                  </p>
                  <p>
                    <strong>Education:</strong> {req.highest_qualification}
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
      <div>
        <h2 className="text-2xl font-bold mt-4">User List</h2>
        {users.length === 0 ? (
          <p>No users registered</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.username} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mt-4">Advisors List</h2>
        {advisors.length === 0 ? (
          <p>No verified advisors</p>
        ) : (
          <ul>
            {advisors.map((user) => (
              <li key={user.id}>
                {user.username} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
