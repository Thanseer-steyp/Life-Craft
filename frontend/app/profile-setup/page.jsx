"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/components/config/axiosInstance";

export default function ProfileSetupPage() {
  const router = useRouter();

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
    post_retirement_options: [], // multi-select checkboxes
    retirement_location_preference: "",
    dream_type: "",
    top_dream_1: "",
    top_dream_2: "",
    top_dream_3: "",
    top_dream_priorities: "",
    initial_plan: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

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
        })
        .catch((err) => console.error(err));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in to submit your profile.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach((v) => data.append(key, v));
        else data.append(key, value);
      });

      await axiosInstance.post("api/v1/user/profile-setup/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Profile created successfully!");
      window.dispatchEvent(new Event("profile-updated"));
      router.push("/user-dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const POST_RETIREMENT_CHOICES = [
    "Travel",
    "Hobbies",
    "Family Together",
    "Social Work",
    "Garage/Car Projects",
    "Luxury Life",
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white text-black p-8 rounded-lg shadow-lg mb-10">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Complete Your Profile
      </h2>
      {message && <p className="text-center text-green-600 mb-4">{message}</p>}

      {/* Account Info */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Account Info</h3>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            value={userFullName}
            readOnly
            className="border rounded p-2 bg-gray-100 cursor-not-allowed"
            placeholder="Full Name"
          />
          <input
            type="email"
            value={userEmail}
            readOnly
            className="border rounded p-2 bg-gray-100 cursor-not-allowed"
            placeholder="Email"
          />
          <input
            type="text"
            value={userName}
            readOnly
            className="border rounded p-2 bg-gray-100 cursor-not-allowed"
            placeholder="Username"
          />
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="border rounded p-2"
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border rounded p-2"
            >
              <option value="">Select Gender</option>
              <option value="men">Male</option>
              <option value="women">Female</option>
            </select>

            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              className="border rounded p-2"
            >
              <option value="">Select Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>

            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border rounded p-2"
            />

            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="border rounded p-2"
            >
              <option value="India">India</option>
            </select>

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="border rounded p-2"
            >
              <option value="">Select State</option>
              <option value="Kerala">Kerala</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
            </select>

            <input
              type="text"
              name="job"
              value={formData.job}
              onChange={handleChange}
              placeholder="Job"
              className="border rounded p-2"
            />

            <input
              type="number"
              name="monthly_income"
              value={formData.monthly_income}
              onChange={handleChange}
              placeholder="Monthly Income"
              className="border rounded p-2"
            />

            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Interests"
              className="border rounded p-2 col-span-2"
            />

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              className="border rounded p-2 col-span-2"
            />

            <div>
              <label className="block mb-2">Profile Picture:</label>
              <input
                type="file"
                name="profile_picture"
                accept="image/*"
                onChange={handleChange}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 h-24 w-24 rounded-full object-cover"
                />
              )}
            </div>
          </div>
        </section>

        {/* Retirement Planning */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Retirement Planning</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="number"
              name="retirement_planning_age"
              value={formData.retirement_planning_age}
              onChange={handleChange}
              placeholder="Planned Retirement Age"
              className="border rounded p-2"
            />
            <input
              type="number"
              name="current_savings"
              value={formData.current_savings}
              onChange={handleChange}
              placeholder="Current Savings"
              className="border rounded p-2"
            />
            <input
              type="number"
              name="expected_savings_at_retirement"
              value={formData.expected_savings_at_retirement}
              onChange={handleChange}
              placeholder="Expected Savings at Retirement"
              className="border rounded p-2"
            />
          </div>
        </section>

        {/* Post-Retirement Lifestyle */}
        <section>
          <h3 className="text-xl font-semibold mb-3">
            Post-Retirement Lifestyle
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {POST_RETIREMENT_CHOICES.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="post_retirement_options"
                  value={option}
                  checked={formData.post_retirement_options.includes(option)}
                  onChange={handleChange}
                />
                {option}
              </label>
            ))}
          </div>

          <input
            type="text"
            name="retirement_location_preference"
            value={formData.retirement_location_preference}
            onChange={handleChange}
            placeholder="Preferred Retirement Location"
            className="border rounded p-2 mt-3 w-full"
          />
        </section>

        {/* Dreams Section */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Dreams</h3>
          <select
            name="dream_type"
            value={formData.dream_type}
            onChange={handleChange}
            className="border rounded p-2 mb-3 w-full"
          >
            <option value="">Select Dream Type</option>
            <option value="Pre Retirement">Pre Retirement</option>
            <option value="Post Retirement">Post Retirement</option>
          </select>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              name="top_dream_1"
              value={formData.top_dream_1}
              onChange={handleChange}
              placeholder="Top Dream 1"
              className="border rounded p-2"
            />
            <input
              type="text"
              name="top_dream_2"
              value={formData.top_dream_2}
              onChange={handleChange}
              placeholder="Top Dream 2"
              className="border rounded p-2"
            />
            <input
              type="text"
              name="top_dream_3"
              value={formData.top_dream_3}
              onChange={handleChange}
              placeholder="Top Dream 3"
              className="border rounded p-2"
            />
          </div>

          <textarea
            name="dream_description"
            value={formData.dream_description}
            onChange={handleChange}
            placeholder="Dream Description"
            className="border rounded p-2 w-full mt-3"
          />
          <textarea
            name="initial_plan"
            value={formData.initial_plan}
            onChange={handleChange}
            placeholder="Initial Plan"
            className="border rounded p-2 w-full mt-3"
          />
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
