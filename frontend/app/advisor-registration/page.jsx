"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function BecomeAdvisorForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gender: "Male",
    education: "",
    experience_years: "",
    adhar_number: "",
    phone_number: "",
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", age: null });

  // Load token and user info on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);

    if (accessToken) {
      axios
        .get("http://localhost:8000/api/v1/user/user-dashboard/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          setUserInfo({
            name: res.data.first_name || res.data.username,
            age: res.data.age,
          });
        })
        .catch(() => setMessage("Failed to load user info."));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = new FormData();
      // Add user info
      payload.append("name", userInfo.name);
      payload.append("age", userInfo.age);

      // Add form fields
      payload.append("gender", formData.gender);
      payload.append("education", formData.education);
      payload.append("experience_years", formData.experience_years);
      payload.append("adhar_number", formData.adhar_number);
      payload.append("phone_number", formData.phone_number);

      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      await axios.post(
        "http://localhost:8000/api/v1/user/become-advisor/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Advisor request submitted successfully!");
      router.push("/user-dashboard")
      setFormData({
        gender: "Male",
        education: "",
        experience_years: "",
        adhar_number: "",
        phone_number: "",
        photo: null,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.age?.[0] ||
        "Failed to submit advisor request.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-2xl font-semibold mb-4">Become an Advisor</h2>
      {message && (
        <div className="mb-4 text-green-600 text-center">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <p>
          <strong>Name:</strong> {userInfo.name}
        </p>
        <p>
          <strong>Age:</strong> {userInfo.age}
        </p>

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          type="text"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Education"
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="number"
          name="experience_years"
          value={formData.experience_years}
          onChange={handleChange}
          placeholder="Experience (years)"
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="text"
          name="adhar_number"
          value={formData.adhar_number}
          onChange={handleChange}
          placeholder="Aadhar Number"
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

export default BecomeAdvisorForm;
