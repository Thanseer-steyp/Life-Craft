"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    otp: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
          await axios.post(
            "http://localhost:8000/api/v1/auth/signup-request/",
            {
              username: formData.username,
              first_name: formData.name,
              email: formData.email,
              password: formData.password,
            }
          );
          setMessage("OTP sent to your email. Enter OTP to verify signup.");
          setOtpSent(true);
        } else {
          await axios.post(
            "http://localhost:8000/api/v1/auth/signup-otp-verification/",
            { email: formData.email, otp: formData.otp }
          );
          setMessage("Signup successful! Please login.");
          setOtpSent(false);
          setIsLogin(true);
        }
      }

      // ---------------- Reset Password Flow ----------------
      else if (resetPassword) {
        if (!otpSent) {
          await axios.post(
            "http://localhost:8000/api/v1/auth/password-reset-otp/",
            { email: formData.email }
          );
          setMessage("OTP sent to your email");
          setOtpSent(true);
        } else {
          await axios.post(
            "http://localhost:8000/api/v1/auth/password-reset-confirm/",
            {
              email: formData.email,
              otp: formData.otp,
              new_password: formData.newPassword,
            }
          );
          setMessage("Password reset successful! Please login.");
          setResetPassword(false);
          setOtpSent(false);
          setIsLogin(true);
        }
      }

      // ---------------- Login with Password ----------------
      else if (isLogin && !useOTP) {
        const res = await axios.post(
          "http://localhost:8000/api/v1/auth/login/",
          {
            email: formData.email,
            password: formData.password,
          }
        );

        const accessToken = res.data.data.access;
        const refreshToken = res.data.data.refresh;

        localStorage.setItem("access", accessToken);
        localStorage.setItem("refresh", refreshToken);

        window.dispatchEvent(new Event("login"));

        setSuccess(true);

        // 🔹 Admin check
        if (formData.email === "admin.lifecraft@gmail.com") {
          router.push("/admin-dashboard");
        } else {
          // 🔹 Advisor check
          const advisorRes = await axios.get(
            "http://localhost:8000/api/v1/advisor/advisors-list/",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const isAdvisor = advisorRes.data.some(
            (advisor) => advisor.email === formData.email
          );

          if (isAdvisor) {
            router.push("/advisor-dashboard");
          } else {
            router.push("/");
          }
        }
      }

      // ---------------- Login with OTP ----------------
      else if (isLogin && useOTP) {
        if (!otpSent) {
          await axios.post(
            "http://localhost:8000/api/v1/auth/login-otp-request/",
            {
              email: formData.email,
            }
          );
          setMessage("OTP sent to your email");
          setOtpSent(true);
        } else {
          const res = await axios.post(
            "http://localhost:8000/api/v1/auth/login-otp-verification/",
            { email: formData.email, otp: formData.otp }
          );

          const accessToken = res.data.data.access;
          const refreshToken = res.data.data.refresh;

          localStorage.setItem("access", accessToken);
          localStorage.setItem("refresh", refreshToken);

          window.dispatchEvent(new Event("login"));

          setSuccess(true);

          // 🔹 Admin check
          if (formData.email === "admin.lifecraft@gmail.com") {
            router.push("/admin-dashboard");
          } else {
            // 🔹 Advisor check
            const advisorRes = await axios.get(
              "http://localhost:8000/api/v1/advisor/advisors-list/",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            const isAdvisor = advisorRes.data.some(
              (adv) => adv.email === formData.email
            );

            if (isAdvisor) {
              router.push("/advisor-dashboard");
            } else {
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
      if (!isLogin)
        url = "http://localhost:8000/api/v1/auth/signup-otp-resend/";
      else if (useOTP || resetPassword)
        url = useOTP
          ? "http://localhost:8000/api/v1/auth/login-otp-request/"
          : "http://localhost:8000/api/v1/auth/password-reset-otp/";

      await axios.post(url, { email: formData.email });
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
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="h-max flex wrapper">
        <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .input-focus {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-focus:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(51, 65, 85, 0.15);
        }

        .btn-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .btn-hover:hover::before {
          left: 100%;
        }

        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .link-hover {
          transition: all 0.2s ease;
          position: relative;
        }

        .link-hover::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 50%;
          background-color: currentColor;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .link-hover:hover::after {
          width: 100%;
        }

        .field-group {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
        }

        .field-group:nth-child(1) { animation-delay: 0.1s; }
        .field-group:nth-child(2) { animation-delay: 0.15s; }
        .field-group:nth-child(3) { animation-delay: 0.2s; }
        .field-group:nth-child(4) { animation-delay: 0.25s; }
        .field-group:nth-child(5) { animation-delay: 0.3s; }

        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>

        {/* Left Side - Brand & Information */}
        <div
          className={`hidden lg:flex lg:w-1/2 p-12 pl-0 flex-col justify-between ${
            mounted ? "animate-fadeInRight" : "opacity-0"
          }`}
        >
          <div>
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                <svg
                  className={`w-7 h-7  ${
                    success ? "text-green-600" : "text-red-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-lg">
              <h1 className="text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Secure Your
                <br />
                Retirement Future
              </h1>
              <p className="text-xl text-slate-300 mb-12 leading-relaxed">
                Expert financial planning and advisory services to help you
                navigate your retirement journey with confidence and peace of
                mind.
              </p>

              {/* Feature Points */}
              <div className="space-y-6 mb-12">
                <div className="flex items-start space-x-4 hover:-translate-x-1 transition duration-150">
                  <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-600">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Personalized Planning
                    </h3>
                    <p className="text-slate-400">
                      Tailored retirement strategies designed specifically for
                      your financial goals and lifestyle.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 hover:-translate-x-1 transition duration-150">
                  <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-600">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Expert Advisors
                    </h3>
                    <p className="text-slate-400">
                      Connect with certified financial advisors who specialize
                      in retirement planning.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 hover:-translate-x-2 transition duration-300">
                  <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-600">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Real-Time Insights
                    </h3>
                    <p className="text-slate-400">
                      Track your retirement progress with comprehensive
                      analytics and reporting tools.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="stat-card bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-3xl font-bold text-white mb-1">10K+</div>
                  <div className="text-slate-400 text-sm">Happy Clients</div>
                </div>
                <div className="stat-card bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-3xl font-bold text-white mb-1">$2B+</div>
                  <div className="text-slate-400 text-sm">Assets Managed</div>
                </div>
                <div className="stat-card bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-3xl font-bold text-white mb-1">15+</div>
                  <div className="text-slate-400 text-sm">Years Experience</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
        </div>

        {/* Right Side - Authentication Form */}
        <div
          className={`w-full lg:w-1/2 flex items-center justify-end p-8 pr-0 ${
            mounted ? "animate-fadeInLeft" : "opacity-0"
          }`}
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 rounded-lg mb-3">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-wide">
                LIFECRAFT
              </h1>
            </div>

            {/* Auth Card */}
            <div className="bg-white shadow-xl rounded-2xl border border-slate-200 transition duration-500">
              <div className="px-8 py-10">
                <h2 className="text-3xl font-serif font-semibold mb-2 text-slate-900">
                  {isLogin
                    ? resetPassword
                      ? "Reset Password"
                      : useOTP
                      ? "Login with OTP"
                      : "Welcome Back"
                    : "Get Started"}
                </h2>
                <p className="text-slate-600 mb-8">
                  {isLogin
                    ? resetPassword
                      ? "Enter your email to receive a reset code"
                      : "Sign in to access your retirement planning dashboard"
                    : "Create your account to begin your retirement journey"}
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
                      <div className="field-group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                          required
                          disabled={otpSent}
                        />
                      </div>
                      <div className="field-group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                          required
                          disabled={otpSent}
                        />
                      </div>
                      <div className="field-group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                          required
                          disabled={otpSent}
                        />
                      </div>
                      <div className="field-group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                            required
                            disabled={otpSent}
                          />
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
                      </div>
                      {otpSent && (
                        <div className="field-group animate-scaleIn">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            One-Time Password
                          </label>
                          <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Reset Password */}
                  {resetPassword && (
                    <>
                      <div className="field-group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                          required
                          disabled={otpSent}
                        />
                      </div>
                      {otpSent && (
                        <>
                          <div className="field-group animate-scaleIn">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              One-Time Password
                            </label>
                            <input
                              type="text"
                              name="otp"
                              value={formData.otp}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                              required
                            />
                          </div>
                          <div className="field-group animate-scaleIn">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                                required
                              />
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
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Login */}
                  {isLogin && !resetPassword && (
                    <>
                      <div className="field-group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                          required
                          disabled={otpSent && useOTP}
                        />
                      </div>
                      {!useOTP && (
                        <div className="field-group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                              required
                            />
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
                        </div>
                      )}
                      {useOTP && otpSent && (
                        <div className="field-group animate-scaleIn">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            One-Time Password
                          </label>
                          <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-transparent transition outline-none input-focus bg-white"
                            required
                          />
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
                      "Sign In"
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
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
                {isLogin && !resetPassword && (
                  <div className="text-center mb-3">
                    <button
                      onClick={() => {
                        setResetPassword(true);
                        setOtpSent(false);
                        setError("");
                        setMessage("");
                      }}
                      className="text-sm text-slate-600 hover:text-slate-900 font-medium link-hover"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <div className="text-center text-sm text-slate-600">
                  {isLogin ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => {
                          setIsLogin(false);
                          setOtpSent(false);
                          setError("");
                          setMessage("");
                        }}
                        className="text-slate-900 font-semibold link-hover"
                      >
                        Create one now
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
                        Sign in
                      </button>
                    </>
                  )}
                </div>

                {/* Toggle password vs OTP login */}
                {isLogin && !resetPassword && (
                  <div className="text-center mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setUseOTP(!useOTP);
                        setOtpSent(false);
                        setError("");
                        setMessage("");
                      }}
                      className="text-sm text-slate-600 hover:text-slate-900 font-medium link-hover"
                    >
                      {useOTP
                        ? "Use password instead"
                        : "Use one-time password"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-slate-500 text-sm mt-4 text-center">
              © 2025 LifeCraft. All rights reserved. | Secure authentication
              system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
