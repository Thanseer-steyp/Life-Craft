"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RoleModalChecker() {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    if (pathname === "/" && (storedRole === "admin" || storedRole === "advisor")) {
      setShowModal(true);
      document.body.style.overflow = "hidden";
    } else {
      setShowModal(false);
      document.body.style.overflow = "auto";
    }
  }, [pathname]);

  if (!showModal) return null;

  const handleGoBack = () => {
    if (role === "admin") {
      router.push("/admin-dashboard");
    } else if (role === "advisor") {
      router.push("/advisor-dashboard");
    }
  };

  const goBackText =
    role === "admin"
      ? "Go back to Admin Dashboard"
      : role === "advisor"
      ? "Go back to Advisor Dashboard"
      : "Go Back";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm">
      <div className="w-[90%] max-w-lg text-center p-6">
        <img src="/session.png" alt="Session Expired" className="mx-auto mb-4 w-56" />
        <p className="text-gray-600 mb-6">
          Oops, your session has expired. <br /> Please re-authenticate to return to your screen.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => router.push("/authentication")}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
          {(role === "admin" || role === "advisor") && (
            <button
              onClick={handleGoBack}
              className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition"
            >
{goBackText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
