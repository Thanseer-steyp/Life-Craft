"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/components/config/axiosInstance";

export default function ProfileSetupForm() {
  const [profileExists, setProfileExists] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axiosInstance.get("/api/v1/user/profile-setup/");
        setProfileExists(res.data.profile_exists);

        if (res.data.profile_exists) {
          setProfileData(res.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      dob: e.target.dob.value,
      gender: e.target.gender.value,
      marital_status: e.target.marital_status.value,
      phone_number: e.target.phone.value,
      country: e.target.country.value,
      state: e.target.state.value,
      job: e.target.job.value || null,
      monthly_income: e.target.monthly_income.value || null,
      interests: e.target.interests.value || null,
      bio: e.target.bio.value || null,
      retirement_planning_age: e.target.retirement_age.value,
      current_assets: assets.map((a) => a.type),
      post_retirement_life_plans: e.target.post_life_plans.value || null,
      post_retirement_location_preferences: e.target.retirement_location.value || null,
      dreams: e.target.dreams.value || null,
    };

    try {
      const res = await axiosInstance.post("/api/v1/user/profile-setup/", payload);

      alert("Profile submitted successfully!");

      // 🔥 Switch to details view immediately
      setProfileExists(true);
      setProfileData(res.data);

    } catch (error) {
      if (error.response?.data?.error === "Profile already created") {
        alert("You already submitted your profile.");
      } else {
        alert("Failed to submit");
      }
    }
  };

  // 🟡 Loading state
  if (loading) return <p className="text-center p-6">Loading...</p>;


  // 🟢 If profile exists → show details instead of form
  if (profileExists && profileData) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl text-black">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <div className="space-y-3">
          <p><strong>Name:</strong> {profileData.full_name}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>DOB:</strong> {profileData.dob}</p>
          <p><strong>Gender:</strong> {profileData.gender}</p>
          <p><strong>Marital Status:</strong> {profileData.marital_status}</p>
          <p><strong>Phone:</strong> {profileData.phone_number}</p>
          <p><strong>Country:</strong> {profileData.country}</p>
          <p><strong>State:</strong> {profileData.state}</p>
          <p><strong>Job:</strong> {profileData.job || "—"}</p>
          <p><strong>Monthly Income:</strong> {profileData.monthly_income || "—"}</p>
          <p><strong>Interests:</strong> {profileData.interests || "—"}</p>
          <p><strong>Bio:</strong> {profileData.bio || "—"}</p>
          <p><strong>Retirement Age:</strong> {profileData.retirement_planning_age}</p>

          <p><strong>Assets:</strong> 
            {profileData.current_assets?.length ? 
              profileData.current_assets.join(", ") : "—"}
          </p>

          <p><strong>Post Retirement Plans:</strong> {profileData.post_retirement_life_plans || "—"}</p>
          <p><strong>Preferred Retirement Location:</strong> {profileData.post_retirement_location_preferences || "—"}</p>
          <p><strong>Dreams:</strong> {profileData.dreams || "—"}</p>
        </div>
      </div>
    );
  }

  // 🟣 If no profile → show the form (your existing form)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* DOB + Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Date of Birth</label>
            <input
              type="date"
              name="dob"
              required
              className="w-full border rounded p-2 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Gender</label>
            <select
              name="gender"
              required
              className="w-full border rounded p-2 text-black"
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Marital + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Marital Status</label>
            <select
              name="marital_status"
              required
              className="w-full border rounded p-2 text-black"
            >
              <option value="">Select</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Phone Number</label>
            <input
              type="text"
              name="phone"
              required
              className="w-full border rounded p-2 text-black"
            />
          </div>
        </div>

        {/* Country + State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Country</label>
            <input
              type="text"
              name="country"
              required
              className="w-full border rounded p-2 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">State</label>
            <input
              type="text"
              name="state"
              required
              className="w-full border rounded p-2 text-black"
            />
          </div>
        </div>

        {/* Job + Income */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Job (optional)</label>
            <input
              type="text"
              name="job"
              className="w-full border rounded p-2 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">
              Monthly Income (optional)
            </label>
            <input
              type="number"
              name="monthly_income"
              className="w-full border rounded p-2 text-black"
            />
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block mb-1 font-semibold">
            Interests (optional)
          </label>
          <textarea
            name="interests"
            className="w-full border rounded p-2 text-black"
          ></textarea>
        </div>

        {/* Bio */}
        <div>
          <label className="block mb-1 font-semibold">Bio (optional)</label>
          <textarea
            name="bio"
            className="w-full border rounded p-2 text-black"
          ></textarea>
        </div>

        {/* Retirement Age */}
        <div>
          <label className="block mb-1 font-semibold">
            Retirement Planning Age
          </label>
          <input
            type="number"
            name="retirement_age"
            required
            className="w-full border rounded p-2 text-black"
          />
        </div>

        {/* Current Assets */}
        <div>
          <label className="block mb-2 font-semibold">
            Current Assets (max 5)
          </label>

          {assets.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-3">
              <select
                className="border rounded p-2 w-full text-black"
                value={item.type}
                onChange={(e) => updateAsset(index, e.target.value)}
              >
                <option value="">Select Asset</option>
                {assetTypes
                  .filter(
                    (type) =>
                      !usedAssetTypes.includes(type) || type === item.type
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
                  className="font-bold text-black"
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
              className="mt-2 px-3 py-1 border rounded text-black"
            >
              + Add Asset
            </button>
          )}
        </div>

        {/* Post Retirement Plans */}
        <div>
          <label className="block mb-1 font-semibold">
            Post-Retirement Life Plans (optional)
          </label>
          <textarea
            name="post_life_plans"
            className="w-full border rounded p-2 text-black"
          ></textarea>
        </div>

        {/* Location Preference */}
        <div>
          <label className="block mb-1 font-semibold">
            Post-Retirement Location Preferences (optional)
          </label>
          <input
            type="text"
            name="retirement_location"
            className="w-full border rounded p-2 text-black"
          />
        </div>

        {/* Dreams */}
        <div>
          <label className="block mb-1 font-semibold">
            Describe Your Dreams (optional)
          </label>
          <textarea
            name="dreams"
            className="w-full border rounded p-2 text-black"
          ></textarea>
        </div>

        {/* Submit */}
        <button className="px-6 py-3 border rounded-lg font-semibold w-full text-black">
          Submit Profile
        </button>
      </form>
  );
}
