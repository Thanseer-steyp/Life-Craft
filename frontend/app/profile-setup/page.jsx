"use client";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/components/config/AxiosInstance";
import CustomAlert from "@/components/includes/CustomAlert";
import { useContext } from "react";
import { UserContext } from "@/components/config/UserProvider";
import CustomDatePicker from "@/components/utils/CustomDatePicker";

function ProfileSetupForm() {
  const [profileExists, setProfileExists] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const { userData, setUserData } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  const formRef = useRef(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [displayDob, setDisplayDob] = useState("");

  const [formData, setFormData] = useState({
    dob: profileData?.dob || "",
    gender: profileData?.gender || "",
    marital_status: profileData?.marital_status || "",
    phone_number: profileData?.phone_number || "",
    country: profileData?.country || "",
    state: profileData?.state || "",
    job: profileData?.job || "",
    monthly_income: profileData?.monthly_income || "",
    interests: profileData?.interests || "",
    bio: profileData?.bio || "",
    retirement_planning_age: profileData?.retirement_planning_age || "",
    post_retirement_life_plans: profileData?.post_retirement_life_plans || "",
    post_retirement_location_preferences:
      profileData?.post_retirement_location_preferences || "",
    dreams: profileData?.dreams || "",
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        dob: profileData.dob || "",
        gender: profileData.gender || "",
        marital_status: profileData.marital_status || "",
        phone_number: profileData.phone_number || "",
        country: profileData.country || "",
        state: profileData.state || "",
        job: profileData.job || "",
        monthly_income: profileData.monthly_income || "",
        interests: profileData.interests || "",
        bio: profileData.bio || "",
        retirement_planning_age: profileData.retirement_planning_age || "",
        post_retirement_life_plans:
          profileData.post_retirement_life_plans || "",
        post_retirement_location_preferences:
          profileData.post_retirement_location_preferences || "",
        dreams: profileData.dreams || "",
      });
    }
  }, [profileData]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("api/v1/user/profile-setup/");
        setProfileExists(res.data.profile_exists);

        if (res.data.profile_exists) {
          setProfileData(res.data.data);
          setUserData({
            username: res.data.data.username,
            email: res.data.data.email,
            full_name: res.data.data.full_name,
            profile_picture: res.data.data.profile_picture,
          });
        } else {
          setUserData(res.data.user);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateStep = () => {
    if (activeTab === "personal") {
      const requiredFields = [
        "dob",
        "gender",
        "marital_status",
        "phone_number",
        "country",
        "state",
      ];

      for (let field of requiredFields) {
        if (!formData[field]) {
          setAlert({
            message: "Please fill all required fields before proceeding.",
            type: "error",
          });
          return false;
        }
      }
    }

    if (activeTab === "retirement") {
      const requiredFields = ["retirement_planning_age"];

      for (let field of requiredFields) {
        if (!formData[field]) {
          setAlert({
            message: "Please fill all required fields before proceeding.",
            type: "error",
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);
  };

  const handleSubmit = async () => {
    const fd = new FormData();

    // Format and append DOB properly
    if (formData.dob) {
      const dateObj = new Date(formData.dob);
      const formattedDOB = dateObj.toISOString().split("T")[0];
      fd.append("dob", formattedDOB);
    }

    if (selectedFile) {
      fd.append("profile_picture", selectedFile);
    }

    // Append other fields except dob
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "dob") {
        fd.append(key, value);
      }
    });

    try {
      let res;

      if (editing) {
        res = await axiosInstance.put("/api/v1/user/profile-setup/", fd);
        setAlert({ message: "Profile edited successfully", type: "success" });
      } else {
        res = await axiosInstance.post("/api/v1/user/profile-setup/", fd);
        setAlert({ message: "Profile created Successfully", type: "success" });
      }

      setProfileExists(true);
      setProfileData(res.data);
      setEditing(false);
      setUserData({
        username: res.data.username,
        email: res.data.email,
        full_name: res.data.full_name,
        profile_picture: res.data.profile_picture,
      });
    } catch (error) {
      if (error.response?.data?.error === "Profile already created") {
        alert("You already submitted your profile.");
      } else {
        alert("Failed to submit");
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "USER";
    return name.charAt(0).toUpperCase();
  };

  const getDisplayImage = () => {
    if (previewImage) return previewImage;

    if (userData?.profile_picture) {
      const base = axiosInstance.defaults.baseURL?.replace(/\/$/, "");
      const filePath = userData.profile_picture.replace(/^\//, "");
      return `${base}/${filePath}`;
    }

    return null;
  };

  if (loading)
    return <p className="text-center p-6 text-gray-600">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col items-center">
        <div className="text-center">
          <div className="mb-4 relative w-32 h-32 mx-auto">
            {getDisplayImage() ? (
              <img
                src={getDisplayImage()}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-black text-4xl font-bold border border-gray-200">
                {getInitials(userData?.full_name || userData?.username)}
              </div>
            )}

            {(!profileExists || editing) && (
              <>
                <label
                  htmlFor="profilePicInput"
                  className="absolute bottom-1 right-1 bg-black/80 text-white p-2 rounded-full cursor-pointer hover:bg-black/80 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7h4l1-2h8l1 2h4v13H3V7zm9 3a4 4 0 100 8 4 4 0 000-8z"
                    />
                  </svg>
                </label>

                <input
                  id="profilePicInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {userData?.full_name || userData?.username || "User"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">{userData?.email}</p>

          {profileExists && (
            <button
              onClick={() => {
                if (editing) {
                  handleSubmit();
                } else {
                  setActiveTab("personal");
                  setEditing(true);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              {editing ? "Save Profile" : "Edit Profile"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-8">
        {profileExists && profileData && !editing ? (
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-2xl">
            <div className="text-center py-6 border-b">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Profile
              </h1>
              <p className="text-gray-500">View your profile information</p>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Personal Information
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {new Date(profileData.dob).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.age}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.gender}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.phone_number}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.country}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.state}
                      </div>
                    </div>
                  </div>

                  {profileData.job && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maritial Status
                        </label>
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                          {profileData.marital_status}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job
                        </label>
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                          {profileData.job || ""}
                        </div>
                      </div>

                      {profileData.monthly_income && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Income
                          </label>
                          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                            {profileData.monthly_income || ""}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    {profileData.interests && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interests
                        </label>
                        <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                          {profileData.interests || ""}
                        </div>
                      </div>
                    )}

                    {profileData.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                          {profileData.bio || ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Retirement Planning
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retirement Planning Age
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.retirement_planning_age}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Left To Retire
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.retirement_time_left}
                      </div>
                    </div>
                  </div>

                  {profileData.post_retirement_life_plans && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post-Retirement Life Plans
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                        {profileData.post_retirement_life_plans || ""}
                      </div>
                    </div>
                  )}

                  {profileData.post_retirement_location_preferences && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post-Retirement Location Preferences
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.post_retirement_location_preferences || ""}
                      </div>
                    </div>
                  )}

                  {profileData.dreams && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe Your Dreams
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                        {profileData.dreams || ""}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-center py-6 border-b">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-500">Fill the details below</p>
            </div>

            <div className="bg-white p-8">
              <div ref={formRef} className="space-y-8">
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth <span className="text-red-600">*</span>
                        </label>

                        <div
                          onClick={() => setShowCustomDatePicker(true)}
                          className="cursor-pointer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900 bg-white"
                        >
                          {displayDob || "Select Date of Birth"}
                        </div>

                        {showCustomDatePicker && (
                          <CustomDatePicker
                          formData={formData}
                          setFormData={setFormData}
                          setDisplayDate={setDisplayDob}
                          setShowCustomDatePicker={setShowCustomDatePicker}
                          type="dob"
                          onDateSelect={(date) => {
                            setFormData(prev => ({ ...prev, dob: date }));
                          }}
                        />
                        
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender <span className="text-red-600">*</span>
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900 bg-white"
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marital Status <span className="text-red-600">*</span>
                        </label>
                        <select
                          name="marital_status"
                          value={formData.marital_status}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900 bg-white"
                        >
                          <option value="" disabled>
                            Select Marital Status
                          </option>
                          <option>Single</option>
                          <option>Married</option>
                          <option>Divorced</option>
                          <option>Widowed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job
                        </label>
                        <input
                          type="text"
                          name="job"
                          value={formData.job}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Income
                        </label>
                        <input
                          type="number"
                          name="monthly_income"
                          value={formData.monthly_income}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interests
                      </label>
                      <input
                        type="text"
                        name="interests"
                        rows="3"
                        value={formData.interests}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows="3"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900 resize-none"
                      ></textarea>
                    </div>
                    <p className="text-sm text-center text-gray-500">
                      We ask you to provide the following information. Please
                      note that all fields marked with an asterisk (
                      <span className="text-red-500">*</span>) are required.
                    </p>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep()) setActiveTab("retirement");
                        }}
                        className="flex items-center gap-1 bg-black/95 hover:bg-black text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                      >
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-arrow-right-icon lucide-arrow-right"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "retirement" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retirement Planning Age{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="retirement_planning_age"
                        value={formData.retirement_planning_age}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post-Retirement Life Plans
                      </label>
                      <textarea
                        name="post_retirement_life_plans"
                        value={formData.post_retirement_life_plans}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900 resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post-Retirement Location Preferences
                      </label>
                      <input
                        type="text"
                        name="post_retirement_location_preferences"
                        value={formData.post_retirement_location_preferences}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe Your Dreams
                      </label>
                      <textarea
                        name="dreams"
                        rows="3"
                        value={formData.dreams}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md text-gray-900 resize-none"
                      ></textarea>
                    </div>
                    <p className="text-sm text-center text-gray-500">
                      We ask you to provide the following information. Please
                      note that all fields marked with an asterisk (
                      <span className="text-red-500">*</span>) are required.
                    </p>

                    <div className="flex justify-between">
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => setActiveTab("personal")}
                          className="flex items-center gap-1 bg-black/95 hover:bg-black text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-arrow-left-icon lucide-arrow-left"
                          >
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                          </svg>{" "}
                          Back
                        </button>
                      </div>
                      <div className="">
                        <button
                          type="button"
                          onClick={() => {
                            if (validateStep()) handleSubmit();
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Save Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
    </div>
  );
}

export default ProfileSetupForm;
