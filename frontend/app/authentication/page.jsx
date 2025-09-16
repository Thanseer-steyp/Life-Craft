"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import AuthCard from "@/components/screens/auth/AuthCard";
import LoginForm from "@/components/screens/auth/LoginForm";
import SignupForm from "@/components/screens/auth/SignupForm";

function Authentication() {
  const [activeForm, setActiveForm] = useState("login"); // "login" | "signup"

  // Login states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup states
  const [firstname, setFirstname] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [email, setEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // OTP states
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Toggle between forms with reset
  const toggleForm = (form) => {
    setActiveForm(form);

    // Reset all states
    setLoginUsername("");
    setLoginPassword("");
    setFirstname("");
    setSignupUsername("");
    setEmail("");
    setSignupPassword("");
    setOtpPhone("");
    setOtp("");
    setShowPassword(false);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/login/", {
        username: loginUsername,
        password: loginPassword,
      });

      const { data, status_code } = res.data;

      if (status_code === 6000) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("first_name", data.first_name);
        localStorage.setItem("username", data.username);

        window.dispatchEvent(new Event("login-status-changed"));
        router.push("/");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8000/api/v1/auth/signup/", {
        first_name: firstname,
        username: signupUsername,
        email,
        password: signupPassword,
      });

      toast.success("Account created successfully! Please log in.");
      toggleForm("login"); // switch to login
    } catch (err) {
      toast.error(err?.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Handlers
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8000/api/v1/auth/request-otp/", {
        phone: otpPhone,
      });
      toast.success("OTP sent successfully");
      setShowOtpModal(true); // show popup
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/verify-otp/", {
        phone: otpPhone,
        otp,
      });

      const { access, refresh, first_name, username } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("first_name", first_name);
      localStorage.setItem("username", username);

      setShowOtpModal(false);
      window.dispatchEvent(new Event("login-status-changed"));
      router.push("/");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <AuthCard isLogin={activeForm === "login"} setIsLogin={() => toggleForm("login")}>
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => toggleForm("login")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              activeForm === "login" ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => toggleForm("signup")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              activeForm === "signup" ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeForm === "login" && (
            <div className="space-y-4">
              <LoginForm
                key="login"
                username={loginUsername}
                password={loginPassword}
                showPassword={showPassword}
                isLoading={isLoading}
                setUsername={setLoginUsername}
                setPassword={setLoginPassword}
                setShowPassword={setShowPassword}
                handleLogin={handleLogin}
                toggleForm={() => toggleForm("signup")}
              />

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 text-white/50 text-sm">or</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              {/* Phone Number OTP Request */}
              <form onSubmit={handleRequestOTP} className="space-y-3">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  required
                  className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all"
                >
                  {isLoading ? "Sending..." : "Login with OTP"}
                </button>
              </form>
            </div>
          )}
          {activeForm === "signup" && (
            <SignupForm
              key="signup"
              firstname={firstname}
              username={signupUsername}
              email={email}
              password={signupPassword}
              showPassword={showPassword}
              isLoading={isLoading}
              setFirstname={setFirstname}
              setUsername={setSignupUsername}
              setEmail={setEmail}
              setPassword={setSignupPassword}
              setShowPassword={setShowPassword}
              handleSignup={handleSignup}
              toggleForm={() => toggleForm("login")}
            />
          )}
        </AnimatePresence>
      </AuthCard>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-96">
            <h2 className="text-white text-xl font-bold mb-4">Verify OTP</h2>
            <form onSubmit={handleVerifyOTP} className="space-y-3">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );
}

export default Authentication;
