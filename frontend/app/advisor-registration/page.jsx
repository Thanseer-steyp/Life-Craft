"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function BecomeAdvisorForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    profile_photo: null,
    full_name: "",
    age: "",
    gender: "Male",
    email: "",
    phone_number: "",
    country_address: "",
    state_address: "",
    language_preferences: "",
    advisor_type: "financial",
    experience_years: "",
    company: "",
    designation: "",
    highest_qualification: "bachelor",
    specialized_in: "",
    educational_certificate: null,
    previous_companies: "",
    resume: null,
    govt_id_type: "passport",
    govt_id_proof_id: "",
    govt_id_file: null,
    confirm_details: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);

    if (accessToken) {
      axios
        .get("http://localhost:8000/api/v1/user/user-dashboard/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            full_name: res.data.first_name || res.data.username,
            email: res.data.email,
          }));
        })
        .catch(() => setMessage("Failed to load user info."));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === "age" && value.length > 2) return; // restrict to 2 digits
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
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });

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
      router.push("/");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Failed to submit advisor request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-2xl font-semibold mb-4">Become an Advisor</h2>
      {message && <div className="mb-4 text-red-600 text-center">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Photo */}
        <label className="block">
          Profile Photo
          <input type="file" name="profile_photo" accept="image/*" onChange={handleChange} />
        </label>

        {/* Full Name & Email */}
        <label className="block">
          Full Name
          <input type="text" name="full_name" value={formData.full_name} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
        </label>

        <label className="block">
          Email
          <input type="email" name="email" value={formData.email} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
        </label>

        {/* Age */}
        <label className="block">
          Age
          <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" min="20" max="65" className="w-full border rounded px-3 py-2" required />
        </label>

        {/* Gender */}
        <label className="block">
          Gender
          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>

        {/* Contact */}
        <label className="block">
          Phone Number
          <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" className="w-full border rounded px-3 py-2" required />
        </label>

        <label className="block">
          Country Address
          <input type="text" name="country_address" value={formData.country_address} onChange={handleChange} placeholder="Country Address" className="w-full border rounded px-3 py-2" required />
        </label>

        <label className="block">
          State Address
          <input type="text" name="state_address" value={formData.state_address} onChange={handleChange} placeholder="State Address" className="w-full border rounded px-3 py-2" required />
        </label>

        <label className="block">
          Language Preferences
          <input type="text" name="language_preferences" value={formData.language_preferences} onChange={handleChange} placeholder="Languages (e.g. English, Hindi)" className="w-full border rounded px-3 py-2" />
        </label>

        {/* Advisor Type */}
        <label className="block">
          Advisor Type
          <select name="advisor_type" value={formData.advisor_type} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="financial">Financial Advisor</option>
            <option value="lifestyle">Lifestyle Advisor</option>
            <option value="legal">Legal Advisor</option>
            <option value="healthcare">Healthcare Advisor</option>
            <option value="travel">Travel Advisor</option>
            <option value="automobile">Automobile Advisor</option>
            <option value="architectural">Architectural Advisor</option>
          </select>
        </label>

        {/* Experience */}
        <label className="block">
          Years of Experience
          <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} placeholder="Years of Experience" className="w-full border rounded px-3 py-2" required />
        </label>

        <label className="block">
          Current Company
          <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Current Company" className="w-full border rounded px-3 py-2" />
        </label>

        <label className="block">
          Current Designation
          <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Current Designation" className="w-full border rounded px-3 py-2" />
        </label>

        {/* Qualification */}
        <label className="block">
          Highest Qualification
          <select name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor</option>
            <option value="master">Master</option>
            <option value="phd">PhD</option>
            <option value="degree">Degree</option>
          </select>
        </label>

        <label className="block">
          Specialized In
          <input type="text" name="specialized_in" value={formData.specialized_in} onChange={handleChange} placeholder="Specialized In" className="w-full border rounded px-3 py-2" />
        </label>

        <label className="block">
          Upload Educational Certificate
          <input type="file" name="educational_certificate" onChange={handleChange} />
        </label>

        {/* Work History */}
        <label className="block">
          Previous Companies & Roles
          <textarea name="previous_companies" value={formData.previous_companies} onChange={handleChange} placeholder="Previously Worked Companies & Roles" className="w-full border rounded px-3 py-2" />
        </label>

        <label className="block">
          Upload Resume
          <input type="file" name="resume" onChange={handleChange} />
        </label>

        {/* Government ID */}
        <label className="block">
          Government ID Type
          <select name="govt_id_type" value={formData.govt_id_type} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="passport">Passport</option>
            <option value="aadhar">Aadhar</option>
            <option value="license">License</option>
          </select>
        </label>

        <label className="block">
          Government ID Number
          <input type="text" name="govt_id_proof_id" value={formData.govt_id_proof_id} onChange={handleChange} placeholder="Enter ID Number" className="w-full border rounded px-3 py-2" required />
        </label>

        <label className="block">
          Upload Government ID File
          <input type="file" name="govt_id_file" onChange={handleChange} />
        </label>

        {/* Confirmation */}
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="confirm_details" checked={formData.confirm_details} onChange={handleChange} required />
          <span>I confirm all details provided are valid and correct.</span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

export default BecomeAdvisorForm;
