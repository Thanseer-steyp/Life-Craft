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

    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-4xl mx-auto p-6 md:p-10 bg-white rounded-xl shadow-2xl text-gray-800">

        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Join Our Network of Experts</h2>

        {message && <div className={`mb-4 text-center p-3 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message}</div>}



        {/* PROGRESS BAR */}

        <div className="mb-8">

          <div className="h-2 bg-gray-200 rounded-full">

            <div

              className="h-2 bg-blue-600 rounded-full transition-all duration-500"

              style={{ width: `${(currentStep / totalSteps) * 100}%` }}

            ></div>

          </div>

          <p className="text-sm text-center mt-2 text-gray-600 font-medium">

            Step {currentStep} of {totalSteps}: {stepTitles[currentStep]}

          </p>

        </div>



        <form onSubmit={handleSubmit} className="space-y-6">



          {/* STEP 1: Personal & Contact Details */}

          {currentStep === 1 && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <h3 className="md:col-span-2 text-xl font-semibold border-b pb-2 text-blue-700">1. Tell Us About Yourself</h3>

              

              <FileInput name="profile_photo" label="Profile Photo" accept="image/*" />



              <label className="block">Full Name 

                <input type="text" name="full_name" value={formData.full_name} readOnly className="w-full border rounded px-3 py-2 bg-gray-100 mt-1" />

              </label>



              <label className="block">Email 

                <input type="email" name="email" value={formData.email} readOnly className="w-full border rounded px-3 py-2 bg-gray-100 mt-1" />

              </label>



              <label className="block">Age <span className="text-red-500">*</span>

                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="20-65" min="20" max="65" className="w-full border rounded px-3 py-2 mt-1" required />

              </label>



              <label className="block">Gender 

                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required>

                  <option value="Male">Male</option>

                  <option value="Female">Female</option>

                  <option value="Other">Other</option>

                </select>

              </label>



              <label className="block">Phone Number <span className="text-red-500">*</span>

                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="123-456-7890" className="w-full border rounded px-3 py-2 mt-1" required />

              </label>



              <label className="block">Country Address <span className="text-red-500">*</span>

                <input type="text" name="country_address" value={formData.country_address} onChange={handleChange} placeholder="Your current country" className="w-full border rounded px-3 py-2 mt-1" required />

              </label>



              <label className="block">State Address <span className="text-red-500">*</span>

                <input type="text" name="state_address" value={formData.state_address} onChange={handleChange} placeholder="Your current state/province" className="w-full border rounded px-3 py-2 mt-1" required />

              </label>



              <label className="block md:col-span-2">Language Preferences

                <input type="text" name="language_preferences" value={formData.language_preferences} onChange={handleChange} placeholder="Languages you advise in (e.g. English, Hindi, Spanish)" className="w-full border rounded px-3 py-2 mt-1" />

              </label>



              <div className="md:col-span-2 flex justify-end">

                <button type="button" onClick={nextStep} className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105">

                  Next: Experience Details &rarr;

                </button>

              </div>

            </div>

          )}



          {/* STEP 2: Professional Experience */}

          {currentStep === 2 && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <h3 className="md:col-span-2 text-xl font-semibold border-b pb-2 text-blue-700">2. Professional Background</h3>



              <label className="block">Advisor Type 

                <select name="advisor_type" value={formData.advisor_type} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1">

                  <option value="financial">Financial Advisor</option>

                  <option value="lifestyle">Lifestyle Advisor</option>

                  <option value="legal">Legal Advisor</option>

                  <option value="healthcare">Healthcare Advisor</option>

                  <option value="travel">Travel Advisor</option>

                  <option value="automobile">Automobile Advisor</option>

                  <option value="architectural">Architectural Advisor</option>

                </select>

              </label>



              <label className="block">Years of Experience <span className="text-red-500">*</span>

                <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} placeholder="e.g., 5" className="w-full border rounded px-3 py-2 mt-1" required />

              </label>



              <label className="block">Current Company

                <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Your current employer" className="w-full border rounded px-3 py-2 mt-1" />

              </label>



              <label className="block">Current Designation

                <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Your title/role" className="w-full border rounded px-3 py-2 mt-1" />

              </label>

              

              <label className="block">Highest Qualification 

                <select name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1">

                  <option value="diploma">Diploma</option>

                  <option value="bachelor">Bachelor</option>

                  <option value="master">Master</option>

                  <option value="phd">PhD</option>

                  <option value="degree">Other Degree</option>

                </select>

              </label>



              <label className="block">Specialized In

                <input 

                  type="text" 

                  name="specialized_in" 

                  value={formData.specialized_in} 

                  onChange={handleChange} 

                  placeholder={getSpecializationPlaceholder(formData.advisor_type)} // Dynamic placeholder

                  className="w-full border rounded px-3 py-2 mt-1" 

                />

              </label>



              <label className="block md:col-span-2">Previous Companies & Roles

                <textarea name="previous_companies" value={formData.previous_companies} onChange={handleChange} placeholder="List previous companies, roles, and dates (optional)" className="w-full border rounded px-3 py-2 mt-1 min-h-24" />

              </label>



              <div className="md:col-span-2 flex justify-between pt-4">

                <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition">

                  &larr; Previous

                </button>

                <button type="button" onClick={nextStep} className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105">

                  Next: Documents &rarr;

                </button>

              </div>

            </div>

          )}



          {/* STEP 3: Documentation & Confirmation */}

          {currentStep === 3 && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <h3 className="md:col-span-2 text-xl font-semibold border-b pb-2 text-blue-700">3. Verification & Submit</h3>



              <FileInput name="educational_certificate" label="Educational Certificate (Highest Qualification)" accept=".pdf,image/*" />

              <FileInput name="resume" label="Resume/CV" accept=".pdf,.doc,.docx" />

              

              {/* Government ID Section */}

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border p-4 rounded-lg bg-blue-50">

                <label className="block">Government ID Type

                  <select name="govt_id_type" value={formData.govt_id_type} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1">

                    <option value="passport">Passport</option>

                    <option value="aadhar">Aadhar</option>

                    <option value="license">License</option>

                  </select>

                </label>

                

                <label className="block sm:col-span-2">Government ID Number <span className="text-red-500">*</span>

                  <input type="text" name="govt_id_proof_id" value={formData.govt_id_proof_id} onChange={handleChange} placeholder="Enter official ID Number" className="w-full border rounded px-3 py-2 mt-1" required />

                </label>



                <div className="sm:col-span-3">

                    <FileInput name="govt_id_file" label="Upload Government ID File" accept=".pdf,image/*" required />

                </div>

              </div>



              {/* Confirmation */}

              <label className="md:col-span-2 flex items-center space-x-3 mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">

                <input type="checkbox" name="confirm_details" checked={formData.confirm_details} onChange={handleChange} required className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />

                <span className="text-sm font-medium text-gray-900">

                  <span className="text-red-500">*</span> I confirm all details provided are valid and correct, and I agree to the terms of becoming an advisor.

                </span>

              </label>



              {/* Submit Button */}

              <div className="md:col-span-2 flex justify-between pt-4">

                <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition">

                  &larr; Previous

                </button>

                <button 

                  type="submit" 

                  disabled={loading || !formData.confirm_details} 

                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed"

                >

                  {loading ? "Submitting..." : "Submit Advisor Request"}

                </button>

              </div>

            </div>

          )}

        </form>

      </div>

    </div>

  );

}



export default BecomeAdvisorForm; 