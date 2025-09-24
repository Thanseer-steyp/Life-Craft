"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdvisorDashboard() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/advisor/inbox/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📥 Your Inbox</h1>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="p-4 border rounded-lg shadow">
              <p className="font-semibold">{msg.sender_name}</p>
              <p className="text-gray-700">{msg.content}</p>
              <p className="text-sm text-gray-500">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
