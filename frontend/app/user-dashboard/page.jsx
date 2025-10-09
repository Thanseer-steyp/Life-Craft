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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <Link href="/login" className="mt-6 inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const totalBudget = userData.dreams?.reduce((sum, dream) => sum + parseFloat(dream.budget || 0), 0) || 0;
  const totalSavings = userData.dreams?.reduce((sum, dream) => sum + parseFloat(dream.current_savings || 0), 0) || 0;
  const progressPercentage = totalBudget > 0 ? (totalSavings / totalBudget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {userData.profile_image ? (
              <img
                src={`http://localhost:8000${userData.profile_image}`}
                alt="Profile"
                className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-32 w-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-5xl font-bold">{userData.first_name?.[0] || userData.username?.[0] || "U"}</span>
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">Welcome back, {userData.first_name || userData.username}! 👋</h1>
              <p className="text-purple-100 text-lg">{userData.email}</p>
              {userData.bio && <p className="mt-2 text-white text-opacity-90">{userData.bio}</p>}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Dreams</p>
                <p className="text-3xl font-bold text-gray-800">{userData.dreams?.length || 0}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Savings</p>
                <p className="text-3xl font-bold text-gray-800">${totalSavings.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Target Budget</p>
                <p className="text-3xl font-bold text-gray-800">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        {totalBudget > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Overall Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{progressPercentage.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Username</span>
                <span className="font-semibold text-gray-800">{userData.username}</span>
              </div>
              {userData.age && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Age</span>
                  <span className="font-semibold text-gray-800">{userData.age}</span>
                </div>
              )}
              {userData.retirement_age && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Retirement Age</span>
                  <span className="font-semibold text-gray-800">{userData.retirement_age}</span>
                </div>
              )}
              {userData.interests && (
                <div className="py-2">
                  <span className="text-gray-600 block mb-2">Interests</span>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.split(',').map((interest, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dreams Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Your Dreams
              </h2>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {userData.dreams?.length || 0} Active
              </span>
            </div>
            
            {userData.dreams && userData.dreams.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {userData.dreams.map((dream, index) => {
                  const dreamProgress = dream.budget > 0 ? (dream.current_savings / dream.budget) * 100 : 0;
                  return (
                    <div
                      key={dream.id}
                      className="border-2 border-gray-100 p-5 rounded-xl bg-gradient-to-br from-white to-purple-50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{dream.dream_name}</h3>
                          {dream.description && (
                            <p className="text-gray-600 text-sm mb-3">{dream.description}</p>
                          )}
                        </div>
                        <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          #{index + 1}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Target Budget</p>
                          <p className="text-lg font-bold text-gray-800">${parseFloat(dream.budget).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Current Savings</p>
                          <p className="text-lg font-bold text-green-600">${parseFloat(dream.current_savings).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Timeline</p>
                          <p className="text-lg font-bold text-blue-600">{dream.timeline_months}m</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs font-bold text-purple-600">{dreamProgress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(dreamProgress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">No dreams added yet</p>
                <p className="text-gray-400 text-sm">Start your journey by adding your first dream!</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to achieve your dreams?</h3>
          <p className="text-purple-100 mb-6">Get personalized advice from our expert financial advisors</p>
          <Link 
            href="/booking-appoinment" 
            className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
          >
            📅 Consult an Advisor
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Page;