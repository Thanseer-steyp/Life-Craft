"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";

function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State to toggle menu
  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    setToken(storedToken);
  }, []);
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden"; // stop scrolling
    } else {
      document.body.style.overflow = ""; // restore scrolling
    }

    // cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

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
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`"relative bg-white p-1.5 hover:bg-gray-50 shadow-lg w-max rounded-md h-9 flex flex-col justify-between items-center transition duration-300" ${
                showMenu ? "" : ""
              }`}
            >
              <div
                className={`w-8 h-[4px] bg-gray-500 rounded transition-all duration-300 ${
                  showMenu ? "rotate-45 translate-y-[11px]" : ""
                }`}
              ></div>
              <div
                className={`w-8 h-[4px] bg-gray-500 rounded transition-all duration-300 ${
                  showMenu ? "opacity-0" : ""
                }`}
              ></div>
              <div
                className={`w-8 h-[4px] bg-gray-500 rounded transition-all duration-300 ${
                  showMenu ? "-rotate-45 -translate-y-[9px]" : ""
                }`}
              ></div>
            </button>
          </div>

          <h1>
            <Link href="/" className="flex gap-1 items-center">
              <img src="/logo.png" alt="Logo" className="w-12" />
            </Link>
          </h1>
        </div>

        <nav className="gap-5 hidden md:flex items-center text-black text-sm">
          <Link
            href="/"
            className={`p-2.5 rounded-md link-hover ${pathname === "/" ? "shadow-lg -translate-y-0.5" : ""}`}
          >
            Home
          </Link>
          <Link
            href="/features"
            className={`p-2.5 rounded-md link-hover ${pathname === "/features" ? "shadow-lg -translate-y-0.5" : ""}`}
          >
            Features
          </Link>
          <Link
            href="/about"
            className={`p-2.5 rounded-md link-hover ${pathname === "/about" ? "shadow-lg -translate-y-0.5" : ""}`}
          >
            About Us
          </Link>
          <Link
            href="/reviews"
            className={`p-2.5 rounded-md link-hover ${pathname === "/reviews" ? "shadow-lg -translate-y-0.5" : ""}`}
          >
            Reviews
          </Link>
          <Link
            href="/contact"
            className={`p-2.5 rounded-md link-hover ${pathname === "/contact" ? "shadow-lg -translate-y-0.5" : ""}`}
          >
            Contact Us
          </Link>
        </nav>

        {/* <div className="flex items-center bg-white shadow-xl h-11 p-1.5 rounded-lg">
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
        </div> */}

        <div className="flex items-center gap-3">
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

          <div className="relative">
            {user ? (
              <>
                {/* Avatar */}
                <div className="flex items-center gap-1">
                  <Link
                    href="/user-dashboard"
                    className="px-2 py-1 bg-white shadow-xl rounded-lg flex hover:bg-gray-50"
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-white font-bold cursor-pointer select-none z-50 relative overflow-hidden">
                      {user.profile?.profile_picture ? (
                        <img
                          src={`http://localhost:8000${user.profile.profile_picture}`}
                          alt="Profile"
                          className="w-full h-full"
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
                </div>
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
      <div
        style={{ height: "calc(100vh - 64px)" }}
        className={`fixed inset-0 top-[68px] z-40 bg-black/30 transition-opacity duration-300 ${
          showMenu ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowMenu(false)}
      />

      {/* Sidebar */}
      <nav
        style={{ height: "calc(100vh - 64px)" }}
        className={`fixed top-[68px] left-0 w-1/5 bg-[#f9f9fb] text-black p-5 flex flex-col justify-between transform transition-transform duration-300 z-50 ${
          showMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Menu Items */}
        <div className="space-y-3">
          {/* Advisors */}
          <Link
            href="/booking-appoinment"
            onClick={() => setShowMenu(false)}
            className={`flex gap-2 items-center py-2 px-4 text-sm rounded-md transition ${
              pathname === "/booking-appoinment"
                ? "text-green-600 font-medium border-l-4 border-green-500 bg-green-50"
                : "text-black hover:shadow-lg border-transparent hover:-translate-x-0.5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={pathname === "/booking-appoinment" ? "#16a34a" : "#000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-speech"
            >
              <path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20" />
              <path d="M19.8 17.8a7.5 7.5 0 0 0 .003-10.603" />
              <path d="M17 15a3.5 3.5 0 0 0-.025-4.975" />
            </svg>
            Advisors
          </Link>

          {/* Appointments */}
          <Link
            href="/user-inbox"
            onClick={() => setShowMenu(false)}
            className={`flex gap-2 items-center py-2 px-4 text-sm rounded-md transition ${
              pathname === "/user-inbox"
                ? "text-green-600 font-medium border-l-4 border-green-500 bg-green-50"
                : "text-black hover:shadow-lg border-transparent hover:-translate-x-0.5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={pathname === "/user-inbox" ? "#16a34a" : "#000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-clipboard-clock"
            >
              <path d="M16 14v2.2l1.6 1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v.832" />
              <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2" />
              <circle cx="16" cy="16" r="6" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
            Appointments
          </Link>

          {/* Connect with Friends */}
          <Link
            href="/connect-friends"
            onClick={() => setShowMenu(false)}
            className={`flex gap-2 items-center py-2 px-4 text-sm rounded-md transition ${
              pathname === "/connect-friends"
                ? "text-green-600 font-medium border-l-4 border-green-500 bg-green-50"
                : "text-black hover:shadow-lg border-transparent hover:-translate-x-0.5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={pathname === "/connect-friends" ? "#16a34a" : "#000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-handshake"
            >
              <path d="m11 17 2 2a1 1 0 1 0 3-3" />
              <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
              <path d="m21 3 1 11h-2" />
              <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
              <path d="M3 4h8" />
            </svg>
            Connect with Friends
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => setShowMenu(false)}
            className={`flex gap-2 items-center py-2 px-4 text-sm rounded-md transition ${
              pathname === "/settings"
                ? "text-green-600 font-medium border-l-4 border-green-500 bg-green-50"
                : "text-black hover:shadow-lg border-transparent hover:-translate-x-0.5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={pathname === "/settings" ? "#16a34a" : "#000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-cog"
            >
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="12" r="8" />
              <path d="M11 10.27 7 3.34" />
              <path d="m11 13.73-4 6.93" />
              <path d="M12 22v-2" />
              <path d="M12 2v2" />
              <path d="M14 12h8" />
              <path d="m17 20.66-1-1.73" />
              <path d="m17 3.34-1 1.73" />
              <path d="M2 12h2" />
              <path d="m20.66 17-1.73-1" />
              <path d="m20.66 7-1.73 1" />
              <path d="m3.34 17 1.73-1" />
              <path d="m3.34 7 1.73 1" />
            </svg>
            Settings
          </Link>

          {/* Become an Advisor */}
          <Link
            href="/advisor-registration"
            onClick={() => setShowMenu(false)}
            className={`flex gap-2 items-center py-2 px-4 text-sm rounded-md transition ${
              pathname === "/advisor-registration"
                ? "text-green-600 font-medium border-l-4 border-green-500 bg-green-50"
                : "text-black hover:shadow-lg border-transparent hover:-translate-x-0.5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={pathname === "/advisor-registration" ? "#16a34a" : "#000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-user-plus"
            >
              <circle cx="10" cy="8" r="5" />
              <path d="M2 21a8 8 0 0 1 13.292-6" />
              <path d="M19 16v6" />
              <path d="M22 19h-6" />
            </svg>
            Become an Advisor
          </Link>

          {/* Report a Bug */}
          <Link
            href="/report-bug"
            onClick={() => setShowMenu(false)}
            className={`flex gap-2 items-center py-2 px-4 text-sm rounded-md transition ${
              pathname === "/report-bug"
                ? "text-green-600 font-medium border-l-4 border-green-500 bg-green-50"
                : "text-black hover:shadow-lg border-transparent hover:-translate-x-0.5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={pathname === "/report-bug" ? "#16a34a" : "#000"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-bug-off"
            >
              <path d="M12 20v-8" />
              <path d="M14.12 3.88 16 2" />
              <path d="M15 7.13V6a3 3 0 0 0-5.14-2.1L8 2" />
              <path d="M18 12.34V11a4 4 0 0 0-4-4h-1.3" />
              <path d="m2 2 20 20" />
              <path d="M21 5a4 4 0 0 1-3.55 3.97" />
              <path d="M22 13h-3.34" />
              <path d="M3 21a4 4 0 0 1 3.81-4" />
              <path d="M6 13H2" />
              <path d="M7.7 7.7A4 4 0 0 0 6 11v3a6 6 0 0 0 11.13 3.13" />
            </svg>
            Report a Bug
          </Link>
        </div>

        {/* Login / Logout */}
        <div>
          {token ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer hover:-translate-x-0.5 hover:shadow-lg w-full px-4 py-2 rounded-md transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-log-out"
              >
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              </svg>
              Logout
            </button>
          ) : (
            <Link
              href="/authentication"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2 cursor-pointer hover:shadow-lg w-full hover:-translate-x-0.5 px-4 py-2 rounded-md transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-log-in"
              >
                <path d="m10 17 5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              </svg>
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Header;
