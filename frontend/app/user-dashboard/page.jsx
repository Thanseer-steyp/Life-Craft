"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/components/config/axiosInstance";

export default function DashboardPage() {
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

    axiosInstance
      .get("api/v1/user/user-dashboard/")
      .then((res) => setUserData(res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const profile = userData.profile || {};

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto text-black space-y-6">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* --- Basic Info --- */}
      <div className="border p-4 rounded bg-gray-50 space-y-2">
        <h2 className="text-xl font-semibold mb-2">Basic Info</h2>
        <p>
          <strong>Username:</strong> {userData.username}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Full Name:</strong> {userData.name}
        </p>
        {profile.dob && (
          <p>
            <strong>Date of Birth:</strong> {profile.dob}
          </p>
        )}
        {profile.gender && (
          <p>
            <strong>Gender:</strong> {profile.gender}
          </p>
        )}
        {profile.marital_status && (
          <p>
            <strong>Marital Status:</strong> {profile.marital_status}
          </p>
        )}
        {profile.phone_number && (
          <p>
            <strong>Phone:</strong> {profile.phone_number}
          </p>
        )}
        {profile.country && (
          <p>
            <strong>Country:</strong> {profile.country}
          </p>
        )}
        {profile.state && (
          <p>
            <strong>State:</strong> {profile.state}
          </p>
        )}
        {profile.job && (
          <p>
            <strong>Occupation:</strong> {profile.job}
          </p>
        )}
        {profile.monthly_income && (
          <p>
            <strong>Monthly Income:</strong> ₹{profile.monthly_income}
          </p>
        )}
        {profile.bio && (
          <p>
            <strong>Bio:</strong> {profile.bio}
          </p>
        )}
        {profile.interests && (
          <p>
            <strong>Interests:</strong> {profile.interests}
          </p>
        )}
        {profile.profile_picture && (
          <img
            src={`${axiosInstance.defaults.baseURL}${profile.profile_picture}`}
            alt="Profile"
            className="h-32 w-32 object-cover rounded-full mt-2"
          />
        )}
      </div>

      {/* --- Retirement Planning --- */}
      <div className="border p-4 rounded bg-gray-50 space-y-2">
        <h2 className="text-xl font-semibold mb-2">Retirement Planning</h2>
        {profile.retirement_planning_age && (
          <p>
            <strong>Planned Retirement Age:</strong>{" "}
            {profile.retirement_planning_age}
          </p>
        )}
        {profile.current_savings && (
          <p>
            <strong>Current Savings:</strong> ₹{profile.current_savings}
          </p>
        )}
        {profile.expected_savings_at_retirement && (
          <p>
            <strong>Expected Savings at Retirement:</strong> ₹
            {profile.expected_savings_at_retirement}
          </p>
        )}
        <div>
          <strong>Post-Retirement Lifestyle:</strong>
          <ul className="list-disc ml-6">
            {profile.post_retirement_travel && <li>Travel</li>}
            {profile.post_retirement_hobbies && <li>Hobbies</li>}
            {profile.post_retirement_family_together && (
              <li>Family Together</li>
            )}
            {profile.post_retirement_social_work && <li>Social Work</li>}
            {profile.post_retirement_garage && <li>Garage/Car Projects</li>}
            {profile.post_retirement_luxury_life && <li>Luxury Life</li>}
          </ul>
        </div>
        {profile.retirement_location_preference && (
          <p>
            <strong>Preferred Retirement Location:</strong>{" "}
            {profile.retirement_location_preference}
          </p>
        )}
      </div>

      {/* --- Dreams --- */}
      <div className="border p-4 rounded bg-gray-50 space-y-2">
        <h2 className="text-xl font-semibold mb-2">Dreams</h2>
        {profile.dream_type && (
          <p>
            <strong>Dream Type:</strong> {profile.dream_type}
          </p>
        )}
        {profile.top_dream_1 && (
          <p>
            <strong>Top Dream 1:</strong> {profile.top_dream_1}
          </p>
        )}
        {profile.top_dream_2 && (
          <p>
            <strong>Top Dream 2:</strong> {profile.top_dream_2}
          </p>
        )}
        {profile.top_dream_3 && (
          <p>
            <strong>Top Dream 3:</strong> {profile.top_dream_3}
          </p>
        )}
        {profile.dream_description && (
          <p>
            <strong>Dream Description:</strong> {profile.dream_description}
          </p>
        )}
        {profile.initial_plan && (
          <p>
            <strong>Initial Plan:</strong> {profile.initial_plan}
          </p>
        )}
      </div>

      <Link
        href="/booking-appoinment"
        className="p-3 bg-amber-700 text-white font-bold rounded-2xl inline-block"
      >
        Consult an Advisor
      </Link>
    </div>
  );
}
