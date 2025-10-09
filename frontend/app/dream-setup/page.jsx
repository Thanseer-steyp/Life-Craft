"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Target, DollarSign, Calendar, PiggyBank, FileText, Sparkles, TrendingUp } from "lucide-react";

function DreamSetupForm() {
  const router = useRouter();
  const [dream, setDream] = useState({
    dream_name: "",
    budget: "",
    timeline_months: "",
    current_savings: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDream((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in to submit a dream.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("dream_name", dream.dream_name);
      formData.append("budget", dream.budget);
      formData.append("timeline_months", dream.timeline_months);
      formData.append("current_savings", dream.current_savings);
      formData.append("description", dream.description);

      await axios.post(
        "http://localhost:8000/api/v1/user/dream-setup/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Dream submitted successfully!");
      setDream({
        dream_name: "",
        budget: "",
        timeline_months: "",
        current_savings: "",
        description: "",
      });

      router.push("/user-dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Error submitting dream.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = dream.budget && dream.current_savings 
    ? Math.min((parseFloat(dream.current_savings) / parseFloat(dream.budget)) * 100, 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Define Your Dream
          </h1>
          <p className="text-gray-600 text-lg">Let's make your aspirations a reality</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-center font-medium ${
              message.includes("Error") 
                ? "bg-red-50 text-red-700 border border-red-200" 
                : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dream Name */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dream Name
              </label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  name="dream_name"
                  value={dream.dream_name}
                  onChange={handleChange}
                  placeholder="e.g., Dream Home, World Tour, New Business"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Budget and Current Savings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Budget
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  <input
                    type="number"
                    name="budget"
                    value={dream.budget}
                    onChange={handleChange}
                    placeholder="50000"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Savings
                </label>
                <div className="relative">
                  <PiggyBank className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-500" />
                  <input
                    type="number"
                    name="current_savings"
                    value={dream.current_savings}
                    onChange={handleChange}
                    placeholder="10000"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none text-gray-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {dream.budget && dream.current_savings && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                    Progress to Goal
                  </span>
                  <span className="text-sm font-bold text-purple-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Timeline (Months)
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="number"
                  name="timeline_months"
                  value={dream.timeline_months}
                  onChange={handleChange}
                  placeholder="24"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-800"
                  required
                />
              </div>
              {dream.timeline_months && (
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  That's approximately {Math.ceil(dream.timeline_months / 12)} year{Math.ceil(dream.timeline_months / 12) !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dream Description
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-rose-400" />
                <textarea
                  name="description"
                  value={dream.description}
                  onChange={handleChange}
                  placeholder="Describe your dream in detail... What does it mean to you?"
                  rows="4"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none resize-none text-gray-800"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Your Dream...
                </span>
              ) : (
                "Continue to Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          We'll help you create a personalized plan to achieve your dream
        </p>
      </div>
    </div>
  );
}

export default DreamSetupForm;