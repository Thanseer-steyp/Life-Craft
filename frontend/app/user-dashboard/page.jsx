"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

function Page() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:8000/api/v1/user/user-dashboard/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserData(res.data);
      })
      .catch(() => {
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* Profile Info */}
      <div className="mb-6">
        <p><strong>Username:</strong> {userData.username}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>First Name:</strong> {userData.first_name}</p>
        {userData.age && <p><strong>Age:</strong> {userData.age}</p>}
        {userData.retirement_age && <p><strong>Retirement Age:</strong> {userData.retirement_age}</p>}
        {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}
        {userData.interests && <p><strong>Interests:</strong> {userData.interests}</p>}
        {userData.profile_image && (
          <img
            src={`http://localhost:8000${userData.profile_image}`}
            alt="Profile"
            className="h-32 w-32 object-cover rounded-full mt-4"
          />
        )}
      </div>

      {/* Dreams Info */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Dreams</h2>
        {userData.dreams && userData.dreams.length > 0 ? (
          userData.dreams.map((dream) => (
            <div
              key={dream.id}
              className="border p-4 rounded mb-4 bg-gray-50"
            >
              <p><strong>Dream Name:</strong> {dream.dream_name}</p>
              <p><strong>Budget:</strong> ${dream.budget}</p>
              <p><strong>Timeline (months):</strong> {dream.timeline_months}</p>
              <p><strong>Current Savings:</strong> ${dream.current_savings}</p>
              {dream.description && <p><strong>Description:</strong> {dream.description}</p>}
            </div>
          ))
        ) : (
          <p>No dreams added yet.</p>
        )}
      </div>

      <Link href="/booking-appoinment" className="p-3 bg-amber-700 text-white font-bold rounded-2xl">Consult an Advisor</Link>
    </div>
  );
}

export default Page;
