"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User, Calendar, Briefcase, Heart, Upload, Sparkles } from "lucide-react";

function ProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    age: "",
    retirement_age: "",
    bio: "",
    interests: "",
    profile_image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);

  // Load access token from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_image") {
      setProfile((prev) => ({ ...prev, profile_image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in to submit the form.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("age", profile.age);
      formData.append("retirement_age", profile.retirement_age);
      formData.append("bio", profile.bio);
      formData.append("interests", profile.interests);
      if (profile.profile_image) {
        formData.append("profile_image", profile.profile_image);
      }

      await axios.post("http://localhost:8000/api/v1/user/profile-setup/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Profile submitted successfully!");
      setProfile({ age: "", retirement_age: "", bio: "", interests: "", profile_image: null });
      setPreview(null);
      router.push("/dream-setup");
    } catch (err) {
      console.error(err);
      setMessage("Error submitting profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Create Your Profile
          </h1>
          <p className="text-gray-600 text-lg">Let's get to know you better</p>
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
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ${
                  preview ? "" : "bg-gradient-to-br from-indigo-100 to-purple-100"
                }`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-indigo-300" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-110">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    name="profile_image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-3">Upload your profile photo</p>
            </div>

            {/* Age and Retirement Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    placeholder="25"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-800"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Retirement Age
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="number"
                    name="retirement_age"
                    value={profile.retirement_age}
                    onChange={handleChange}
                    placeholder="65"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Bio Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                About You
              </label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-indigo-400" />
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us your story..."
                  rows="4"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none text-gray-800"
                />
              </div>
            </div>

            {/* Interests Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Interests
              </label>
              <div className="relative">
                <Heart className="absolute left-4 top-4 w-5 h-5 text-pink-400" />
                <textarea
                  name="interests"
                  value={profile.interests}
                  onChange={handleChange}
                  placeholder="What do you love to do?"
                  rows="4"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none resize-none text-gray-800"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Your Profile...
                </span>
              ) : (
                "Continue to Dream Setup"
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Your information is secure and will only be used to personalize your experience
        </p>
      </div>
    </div>
  );
}

export default ProfileForm;