"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/components/config/AxiosInstance";
import { useContext } from "react";
import { UserContext } from "@/components/config/UserProvider";


function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [useOTP, setUseOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { fetchUser } = useContext(UserContext);


  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    otp: "",
    newPassword: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ---------------- Signup Flow ----------------
      if (!isLogin) {
        if (!otpSent) {
          await axiosInstance.post("api/v1/auth/signup-request/", {
            username: formData.username,
            first_name: formData.name,
            email: formData.email,
            password: formData.password,
          });
          setMessage("OTP sent to your email. Enter OTP to verify signup.");
          setOtpSent(true);
        } else {
          await axiosInstance.post("api/v1/auth/signup-otp-verification/", {
            email: formData.email,
            otp: formData.otp,
          });
          setMessage("Signup successful! Please login.");
          setOtpSent(false);
          setIsLogin(true);
        }
      }

      // ---------------- Reset Password Flow ----------------
      else if (resetPassword) {
        if (!otpSent) {
          await axiosInstance.post("api/v1/auth/password-reset-otp/", {
            email: formData.email,
          });
          setMessage("OTP sent to your email");
          setOtpSent(true);
        } else {
          await axiosInstance.post("api/v1/auth/password-reset-confirm/", {
            email: formData.email,
            otp: formData.otp,
            new_password: formData.newPassword,
          });
          setMessage("Password reset successful! Please login.");
          setResetPassword(false);
          setOtpSent(false);
          setIsLogin(true);
        }
      }

      // ---------------- Login with Password ----------------
      else if (isLogin && !useOTP) {
        const res = await axiosInstance.post("api/v1/auth/login/", {
          email: formData.email,
          password: formData.password,
        });

        const accessToken = res.data.data.access;
        const refreshToken = res.data.data.refresh;

        localStorage.setItem("access", accessToken);
        localStorage.setItem("refresh", refreshToken);

        const userId = res.data.data.user_id; // ✅ correct
        localStorage.setItem("user_id", userId);

        await fetchUser(); // 👈 this instantly updates UserContext


        setSuccess(true);

        // 🔹 Admin check
        if (formData.email === "admin.lifecraft@gmail.com") {
          localStorage.setItem("role", "admin");
          router.push("/admin-dashboard");
        } else {
          // 🔹 Advisor check
          const advisorRes = await axiosInstance.get(
            "api/v1/advisor/advisors-list/"
          );

          const isAdvisor = advisorRes.data.some(
            (advisor) => advisor.email === formData.email
          );

          if (isAdvisor) {
            localStorage.setItem("role", "advisor");
            router.push("/advisor-dashboard");
          } else {
            localStorage.setItem("role", "user");
            router.push("/");
          }
        }
      }

      // ---------------- Login with OTP ----------------
      else if (isLogin && useOTP) {
        if (!otpSent) {
          await axiosInstance.post("api/v1/auth/login-otp-request/", {
            email: formData.email,
          });
          setMessage("OTP sent to your email");
          setOtpSent(true);
        } else {
          const res = await axiosInstance.post(
            "api/v1/auth/login-otp-verification/",
            { email: formData.email, otp: formData.otp }
          );

          const accessToken = res.data.data.access;
          const refreshToken = res.data.data.refresh;

          localStorage.setItem("access", accessToken);
          localStorage.setItem("refresh", refreshToken);
          const userId = res.data.data.user_id; // ✅ correct
          localStorage.setItem("user_id", userId);

          await fetchUser(); // 👈 this instantly updates UserContext

          setSuccess(true);

          // 🔹 Admin check
          if (formData.email === "admin.lifecraft@gmail.com") {
            localStorage.setItem("role", "admin");
            router.push("/admin-dashboard");
          } else {
            // 🔹 Advisor check
            const advisorRes = await axiosInstance.get(
              "api/v1/advisor/advisors-list/"
            );

            const isAdvisor = advisorRes.data.some(
              (adv) => adv.email === formData.email
            );

            if (isAdvisor) {
              localStorage.setItem("role", "advisor");
              router.push("/advisor-dashboard");
            } else {
              localStorage.setItem("role", "user");
              router.push("/");
            }
          }
        }
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      let url = "";
      if (!isLogin) url = "api/v1/auth/signup-otp-resend/";
      else if (useOTP || resetPassword)
        url = useOTP
          ? "api/v1/auth/login-otp-request/"
          : "api/v1/auth/password-reset-otp/";

      await axiosInstance.post(url, { email: formData.email });
      setMessage("OTP resent successfully");
      setFormData({ ...formData, otp: "" });
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <>
      <div className="flex min-h-screen">
        <div className="w-1/2 pr-0 bg-white flex flex-col items-center justify-center">
          <div className="w-full">
            {/* Auth Card */}
            <div className="transition duration-500 w-1/2 border mx-auto">
              <div className="p-8">
                <h1 className="flex items-center justify-center mb-8">
                  <Link href="/" className="flex gap-1 items-center">
                    <img src="/logo.png" alt="Logo" className="w-10" />
                    <h2 className="text-2xl font-bold text-black">LifeCraft</h2>
                  </Link>
                </h1>
                <h2 className="text-3xl font-semibold mb-2 text-slate-900 text-center">
                  {isLogin
                    ? resetPassword
                      ? "Reset Password"
                      : useOTP
                      ? "Login with OTP"
                      : "Welcome Back"
                    : "Get Started"}
                </h2>
                <p className="text-slate-600 mb-8 text-center">
                  {isLogin
                    ? resetPassword
                      ? "Enter your email to receive a reset code"
                      : "Enter your valid credentials here"
                    : "Create account to join with us"}
                </p>

                {/* Alert Messages */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideDown">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}
                {message && (
                  <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg animate-slideDown">
                    <p className="text-emerald-700 text-sm font-medium">
                      {message}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Signup Form */}
                  {!isLogin && (
                    <>
                      <div className="relative w-full field-group">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          placeholder=" "
                          onChange={handleChange}
                          className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                          required
                          disabled={otpSent}
                        />
                        <label
                          htmlFor="name"
                          className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                        >
                          Name
                        </label>
                      </div>
                      <div className="relative w-full field-group">
                        <input
                          type="text"
                          name="username"
                          id="username"
                          placeholder=" "
                          value={formData.username}
                          onChange={handleChange}
                          className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                          required
                          disabled={otpSent}
                        />
                        <label
                          htmlFor="username"
                          className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                        >
                          Username
                        </label>
                      </div>
                      <div className="relative w-full field-group">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          id="email"
                          placeholder=" "
                          disabled={otpSent}
                          required
                          className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                        >
                          Email Address
                        </label>
                      </div>

                      <div className="field-group w-full relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder=" "
                          disabled={otpSent}
                          required
                          className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                        />
                        <label
                          htmlFor="password"
                          className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                        >
                          Password
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.956-3.114M6.227 6.227A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 3l18 18"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {otpSent && (
                        <div className="field-group animate-scaleIn relative w-full">
                          <input
                            type="text"
                            name="otp"
                            id="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength={6}
                            minLength={6}
                            className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                            required
                            placeholder=" "
                          />
                          <label
                            htmlFor="otp"
                            className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                          >
                            One-Time Password
                          </label>
                        </div>
                      )}
                    </>
                  )}

                  {/* Reset Password */}
                  {resetPassword && (
                    <>
                      <div className="relative w-full field-group">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                          required
                          placeholder=" "
                          disabled={otpSent}
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                        >
                          Email Address
                        </label>
                      </div>
                      {otpSent && (
                        <>
                          <div className="w-full relative animate-scaleIn field-group">
                            <input
                              type="text"
                              name="otp"
                              id="otp"
                              value={formData.otp}
                              onChange={handleChange}
                              maxLength={6}
                              minLength={6}
                              className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                              required
                              placeholder=" "
                            />
                            <label
                              htmlFor="otp"
                              className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                            >
                              One-Time Password
                            </label>
                          </div>
                          <div className="relative w-full field-group animate-scaleIn">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="newPassword"
                              id="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              placeholder=" "
                              className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                              required
                            />

                            {/* Floating label */}
                            <label
                              htmlFor="newPassword"
                              className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                            >
                              New Password
                            </label>

                            {/* Show / Hide Password Button */}
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                              tabIndex={-1} // prevents focus steal
                            >
                              {showPassword ? (
                                // 👁️ Hide icon
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.956-3.114M6.227 6.227A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.604 2.574M15 12a3 3 0 00-3-3m0 0a3 3 0 013 3m-3 0a3 3 0 01-3 3m0 0a3 3 0 003-3z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3l18 18"
                                  />
                                </svg>
                              ) : (
                                // 👁️ Show icon
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Login */}
                  {isLogin && !resetPassword && (
                    <>
                      <div
                        className="w-full relative field-group"
                        key={useOTP ? "email-otp" : "email-password"}
                      >
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                          required
                          placeholder=" "
                          disabled={otpSent && useOTP}
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                        >
                          Email Address
                        </label>
                      </div>
                      {!useOTP && (
                        <div className="relative w-full field-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder=" "
                            required
                            className="peer w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                          />
                          <label
                            htmlFor="password"
                            className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
                                     peer-placeholder-shown:top-3 
                                     peer-placeholder-shown:text-slate-400 
                                     peer-placeholder-shown:text-base 
                                     peer-focus:top-[-10px] 
                                     peer-focus:text-slate-800 
                                     peer-focus:text-sm
                                     peer-not-placeholder-shown:top-[-10px]
                                     peer-not-placeholder-shown:text-slate-800
                                     bg-white px-1"
                          >
                            Password
                          </label>

                          {/* Show/Hide Password Button */}
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                            tabIndex={-1} // prevents it from stealing focus when tabbing
                          >
                            {showPassword ? (
                              // 👁️ Hide icon
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.956-3.114M6.227 6.227A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 3l18 18"
                                />
                              </svg>
                            ) : (
                              // 👁️ Show icon
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                      {useOTP && otpSent && (
                        <div className="field-group animate-scaleIn relative w-full">
                          <input
                            type="text"
                            placeholder=" "
                            name="otp"
                            id="otp"
                            maxLength={6}
                            minLength={6}
                            value={formData.otp}
                            onChange={handleChange}
                            className="peer w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 transition outline-none input-focus bg-white"
                            required
                          />
                          <label
                            htmlFor="otp"
                            className="absolute left-4 top-3 text-slate-500 text-sm transition-all 
               peer-placeholder-shown:top-3 
               peer-placeholder-shown:text-slate-400 
               peer-placeholder-shown:text-base 
               peer-focus:top-[-10px] 
               peer-focus:text-slate-800 
               peer-focus:text-sm 
               peer-not-placeholder-shown:top-[-10px] 
               peer-not-placeholder-shown:text-slate-800
               bg-white px-1"
                          >
                            One-Time Password
                          </label>
                        </div>
                      )}
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : !isLogin ? (
                      otpSent ? (
                        "Verify OTP"
                      ) : (
                        "Send Verification Code"
                      )
                    ) : resetPassword ? (
                      otpSent ? (
                        "Confirm Reset"
                      ) : (
                        "Send Reset Code"
                      )
                    ) : useOTP ? (
                      otpSent ? (
                        "Verify OTP"
                      ) : (
                        "Send Login Code"
                      )
                    ) : (
                      "Login"
                    )}
                  </button>

                  {/* Resend OTP */}
                  {otpSent && (!isLogin || useOTP || resetPassword) && (
                    <div className="text-center pt-2 animate-slideDown">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0}
                        className={`text-sm font-medium link-hover ${
                          cooldown > 0
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-slate-700 hover:text-slate-900"
                        }`}
                      >
                        {cooldown > 0
                          ? `Resend code in ${cooldown}s`
                          : "Resend verification code"}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer Links */}
              <div className="px-8">
                <div
                  className={`flex items-center ${
                    resetPassword
                      ? "justify-center border-y py-3 border-slate-300 mb-5"
                      : isLogin
                      ? "justify-between border-y py-3 border-slate-300 mb-5"
                      : "justify-center"
                  }`}
                >
                  {resetPassword && (
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        setResetPassword(false);
                        setUseOTP(false);
                        setOtpSent(false);
                        setError("");
                        setMessage("");
                        setFormData({
                          name: "",
                          username: "",
                          email: "",
                          password: "",
                          otp: "",
                          newPassword: "",
                        });
                      }}
                      className="text-slate-600 hover:text-slate-900 block font-medium text-sm link-hover"
                    >
                      Back to Login
                    </button>
                  )}

                  {isLogin && !resetPassword && (
                    <div className="">
                      <button
                        onClick={() => {
                          setUseOTP(!useOTP);
                          setOtpSent(false);
                          setError("");
                          setMessage("");
                        }}
                        className="text-sm text-slate-600 hover:text-slate-900 font-medium link-hover"
                      >
                        {useOTP ? "Login with Password" : "Login with OTP"}
                      </button>
                    </div>
                  )}
                  {isLogin && !resetPassword && (
                    <div className="">
                      <button
                        onClick={() => {
                          setResetPassword(true);
                          setOtpSent(false);
                          setError("");
                          setMessage("");
                        }}
                        className="text-sm text-slate-600 hover:text-slate-900 font-medium link-hover"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center text-sm text-slate-600">
                  {isLogin ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => {
                          setIsLogin(false);
                          setOtpSent(false);
                          setResetPassword(false); // ✅ reset this
                          setUseOTP(false);
                          setError("");
                          setMessage("");
                          setFormData({
                            name: "",
                            username: "",
                            email: "",
                            password: "",
                            otp: "",
                            newPassword: "",
                          });
                        }}
                        className="text-slate-900 font-semibold link-hover"
                      >
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => {
                          setIsLogin(true);
                          setOtpSent(false);
                          setError("");
                          setMessage("");
                        }}
                        className="text-slate-900 font-semibold link-hover"
                      >
                        Login
                      </button>
                    </>
                  )}
                </div>

                {/* Toggle password vs OTP login */}
              </div>
              <div className="text-slate-500 text-sm mt-4 text-center select-none pb-8">
                © 2025 LifeCraft. All rights reserved. <br /> Secure
                authentication system.
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/2">
          <img
            src="/auth.png"
            alt="Authentication Image"
            className="block w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

export default AuthPage;
