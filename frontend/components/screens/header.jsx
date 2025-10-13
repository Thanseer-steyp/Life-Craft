"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

function Header() {
  const [userInitial, setUserInitial] = useState(null);
  const [token, setToken] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUserInitial(null);
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/user-dashboard/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if ((res.data && res.data.name) || res.data.username) {
          setUserInitial(res.data.name.charAt(0).toUpperCase() || "🧑‍💻");
        }
      } catch (err) {
        console.error(err);
        setUserInitial(null);
      }
    };

    fetchUser();
  }, [token]);

  // Listen for login event
  useEffect(() => {
    const handleLogin = () => {
      setToken(localStorage.getItem("access")); // update token when login occurs
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

  return (
    <div
      className={`fixed top-0 left-0 w-full bg-white transition-shadow duration-150 z-50 ${
        isScrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="wrapper py-3 flex justify-between items-center">
        {/* Logo */}
        <h1>
          <Link href="/" className="flex gap-1 items-center">
            <img src="logo.png" alt="Logo" className="w-8" />
            <h2 className="text-lg font-extrabold text-black">LifeCraft</h2>
          </Link>
        </h1>

        {/* Navigation */}
        <nav className="gap-5 flex items-center text-black text-sm">
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">
            Features
          </Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">
            Pricing
          </Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">
            Advisors
          </Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">
            Resources
          </Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">
            About Us
          </Link>
        </nav>

        {/* Auth Section */}
        {userInitial ? (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-bold cursor-pointer">
            {userInitial}
          </div>
        ) : (
          <Link
            href="/authentication"
            className="p-2.5 bg-white shadow-xl text-sm rounded-md text-black font-bold hover:bg-gray-100"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
