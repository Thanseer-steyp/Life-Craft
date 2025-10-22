"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import axios from "axios";

function Header() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userRole, setUserRole] = useState("User");
  const profileRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/user-dashboard/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data);
        console.log(res.data);
      } catch (err) {
        console.error(err);
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    const checkAdvisor = async () => {
      if (!user?.email) return;

      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/advisors-list/"
        );
        const advisors = res.data;

        const isAdvisor = advisors.some(
          (advisor) => advisor.email === user.email
        );
        setUserRole(isAdvisor ? "Advisor" : "User");
      } catch (err) {
        console.error("Error fetching advisor list:", err);
      }
    };

    checkAdvisor();
  }, [user]);

  useEffect(() => {
    const handleLogin = () => {
      setToken(localStorage.getItem("access"));
    };
    window.addEventListener("login", handleLogin);
    return () => window.removeEventListener("login", handleLogin);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("login-status-changed"));
    window.location.reload();
  };

  return (
    <div
      className={`sticky top-0 left-0 w-full bg-white transition-shadow duration-150 z-50 ${
        isScrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="py-3 px-6 flex justify-between items-center">
        {/* Logo */}
        <h1>
          <Link href="/" className="flex gap-1 items-center">
            <img src="/logo.png" alt="Logo" className="w-8" />
            <h2 className="text-lg font-extrabold text-black">LifeCraft</h2>
          </Link>
        </h1>

        {/* Navigation */}
        <nav className="gap-5 hidden md:flex items-center text-black text-sm">
          <Link
            href="/booking-appoinment"
            className="p-2.5 rounded-md hover:bg-gray-100 link-hover"
          >
            Advisors
          </Link>
          <Link
            href="/"
            className="p-2.5 rounded-md hover:bg-gray-100 link-hover"
          >
            Features
          </Link>
          <Link
            href="/"
            className="p-2.5 rounded-md hover:bg-gray-100 link-hover"
          >
            About Us
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white shadow-xl h-11 p-1.5 rounded-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B7280"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-search-icon lucide-search"
              >
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Find anything you want..."
              className="text-[#6B7280] w-[300px] ml-1.5 outline-none focus:outline-none"
            />
          </div>
          <Link
            href="/user-inbox"
            className="bg-white shadow-xl rounded-lg w-11 h-11 flex items-center justify-center hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-bell-icon lucide-bell"
            >
              <path d="M10.268 21a2 2 0 0 0 3.464 0" />
              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
            </svg>
          </Link>
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="bg-white shadow-xl rounded-lg w-11 h-11 flex items-center justify-center hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-settings-icon lucide-settings"
            >
              <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          <div className="relative" ref={profileRef}>
            {user ? (
              <>
                {/* Avatar */}
                <div className="flex items-center gap-1">
                <Link
                  href="/user-dashboard"
                  className="px-2 py-1 bg-white shadow-xl rounded-lg flex hover:bg-gray-50"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-black text-white font-bold cursor-pointer select-none z-50 relative overflow-hidden">
                    {user.profile?.profile_picture ? (
                      <img
                        src={`http://localhost:8000${user.profile.profile_picture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase() ||
                      user.username?.charAt(0).toUpperCase() ||
                      "🧑"
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-black text-sm">{user.name}</p>
                    <p className="text-gray-500 text-xs">{userRole}</p>
                  </div>
                  
                </Link>
                <button
                    onClick={handleLogout}
                    className="px-2 py-1 bg-white shadow-xl rounded-lg flex hover:bg-gray-50 w-11 h-11 items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-log-out-icon lucide-log-out"
                    >
                      <path d="m16 17 5-5-5-5" />
                      <path d="M21 12H9" />
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    </svg>
                  </button>
                </div>

                {/* Centered Profile Modal */}
                {/* {showProfile && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border shadow-2xl rounded-2xl pt-8 pb-4 px-5 animate-popUp z-40"
                    style={{ transformOrigin: "top center" }}
                  >
                    

                    
                    <button
                      onClick={handleLogout}
                      className="w-full mt-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
                    </button>
                  </div>
                )} */}
              </>
            ) : (
              <Link
                href="/authentication"
                className={`p-2.5 py-3.25 shadow-xl text-sm rounded-md font-bold hover:bg-gray-100 ${
                  isScrolled ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
