"use client"
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfileForm() {
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
    const accessToken = localStorage.getItem("access"); // key used when storing token
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
    } catch (err) {
      console.error(err);
      setMessage("Error submitting profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-black">Profile Setup</h2>
      {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <input
          type="number"
          name="age"
          value={profile.age}
          onChange={handleChange}
          placeholder="Age"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          name="retirement_age"
          value={profile.retirement_age}
          onChange={handleChange}
          placeholder="Retirement Age"
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="interests"
          value={profile.interests}
          onChange={handleChange}
          placeholder="Interests"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="file"
          name="profile_image"
          accept="image/*"
          onChange={handleChange}
        />
        {preview && <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-full mt-2" />}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
