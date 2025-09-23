"use client";
import { useState,useEffect } from "react";
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
      if (resetPassword) {
        // 🔹 Reset Password Flow
        if (!otpSent) {
          try {
            await axios.post(
              "http://localhost:8000/api/v1/auth/password-reset-request/",
              {
                email: formData.email,
              }
            );
            setMessage("OTP sent to your email");
            setOtpSent(true);
          } catch (err) {
            setError(err.response?.data?.error || "Email not found");
            setOtpSent(false);
          }
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
      } else if (isLogin && !useOTP) {
        // 🔹 Login with Password
        const res = await axios.post(
          "http://localhost:8000/api/v1/auth/login/",
          {
            email: formData.email,
            password: formData.password,
          }
        );
        localStorage.setItem("access", res.data.data.access);
        localStorage.setItem("refresh", res.data.data.refresh);
        router.push("/");
      } else if (isLogin && useOTP) {
        // 🔹 Login with OTP
        if (!otpSent) {
          try {
            await axios.post("http://localhost:8000/api/v1/auth/otp-request/", {
              email: formData.email,
            });
            setMessage("OTP sent to your email");
            setOtpSent(true); // ✅ only set if success
          } catch (err) {
            setError(err.response?.data?.error || "Email not found");
            setOtpSent(false); // ❌ don’t proceed
          }
        } else {
          try {
            const res = await axios.post(
              "http://localhost:8000/api/v1/auth/otp-verify/",
              {
                email: formData.email,
                otp: formData.otp,
              }
            );
            localStorage.setItem("access", res.data.data.access);
            localStorage.setItem("refresh", res.data.data.refresh);
            router.push("/");
          } catch (err) {
            setError(err.response?.data?.error || "Invalid OTP");
          }
        }
      } else {
        // 🔹 Signup
        await axios.post("http://localhost:8000/api/v1/auth/signup/", {
          username: formData.username,
          first_name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        alert("Signup successful! Please login.");
        setIsLogin(true);
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
      await axios.post("http://localhost:8000/api/v1/auth/otp-request/", {
        email: formData.email,
      });
      setMessage("OTP resent successfully");
      setCooldown(30); // start countdown
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
          {resetPassword
            ? "Reset Password"
            : isLogin
            ? useOTP
              ? "Login with Email OTP"
              : "Login with Password"
            : "Signup"}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-600 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Signup extra fields */}
          {!isLogin && !resetPassword && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
              />
            </>
          )}

          {/* Always need email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg text-black"
            required
            disabled={otpSent && (useOTP || resetPassword)} // ✅ disable after OTP sent
          />

          {/* Reset Password fields */}
          {resetPassword ? (
            otpSent ? (
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
            ) : null
          ) : isLogin && useOTP ? (
            otpSent && (
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required
              />
            )
          ) : (
            !resetPassword && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-black"
                required={!useOTP}
              />
            )
          )}

          <button
            type="submit"
            className={`w-full p-2 rounded-lg text-white ${
              resetPassword
                ? "bg-orange-600 hover:bg-orange-700"
                : isLogin
                ? useOTP
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            } transition`}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : resetPassword
              ? otpSent
                ? "Confirm Reset"
                : "Send OTP"
              : isLogin
              ? useOTP
                ? otpSent
                  ? "Verify OTP"
                  : "Send OTP"
                : "Login"
              : "Signup"}
          </button>
          {/* Resend OTP button (shows only after OTP is sent) */}
          {otpSent && (
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

        {/* Toggle links */}
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

        {isLogin && !resetPassword && (
          <p className="mt-2 text-center text-gray-600">
            {useOTP ? "Or login with " : "Or login with "}{" "}
            <button
              onClick={() => {
                setUseOTP(!useOTP);
                setOtpSent(false);
                setError("");
                setMessage("");
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              {useOTP ? "Password" : "Email OTP"}
            </button>
          </p>
        )}

        <p className="mt-2 text-center text-gray-600">
          {resetPassword ? (
            <button
              onClick={() => {
                setResetPassword(false);
                setOtpSent(false);
                setError("");
                setMessage("");
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Back to Login
            </button>
          ) : isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setUseOTP(false);
                  setError("");
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
                  setUseOTP(false);
                  setError("");
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
