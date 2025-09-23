"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function page() {
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // clear tokens, user info
    window.dispatchEvent(new Event("login-status-changed")); // tell Header to reload user
    window.location.reload();
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <h1 className="font-extrabold text-6xl">Welcome to LifeCraft</h1>
      {token ? (
        // If logged in → Show logout
        <button
          className="bg-red-500 rounded-full p-3 cursor-pointer w-max mx-auto lg:mx-0 mt-4 lg:mt-0"
          onClick={handleLogout}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-log-out"
          >
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          </svg>
        </button>
      ) : (
        // If no token → Show login (example)
        <Link
          href="/authentication"
          className="bg-green-500 rounded-full p-3 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-key-round-icon lucide-key-round"
          >
            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
        </Link>
      )}
      <Link href="/profile-setup" className="bg-white p-4 rounded-xl text-black font-extrabold">Setup Profile</Link>
    </div>
  );
}

export default page;
