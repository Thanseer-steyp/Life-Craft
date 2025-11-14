"use client";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/components/config/axiosInstance";
import CustomAlert from "@/components/includes/CustomAlert";

function ProfileSetupForm() {
  const [profileExists, setProfileExists] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  const formRef = useRef(null);

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
          // Profile doesn't exist, use user data from response
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

  const [assets, setAssets] = useState([{ type: "" }]);
  const assetTypes = ["Cash", "Vehicles", "Gold", "House", "Land"];

  const addAsset = () => {
    if (assets.length < 5) setAssets([...assets, { type: "" }]);
  };

  const updateAsset = (index, value) => {
    const updated = [...assets];
    updated[index].type = value;
    setAssets(updated);
  };

  const removeAsset = (index) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const usedAssetTypes = assets.map((a) => a.type).filter(Boolean);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);
  };

  const handleSubmit = async () => {
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData();

    // File

    if (selectedFile) {
      formData.append("profile_picture", selectedFile);
    }

    // Normal text fields
    formData.append("dob", form.querySelector('[name="dob"]').value);
    formData.append("gender", form.querySelector('[name="gender"]').value);
    formData.append(
      "marital_status",
      form.querySelector('[name="marital_status"]').value
    );
    formData.append("phone_number", form.querySelector('[name="phone"]').value);
    formData.append("country", form.querySelector('[name="country"]').value);
    formData.append("state", form.querySelector('[name="state"]').value);
    formData.append("job", form.querySelector('[name="job"]').value || "");
    formData.append(
      "monthly_income",
      form.querySelector('[name="monthly_income"]').value || ""
    );
    formData.append(
      "interests",
      form.querySelector('[name="interests"]').value || ""
    );
    formData.append("bio", form.querySelector('[name="bio"]').value || "");
    formData.append(
      "retirement_planning_age",
      form.querySelector('[name="retirement_age"]').value
    );
    formData.append(
      "post_retirement_life_plans",
      form.querySelector('[name="post_life_plans"]').value || ""
    );
    formData.append(
      "post_retirement_location_preferences",
      form.querySelector('[name="retirement_location"]').value || ""
    );
    formData.append(
      "dreams",
      form.querySelector('[name="dreams"]').value || ""
    );

    // Assets → array
    assets.forEach((asset, index) => {
      formData.append(`current_assets[${index}]`, asset.type);
    });

    try {
      let res;

      if (editing) {
        // UPDATE existing profile
        res = await axiosInstance.put("/api/v1/user/profile-setup/", formData);
        setAlert({ message: "Profile edited successfully", type: "success" });
      } else {
        // CREATE new profile
        res = await axiosInstance.post("/api/v1/user/profile-setup/", formData);
        setAlert({ message: "Profile created Successfully", type: "success" });
      }

      

      // 🔥 Switch to details view immediately
      setProfileExists(true);
      setProfileData(res.data);
      setEditing(false); // Go back to details view
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

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "USER";
    return name.charAt(0).toUpperCase();
  };

  // Get display image
  const getDisplayImage = () => {
    if (previewImage) return previewImage;

    if (userData?.profile_picture) {
      const base = axiosInstance.defaults.baseURL?.replace(/\/$/, "");
      const filePath = userData.profile_picture.replace(/^\//, "");
      return `${base}/${filePath}`;
    }

    return null;
  };

  // 🟡 Loading state
  if (loading)
    return <p className="text-center p-6 text-gray-600">Loading...</p>;

  // Main layout with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col items-center">
        <div className="text-center">
          {/* Profile Picture / Avatar */}
          <div className="mb-4 relative w-32 h-32 mx-auto">
            {/* IMAGE OR INITIALS */}
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

            {/* CAMERA CHANGE ICON */}
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

                {/* HIDDEN INPUT */}
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

          {/* User Info */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {userData?.full_name || userData?.username || "User"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">{userData?.email}</p>

          {/* Edit Profile Button - Only show when profile exists */}
          {profileExists && (
            <button
              onClick={() => {
                if (editing) {
                  handleSubmit(); // when already editing → save profile
                } else {
                  setEditing(true); // go into edit mode
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              {editing ? "Save Profile" : "Edit Profile"}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {profileExists && profileData && !editing ? (
          // 🟢 Profile Details View (styled like form)
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Profile
              </h1>
              <p className="text-gray-500">View your profile information</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {/* Personal Information Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Personal Information
                </h2>

                <div className="space-y-6">
                  {/* DOB + Gender */}
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

                  {/* Marital + Phone */}
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
                        {profileData.job || "—"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {profileData.monthly_income || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Country + State */}
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

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interests
                      </label>
                      <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                        {profileData.interests || "—"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                        {profileData.bio || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retirement Planning Section */}
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Retirement Planning
                </h2>

                <div className="space-y-6">
                  {/* Retirement Age */}
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

                  {/* Current Assets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Assets
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {profileData.current_assets?.length
                        ? profileData.current_assets.join(", ")
                        : "—"}
                    </div>
                  </div>

                  {/* Post Retirement Plans */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post-Retirement Life Plans
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                      {profileData.post_retirement_life_plans || "—"}
                    </div>
                  </div>

                  {/* Location Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post-Retirement Location Preferences
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                      {profileData.post_retirement_location_preferences || "—"}
                    </div>
                  </div>

                  {/* Dreams */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Dreams
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]">
                      {profileData.dreams || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 🟣 Profile Setup Form
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-500">
                Fill the details below and click Save Profile
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div ref={formRef} className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Personal Information
                  </h2>

                  <div className="space-y-6">
                    {/* DOB + Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          defaultValue={profileData?.dob || ""}
                          name="dob"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          defaultValue={profileData?.gender || ""}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Marital + Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maritial Status
                        </label>
                        <select
                          name="marital_status"
                          defaultValue={profileData?.marital_status || ""}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        >
                          <option value="">Select Marital Status</option>
                          <option>Single</option>
                          <option>Married</option>
                          <option>Divorced</option>
                          <option>Widowed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phone"
                          defaultValue={profileData?.phone_number || ""}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Country + State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          defaultValue={profileData?.country || ""}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          defaultValue={profileData?.state || ""}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Job + Income */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job
                        </label>
                        <input
                          type="text"
                          name="job"
                          defaultValue={profileData?.job || ""}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Income
                        </label>
                        <input
                          type="number"
                          name="monthly_income"
                          defaultValue={profileData?.monthly_income || ""}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Interests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interests
                      </label>
                      <textarea
                        name="interests"
                        rows="3"
                        defaultValue={profileData?.interests || ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                      ></textarea>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        defaultValue={profileData?.bio || ""}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Retirement Planning Section */}
                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Retirement Planning
                  </h2>

                  <div className="space-y-6">
                    {/* Retirement Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retirement Planning Age
                      </label>
                      <input
                        type="number"
                        name="retirement_age"
                        defaultValue={
                          profileData?.retirement_planning_age || ""
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    {/* Current Assets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Assets (max 5)
                      </label>

                      {assets.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 mb-3"
                        >
                          <select
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            value={item.type}
                            onChange={(e) => updateAsset(index, e.target.value)}
                          >
                            <option value="">Select Asset</option>
                            {assetTypes
                              .filter(
                                (type) =>
                                  !usedAssetTypes.includes(type) ||
                                  type === item.type
                              )
                              .map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                          </select>

                          {index > 0 && (
                            <button
                              type="button"
                              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() => removeAsset(index)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}

                      {assets.length < 5 && (
                        <button
                          type="button"
                          onClick={addAsset}
                          className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Add Asset
                        </button>
                      )}
                    </div>

                    {/* Post Retirement Plans */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post-Retirement Life Plans
                      </label>
                      <textarea
                        name="post_life_plans"
                        defaultValue={
                          profileData?.post_retirement_life_plans || ""
                        }
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                      ></textarea>
                    </div>

                    {/* Location Preference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post-Retirement Location Preferences
                      </label>
                      <input
                        type="text"
                        name="retirement_location"
                        defaultValue={
                          profileData?.post_retirement_location_preferences ||
                          ""
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    {/* Dreams */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe Your Dreams
                      </label>
                      <textarea
                        name="dreams"
                        defaultValue={profileData?.dreams || ""}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Profile
                  </button>
                </div>
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
