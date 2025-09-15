"use client";

import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import ToggleButtons from "./ToggleButtons";

function AuthCard({ isLogin, setIsLogin, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-md"
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <UserCheck className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-300">
            {isLogin ? (
              "Sign in to continue to your account"
            ) : (
              <>
                Join and start your journey with{" "}
                <span className="logo text-yellow-400 text-xl">Life Craft</span>
              </>
            )}
          </p>
        </div>

        <ToggleButtons isLogin={isLogin} setIsLogin={setIsLogin} />

        {children}
      </div>
    </motion.div>
  );
}

export default AuthCard;
