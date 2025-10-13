"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

function Page() {
  const router = useRouter();
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

  const handleStartJourney = () => {
    if (token) {
      router.push("/profile-setup");
    } else {
      router.push("/authentication");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("login-status-changed"));
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg1">
      <div>
        <h1 className="font-bold text-6xl text-center leading-tight pt-30 text-[#000000de] tracking-tight">
          Designing Your
          <br />
          <span className="">Dream Retirement</span>
        </h1>
        <p className="text-black text-lg font-light text-center mt-2">
          Visualize your future, plan with purpose, and live the retirement you
          deserve.
        </p>
        <button
          onClick={handleStartJourney}
          className="bg-black text-white rounded-sm p-2.5 w-max mx-auto block mt-8 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition duration-300"
        >
          Start your journey
        </button>
      </div>

      <div className="w-[35%] mx-auto rounded-md">
        <img src="hero2.png" alt="Hero" className="block w-full rounded-xl" />
      </div>

      {/* {token ? (
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
      <Link
        href="/user-inbox"
        className="bg-gray-200 rounded-full p-3 cursor-pointer text-black font-bold"
      >
        Inbox
      </Link> */}
    </div>
  );
}

export default Page;
