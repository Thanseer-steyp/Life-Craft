"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
          await axios.post("http://127.0.0.1:8000/api/v1/auth/signup-request/", {
            username: formData.username,
            first_name: formData.name,
            email: formData.email,
            password: formData.password,
          });
          setMessage("OTP sent to your email. Enter OTP to verify signup.");
          setOtpSent(true);
        } else {
          await axios.post(
            "http://127.0.0.1:8000/api/v1/auth/signup-otp-verification/",
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
            "http://127.0.0.1:8000/api/v1/auth/password-reset-otp/",
            { email: formData.email }
          );
          setMessage("OTP sent to your email");
          setOtpSent(true);
        } else {
          await axios.post(
            "http://127.0.0.1:8000/api/v1/auth/password-reset-confirm/",
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
        const res = await axios.post("http://127.0.0.1:8000/api/v1/auth/login/", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("access", res.data.data.access);
        localStorage.setItem("refresh", res.data.data.refresh);

        // 🔹 Admin check
        if (formData.email === "admin.lifecraft@gmail.com") {
          router.push("/admin-dashboard");
        } else {
          // 🔹 Advisor check
          const advisorRes = await axios.get(
            "http://127.0.0.1:8000/api/v1/advisor/advisors-list/",
            {
              headers: { Authorization: `Bearer ${res.data.data.access}` },
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
            "http://127.0.0.1:8000/api/v1/auth/login-otp-request/",
            {
              email: formData.email,
            }
          );
          setMessage("OTP sent to your email");
          setOtpSent(true);
        } else {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/v1/auth/login-otp-verification/",
            { email: formData.email, otp: formData.otp }
          );

          localStorage.setItem("access", res.data.data.access);
          localStorage.setItem("refresh", res.data.data.refresh);

          // 🔹 Admin check
          if (formData.email === "admin.lifecraft@gmail.com") {
            router.push("/admin-dashboard");
          } else {
            // 🔹 Advisor check
            const advisorRes = await axios.get(
              "http://127.0.0.1:8000/api/v1/advisor/advisors-list/",
              {
                headers: { Authorization: `Bearer ${res.data.data.access}` },
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
        url = "http://127.0.0.1:8000/api/v1/auth/signup-otp-resend/";
      else if (useOTP || resetPassword)
        url = useOTP
          ? "http://127.0.0.1:8000/api/v1/auth/login-otp-request/"
          : "http://127.0.0.1:8000/api/v1/auth/password-reset-otp/";

      await axios.post(url, { email: formData.email });
      setMessage("OTP resent successfully");
      setFormData({ ...formData, otp: "" }); // clear input
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isLogin
            ? resetPassword
              ? "Reset Password"
              : useOTP
              ? "Login with OTP"
              : "Login with Password"
            : "Signup"}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-600 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ---------------- Signup Form ---------------- */}
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
                disabled={otpSent}
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
                disabled={otpSent}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
                disabled={otpSent}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
                disabled={otpSent}
              />

              {otpSent && (
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-black"
                  required
                />
              )}
            </>
          )}

          {/* ---------------- Reset Password ---------------- */}
          {resetPassword && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
                disabled={otpSent}
              />
              {otpSent && (
                <>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg text-black"
                    required
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg text-black"
                    required
                  />
                </>
              )}
            </>
          )}

          {/* ---------------- Login ---------------- */}
          {isLogin && !resetPassword && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
                disabled={otpSent && useOTP}
              />
              {!useOTP && (
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-black"
                  required
                />
              )}
              {useOTP && otpSent && (
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-black"
                  required
                />
              )}
            </>
          )}

          {/* ---------------- Submit Button ---------------- */}
          <button
            type="submit"
            className="w-full p-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : !isLogin
              ? otpSent
                ? "Verify OTP"
                : "Send OTP"
              : resetPassword
              ? otpSent
                ? "Confirm Reset"
                : "Send OTP"
              : useOTP
              ? otpSent
                ? "Verify OTP"
                : "Send OTP"
              : "Login"}
          </button>

          {/* ---------------- Resend OTP ---------------- */}
          {otpSent && (!isLogin || useOTP || resetPassword) && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className={`text-sm font-semibold ${
                  cooldown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          )}
        </form>

        {/* ---------------- Footer Links ---------------- */}
        {isLogin && !resetPassword && (
          <p className="mt-4 text-center text-gray-600">
            <button
              onClick={() => {
                setResetPassword(true);
                setOtpSent(false);
                setError("");
                setMessage("");
              }}
              className="text-orange-600 font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </p>
        )}

        <p className="mt-2 text-center text-gray-600">
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
                className="text-blue-600 font-semibold hover:underline"
              >
                Signup
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
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>

        {/* ---------------- Toggle password vs OTP login ---------------- */}
        {isLogin && !resetPassword && (
          <div className="mt-2 text-center">
            <button
              onClick={() => {
                setUseOTP(!useOTP);
                setOtpSent(false);
                setError("");
                setMessage("");
              }}
              className="text-sm text-purple-600 font-semibold hover:underline"
            >
              {useOTP ? "Login with Password" : "Login with OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
