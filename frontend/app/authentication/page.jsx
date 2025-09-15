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
  const [isLogin, setIsLogin] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
    setEmail("");
    setFirstname("");
    setShowPassword(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("http://localhost:8000/api/v1/auth/signup/", {
        first_name: firstname,
        username,
        email,
        password,
      });

      toast.success("Account created successfully! Please log in.");
      setIsLogin(true);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Signup failed. Please try again.";

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/login/", {
        username,
        password,
      });

      const { access, refresh, user } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      if (user?.first_name) localStorage.setItem("first_name", user.first_name);
      if (user?.username) localStorage.setItem("username", user.username);

      window.dispatchEvent(new Event("login-status-changed"));
      router.push("/");
    } catch {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 relative">
      {/* background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <AuthCard isLogin={isLogin} setIsLogin={setIsLogin}>
        <AnimatePresence mode="wait">
          {isLogin ? (
            <LoginForm
              username={username}
              password={password}
              showPassword={showPassword}
              isLoading={isLoading}
              setUsername={setUsername}
              setPassword={setPassword}
              setShowPassword={setShowPassword}
              handleLogin={handleLogin}
              toggleForm={toggleForm}
            />
          ) : (
            <SignupForm
              firstname={firstname}
              username={username}
              email={email}
              password={password}
              showPassword={showPassword}
              isLoading={isLoading}
              setFirstname={setFirstname}
              setUsername={setUsername}
              setEmail={setEmail}
              setPassword={setPassword}
              setShowPassword={setShowPassword}
              handleSignup={handleSignup}
              toggleForm={toggleForm}
            />
          )}
        </AnimatePresence>
      </AuthCard>

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
