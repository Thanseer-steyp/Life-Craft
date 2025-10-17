"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import axios from "axios";

function Header() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
      <div className="wrapper py-3 flex justify-between items-center">
        {/* Logo */}
        <h1>
          <Link href="/" className="flex gap-1 items-center">
            <img src="/logo.png" alt="Logo" className="w-8" />
            <h2 className="text-lg font-extrabold text-black">LifeCraft</h2>
          </Link>
        </h1>

        {/* Navigation */}
        <nav className="gap-5 hidden md:flex items-center text-black text-sm">
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">
            Features
          </Link>
          <Link
            href="/booking-appoinment"
            className="p-2.5 rounded-md hover:bg-gray-100"
          >
            Advisors
          </Link>
          <Link
            href="/user-inbox"
            className="p-2.5 rounded-md hover:bg-gray-100"
          >
            Inbox
          </Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">
            About Us
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="relative" ref={profileRef}>
          {user ? (
            <>
              {/* Avatar */}
              <div
                onClick={() => setShowProfile(!showProfile)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-bold cursor-pointer select-none z-50 relative overflow-hidden"
              >
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

              {/* Centered Profile Modal */}
              {showProfile && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border shadow-2xl rounded-2xl pt-8 pb-4 px-5 animate-popUp z-40"
                  style={{ transformOrigin: "top center" }}
                >
                  <div className="mt-5 text-center">
                    <p className="font-semibold text-gray-800">
                      {user.name || user.username}
                    </p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>

                  <Link
                    href="/user-dashboard"
                    className="w-full mt-4 py-2 bg-blue-500 text-white block text-center rounded-lg hover:bg-blue-600 transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/authentication"
              className={`p-2.5 shadow-xl text-sm rounded-md font-bold hover:bg-gray-100 ${
                isScrolled ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
