"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

function Page() {
  const [token, setToken] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [advisorRequested, setAdvisorRequested] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);

    if (accessToken) {
      // Check profile
      axios
        .get("http://localhost:8000/api/v1/user/profile-setup/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          if (res.status === 200) setHasProfile(true);
        })
        .catch(() => setHasProfile(false));

      // Check advisor request
      axios
        .get("http://localhost:8000/api/v1/user/become-advisor/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => setAdvisorRequested(res.data.requested))
        .catch(() => setAdvisorRequested(false));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("login-status-changed"));
    window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center space-y-4">
      <h1 className="font-extrabold text-6xl">Welcome to LifeCraft</h1>

      {token ? (
        <>
          <button
            className="bg-red-500 rounded-full p-3 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>

          {hasProfile ? (
            <Link
              href="/user-dashboard"
              className="bg-blue-500 p-3 rounded-xl text-white font-bold"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/profile-setup"
              className="bg-white p-4 rounded-xl text-black font-extrabold"
            >
              Setup Profile
            </Link>
          )}

          {advisorRequested ? (
            <button
              disabled
              className="bg-yellow-500 rounded-full p-3 cursor-not-allowed text-black font-bold"
            >
              Advisor Request Submitted
            </button>
          ) : (
            <Link
              href="/advisor-registration"
              className="bg-yellow-500 rounded-full p-3 cursor-pointer text-black font-bold"
            >
              Become an Advisor
            </Link>
          )}
        </>
      ) : (
        <Link
          href="/authentication"
          className="bg-green-500 rounded-full p-3 cursor-pointer text-white"
        >
          Login
        </Link>
      )}
      <Link href="/user-inbox" className="bg-gray-200 rounded-full p-3 cursor-pointer text-black font-bold">Inbox</Link>
      
    </div>
  );
}

export default Page;
