"use client";

import React, { useEffect, useRef, useState } from "react";
import { User, FileText, Settings, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/components/config/axiosInstance";
import CustomAlert from "@/components/includes/CustomAlert";

export default function ProfileDashboardMerged() {
  const router = useRouter();

  // --- original form state (kept as-is) ---
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    marital_status: "",
    phone_number: "",
    country: "India",
    state: "",
    profile_picture: null,
    interests: "",
    job: "",
    monthly_income: "",
    bio: "",
    retirement_planning_age: "",
    current_savings: "",
    expected_savings_at_retirement: "",
    post_retirement_options: [],
    retirement_location_preference: "",
    dream_type: "",
    top_dream_1: "",
    top_dream_2: "",
    top_dream_3: "",
    top_dream_priorities: "",
    initial_plan: "",
    dream_description: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });

  // NEW: read-only mode after successful save
  const [readOnly, setReadOnly] = useState(true);

  // section refs for smooth scrolling
  const personalRef = useRef(null);
  const retirementRef = useRef(null);
  const lifestyleRef = useRef(null);
  const dreamsRef = useRef(null);

  useEffect(() => {
    const access = localStorage.getItem("access");
    setToken(access);

    if (access) {
      axiosInstance
        .get("api/v1/user/user-dashboard/")
        .then((res) => {
          setUserFullName(res.data.name || "");
          setUserEmail(res.data.email || "");
          setUserName(res.data.username || "");

          // If backend returns existing profile data, populate formData (safe-guard)
          const profile = res.data.profile || null;
          if (profile) {
            // Map backend fields if available — only set if value exists
            setFormData((prev) => ({
              ...prev,
              dob: profile.dob || prev.dob,
              gender: profile.gender || prev.gender,
              marital_status: profile.marital_status || prev.marital_status,
              phone_number: profile.phone_number || prev.phone_number,
              country: profile.country || prev.country,
              state: profile.state || prev.state,
              // NOTE: profile_picture is a URL from backend; keep preview and don't set File object
              interests: profile.interests || prev.interests,
              job: profile.job || prev.job,
              monthly_income: profile.monthly_income || prev.monthly_income,
              bio: profile.bio || prev.bio,
              retirement_planning_age:
                profile.retirement_planning_age || prev.retirement_planning_age,
              current_savings: profile.current_savings || prev.current_savings,
              expected_savings_at_retirement:
                profile.expected_savings_at_retirement ||
                prev.expected_savings_at_retirement,
              post_retirement_options:
                profile.post_retirement_options || prev.post_retirement_options,
              retirement_location_preference:
                profile.retirement_location_preference ||
                prev.retirement_location_preference,
              dream_type: profile.dream_type || prev.dream_type,
              top_dream_1: profile.top_dream_1 || prev.top_dream_1,
              top_dream_2: profile.top_dream_2 || prev.top_dream_2,
              top_dream_3: profile.top_dream_3 || prev.top_dream_3,
              dream_description:
                profile.dream_description || prev.dream_description,
              initial_plan: profile.initial_plan || prev.initial_plan,
            }));

            if (profile.profile_picture) {
              let imageUrl = profile.profile_picture;
              // ✅ ensure it's an absolute URL
              if (!/^https?:\/\//i.test(imageUrl)) {
                imageUrl = `${axiosInstance.defaults.baseURL.replace(
                  /\/$/,
                  ""
                )}${imageUrl}`;
              }
              setPreview(imageUrl);
            }

            // If profile has been completed previously, lock the form
            if (profile.is_completed) {
              setReadOnly(true);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axiosInstance.get("api/v1/user/user-dashboard/");
      const profile = res.data.profile || {};

      setFormData((prev) => ({
        ...prev,
        ...profile,
      }));

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          // ...existing field assignments...
        }));

        if (profile.profile_picture) {
          let imageUrl = profile.profile_picture;
          if (!/^https?:\/\//i.test(imageUrl)) {
            imageUrl = `${axiosInstance.defaults.baseURL.replace(
              /\/$/,
              ""
            )}${imageUrl}`;
          }
          setPreview(imageUrl);
        }

        const hasAnyData = Object.values(profile || {}).some(
          (v) => v && v !== ""
        );
        setReadOnly(hasAnyData); // ✅ lock if profile already filled
      }
    } catch (err) {
      console.error("Failed to fetch updated profile:", err);
    }
  };

  // POST_RETIREMENT_CHOICES kept same
  const POST_RETIREMENT_CHOICES = [
    "Travel",
    "Hobbies",
    "Family Together",
    "Social Work",
    "Garage/Car Projects",
    "Luxury Life",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (readOnly) return; // prevent changes when read-only

    if (type === "checkbox" && name === "post_retirement_options") {
      let updated = [...formData.post_retirement_options];
      if (checked) updated.push(value);
      else updated = updated.filter((item) => item !== value);
      setFormData({ ...formData, post_retirement_options: updated });
    } else if (type === "file") {
      setFormData({ ...formData, profile_picture: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- handleSubmit: preserved logic, but sets readOnly on success ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setAlert({
        message: "You must be logged in to submit your profile.",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    setAlert({ message: "", type: "" });

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach((v) => data.append(key, v));
        else if (value !== null && typeof value !== "undefined")
          data.append(key, value);
      });

      await axiosInstance.post("api/v1/user/profile-setup/", data);

      // ✅ Re-fetch updated profile to get new image URL
      await fetchUserProfile();

      setAlert({ message: "Profile created successfully!", type: "success" });
      setReadOnly(true);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err) {
      console.error(err);
      setAlert({
        message: "Failed to save profile. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Smooth scroll handler
  const scrollTo = (refName) => {
    const map = {
      personal: personalRef,
      retirement: retirementRef,
      lifestyle: lifestyleRef,
      dreams: dreamsRef,
    };
    const ref = map[refName];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // avatar initial
  const avatarInitial = userFullName
    ? userFullName.trim().charAt(0).toUpperCase()
    : userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="bg-gray-50 p-8 text-black min-h-[calc(100vh - 68px)]">
      <div className="w-4/5 mx-auto">
        <div className="bg-white rounded-xl shadow-sm ">
          <div className="flex">
            {/* Sidebar */}
            <aside className="w-1/4 border-r border-gray-200 p-6">
              <div className="text-center mb-8">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border border-gray-200"
                    style={{
                      background: preview
                        ? "transparent"
                        : "linear-gradient(135deg,#60a5fa,#a78bfa)",
                    }}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="avatar"
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold">
                        {avatarInitial}
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  {!readOnly && (
                    <>
                      <input
                        id="profile_upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData((prev) => ({
                              ...prev,
                              profile_picture: file,
                            }));
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile_upload"
                        className="absolute bottom-0 right-0 bg-gray-600 p-1.5 rounded-full text-white cursor-pointer hover:bg-blue-700"
                        title="Upload new picture"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-switch-camera-icon lucide-switch-camera"
                        >
                          <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                          <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                          <circle cx="12" cy="12" r="3" />
                          <path d="m18 22-3-3 3-3" />
                          <path d="m6 2 3 3-3 3" />
                        </svg>
                      </label>
                    </>
                  )}
                </div>

                <h2 className="font-semibold text-gray-900">
                  {userFullName || userName || "User"}
                </h2>
                <p className="text-sm text-gray-500">{userEmail || "—"}</p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => scrollTo("personal")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-gray-100 text-gray-900 rounded-lg font-medium"
                >
                  <User className="w-4 h-4" /> Personal Information
                </button>

                <button
                  onClick={() => scrollTo("retirement")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <FileText className="w-4 h-4" /> Retirement Plans
                </button>

                <button
                  onClick={() => scrollTo("lifestyle")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Settings className="w-4 h-4" /> Post-Retirement Lifestyle
                </button>

                <button
                  onClick={() => scrollTo("dreams")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Calendar className="w-4 h-4" /> Dream Plans
                </button>
              </nav>

              {/* Edit toggle shown when readOnly is true */}
              {readOnly && (
                <div className="mt-6">
                  <button
                    onClick={() => setReadOnly(false)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </aside>

            {/* Main Content Area */}
            <main
              className="flex-1 p-8 overflow-y-auto"
            >
              <form onSubmit={handleSubmit} className="space-y-8 pr-4">
                {/* Account Info (read-only) */}
                <section className="mb-6 p-4 bg-gray-50 shadow-xl rounded-xl">
                  <h3 className="text-3xl font-bold mb-2 text-center">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    Fill the details below and click Save Profile
                  </p>
                </section>

                {/* Personal Information */}
                <section
                  ref={personalRef}
                  id="personal"
                  className="p-4 bg-gray-50 shadow-xl rounded-xl"
                >
                  <div className="flex items-center gap-3 my-5">
                    <hr className="flex-grow border-gray-300" />
                    <h3 className="text-xl font-semibold whitespace-nowrap">
                      Personal Information
                    </h3>
                    <hr className="flex-grow border-gray-300" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="dob"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Date of Birth
                      </label>
                      <input
                        id="dob"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="gender"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      >
                        <option value="">Select Gender</option>
                        <option value="men">Male</option>
                        <option value="women">Female</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="marital_status"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Maritial Status
                      </label>
                      <select
                        id="marital_status"
                        name="marital_status"
                        value={formData.marital_status}
                        onChange={handleChange}
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      >
                        <option value="">Select Marital Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="phone_number"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="country"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      >
                        <option value="India">India</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="state"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        State
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      >
                        <option value="">Select State</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="job"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Job
                      </label>
                      <input
                        id="job"
                        type="text"
                        name="job"
                        value={formData.job}
                        onChange={handleChange}
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="monthly_income"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Monthly Income
                      </label>
                      <input
                        id="monthly_income"
                        type="number"
                        name="monthly_income"
                        value={formData.monthly_income}
                        onChange={handleChange}
                        placeholder="Monthly Income"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="interests"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Interests
                      </label>
                      <textarea
                        name="interests"
                        id="interests"
                        value={formData.interests}
                        onChange={handleChange}
                        placeholder="Interests"
                        className="border rounded p-2 border-gray-300 bg-white col-span-2"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="bio"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Bio"
                        className="border rounded p-2 border-gray-300 bg-white col-span-2"
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </section>

                {/* Retirement Planning */}
                <section
                  ref={retirementRef}
                  id="retirement"
                  className="p-4 bg-gray-50 shadow-xl rounded-xl"
                >
                  <div className="flex items-center gap-3 my-5">
                    <hr className="flex-grow border-gray-300" />
                    <h3 className="text-xl font-semibold whitespace-nowrap">
                      Retirement Planning
                    </h3>
                    <hr className="flex-grow border-gray-300" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="retirement_planning_age"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Retirement Planning Age
                      </label>
                      <input
                        type="number"
                        id="retirement_planning_age"
                        name="retirement_planning_age"
                        value={formData.retirement_planning_age}
                        onChange={handleChange}
                        placeholder="Planned Retirement Age"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="current_savings"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Current Savings
                      </label>
                      <input
                        id="current_savings"
                        type="number"
                        name="current_savings"
                        value={formData.current_savings}
                        onChange={handleChange}
                        placeholder="Current Savings"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="expected_savings_at_retirement"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Expected Savings at Retirement
                      </label>
                      <input
                        id="expected_savings_at_retirement"
                        type="number"
                        name="expected_savings_at_retirement"
                        value={formData.expected_savings_at_retirement}
                        onChange={handleChange}
                        placeholder="Expected Savings at Retirement"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </section>

                {/* Post-Retirement Lifestyle */}
                <section
                  ref={lifestyleRef}
                  id="lifestyle"
                  className="p-4 bg-gray-50 shadow-xl rounded-xl"
                >
                  <div className="flex items-center gap-3 my-5">
                    <hr className="flex-grow border-gray-300" />
                    <h3 className="text-xl font-semibold whitespace-nowrap">
                      Post Retirement Lifestyle
                    </h3>
                    <hr className="flex-grow border-gray-300" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {POST_RETIREMENT_CHOICES.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="post_retirement_options"
                          value={option}
                          checked={formData.post_retirement_options.includes(
                            option
                          )}
                          onChange={handleChange}
                          disabled={readOnly}
                        />
                        {option}
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col mt-3">
                    <label
                      htmlFor="retirement_location_preference"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Post Retirement Location Preferences
                    </label>
                    <input
                      type="text"
                      id="retirement_location_preference"
                      name="retirement_location_preference"
                      value={formData.retirement_location_preference}
                      onChange={handleChange}
                      placeholder="Preferred Retirement Location"
                      className="border rounded p-2 border-gray-300 bg-white w-full"
                      disabled={readOnly}
                    />
                  </div>
                </section>

                {/* Dreams Section */}
                <section
                  ref={dreamsRef}
                  id="dreams"
                  className="p-4 bg-gray-50 shadow-xl rounded-xl"
                >
                  <div className="flex items-center gap-3 my-5">
                    <hr className="flex-grow border-gray-300" />
                    <h3 className="text-xl font-semibold whitespace-nowrap">
                      Dreams
                    </h3>
                    <hr className="flex-grow border-gray-300" />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="dream_type"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Dream Type
                    </label>
                    <select
                      id="dream_type"
                      name="dream_type"
                      value={formData.dream_type}
                      onChange={handleChange}
                      className="border rounded p-2 border-gray-300 bg-white mb-3 w-full"
                      disabled={readOnly}
                    >
                      <option value="">Select Dream Type</option>
                      <option value="Pre Retirement">Pre Retirement</option>
                      <option value="Post Retirement">Post Retirement</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="top_dream_1"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Dream 1
                      </label>
                      <input
                        id="top_dream_1"
                        type="text"
                        name="top_dream_1"
                        value={formData.top_dream_1}
                        onChange={handleChange}
                        placeholder="Top Dream 1"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="top_dream_2"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Dream 2
                      </label>
                      <input
                        type="text"
                        name="top_dream_2"
                        value={formData.top_dream_2}
                        onChange={handleChange}
                        placeholder="Dream 2"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="dream_3"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Dream 3
                      </label>
                      <input
                        type="text"
                        name="top_dream_3"
                        value={formData.top_dream_3}
                        onChange={handleChange}
                        placeholder="Dream 3"
                        className="border rounded p-2 border-gray-300 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col mt-3">
                    <label
                      htmlFor="dream_description"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Description About Dream
                    </label>
                    <textarea
                      name="dream_description"
                      value={formData.dream_description}
                      onChange={handleChange}
                      placeholder="Description"
                      className="border rounded p-2 border-gray-300 bg-white w-full"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="flex flex-col mt-3">
                    <label
                      htmlFor="initial_plan"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Plans About Dream
                    </label>
                    <textarea
                      name="initial_plan"
                      value={formData.initial_plan}
                      onChange={handleChange}
                      placeholder="Plans"
                      className="border rounded p-2 border-gray-300 bg-white w-full "
                      disabled={readOnly}
                    />
                  </div>
                </section>

                {/* Single Save Button */}
                <div className="pt-6 pb-12">
                  <button
                    type="submit"
                    disabled={loading || readOnly}
                    className={`w-full py-3 rounded-lg font-semibold text-white ${
                      loading || readOnly
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading
                      ? "Saving..."
                      : readOnly
                      ? "Profile Saved"
                      : "Save Profile"}
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>

      {/* Alert */}
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
    </div>
  );
}
