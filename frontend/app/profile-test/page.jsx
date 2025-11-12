"use client";

import React, { useState } from "react";
import {
  User,
  FileText,
  Settings,
  Calendar,
  FileDown,
  Copy,
  Link,
} from "lucide-react";

export default function UserProfileDashboard() {
  const [formData, setFormData] = useState({
    firstName: "Cameron",
    lastName: "Williamson",
    country: "Spain",
    location: "Remote",
    address: "Plaza del Rey No. 1",
    zipCode: "28004",
    team: "Product & IT",
    email: "cameron_williamson@gmail.com",
    currentPassword: "",
    newPassword: "",
    language: "English (US)",
    timezone: "GMT+07:00",
  });

  const [activeSection, setActiveSection] = useState("profile");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const projects = [
    { name: "Current Projects", color: "bg-yellow-400", progress: 25 },
    { name: "Web Design", color: "bg-green-400", progress: 25 },
    { name: "Design Systems", color: "bg-pink-400", progress: 50 },
    { name: "Web Flow Development", color: "bg-blue-400", progress: 75 },
  ];

  const connectedAccounts = [
    { name: "Slack account", url: "www.slack.com", icon: "💬" },
    { name: "Trello account", url: "www.trello.com", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="bg-white rounded-b-xl shadow-sm border-x border-b border-gray-200">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 p-6">
              {/* Profile Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  Cameron Williamson
                </h2>
                <p className="text-sm text-gray-500">
                  cameron_williamson@gmail.com
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <span>📊</span> Dashboard
                </button>
                <button
                  onClick={() => setActiveSection("profile")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-gray-100 text-gray-900 rounded-lg font-medium"
                >
                  <User className="w-4 h-4" /> Personal Information
                </button>
                <button
                  onClick={() => setActiveSection("documents")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <FileText className="w-4 h-4" /> Retirement Plans
                </button>
                <button
                  onClick={() => setActiveSection("settings")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Settings className="w-4 h-4" /> Life Style Planning
                </button>
                <button
                  onClick={() => setActiveSection("schedule")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Calendar className="w-4 h-4" /> Dream Plans
                </button>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8">
              <div className="">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* General Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      General Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Country
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        >
                          <option>Spain</option>
                          <option>USA</option>
                          <option>UK</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Location
                        </label>
                        <select
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        >
                          <option>Remote</option>
                          <option>Office</option>
                          <option>Hybrid</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Team
                        </label>
                        <input
                          type="text"
                          name="team"
                          value={formData.team}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                        Cancel
                      </button>
                      <button className="px-6 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
