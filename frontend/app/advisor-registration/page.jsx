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
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const totalSteps = 3;
  const stepTitles = {
    1: "Personal & Contact Details",
    2: "Professional Experience",
    3: "Verification & Submit",
  };

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
            full_name: res.data.name,
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

      // Track uploaded files
      if (files[0]) {
        setUploadedFiles((prev) => ({
          ...prev,
          [name]: {
            name: files[0].name,
            size: files[0].size,
            type: files[0].type,
          },
        }));
      } else {
        setUploadedFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[name];
          return newFiles;
        });
      }

      // Handle profile photo preview
      if (name === "profile_photo" && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfilePhotoPreview(e.target.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === "age" && value.length > 2) return; // restrict to 2 digits
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSpecializationPlaceholder = (advisorType) => {
    const placeholders = {
      financial: "e.g., Investment Planning, Tax Advisory, Retirement Planning",
      lifestyle: "e.g., Wellness Coaching, Life Balance, Personal Development",
      legal: "e.g., Corporate Law, Family Law, Real Estate Law",
      healthcare: "e.g., General Medicine, Mental Health, Nutrition",
      travel: "e.g., Adventure Travel, Luxury Travel, Business Travel",
      automobile: "e.g., Car Maintenance, Vehicle Selection, Auto Insurance",
      architectural:
        "e.g., Residential Design, Commercial Architecture, Interior Design",
    };
    return placeholders[advisorType] || "Your area of expertise";
  };

  const FileInput = ({ name, label, accept, required = false }) => {
    const fileInfo = uploadedFiles[name];

    return (
      <div className="block">
        <span className="text-white font-medium">
          {label} {required && <span className="text-red-400">*</span>}
          {required && !fileInfo && (
            <span className="text-red-400 text-sm ml-2">(Required)</span>
          )}
        </span>

        {/* File Upload Status */}
        {fileInfo && (
          <div className="mt-2 mb-3 p-3 bg-green-900 border border-green-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-300 text-sm font-medium">
                  ✓ File uploaded successfully
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, [name]: null }));
                  setUploadedFiles((prev) => {
                    const newFiles = { ...prev };
                    delete newFiles[name];
                    return newFiles;
                  });
                  const fileInput = document.querySelector(
                    `input[name="${name}"]`
                  );
                  if (fileInput) fileInput.value = "";
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
            <p className="text-green-200 text-xs mt-1">
              {fileInfo.name} ({(fileInfo.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        {/* File Input */}
        <input
          type="file"
          name={name}
          accept={accept}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 mt-1 bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${
            required && !fileInfo ? "border-red-500" : "border-gray-600"
          }`}
        />
      </div>
    );
  };

  const ProfilePhotoInput = ({ name, label, accept, required = false }) => (
    <div className="block">
      <span className="text-white font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </span>

      {/* Profile Photo Preview */}
      {profilePhotoPreview && (
        <div className="mt-3 mb-4">
          <div className="relative inline-block">
            <img
              src={profilePhotoPreview}
              alt="Profile Preview"
              className="w-32 h-32 object-cover rounded-full border-4 border-gray-600 shadow-lg"
            />
            <button
              type="button"
              onClick={() => {
                setProfilePhotoPreview(null);
                setFormData((prev) => ({ ...prev, [name]: null }));
                setUploadedFiles((prev) => {
                  const newFiles = { ...prev };
                  delete newFiles[name];
                  return newFiles;
                });
                // Reset the file input
                const fileInput = document.querySelector(
                  `input[name="${name}"]`
                );
                if (fileInput) fileInput.value = "";
              }}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">Click the × to remove</p>
        </div>
      )}

      {/* File Input */}
      <input
        type="file"
        name={name}
        accept={accept}
        onChange={handleChange}
        className="w-full border border-gray-600 rounded px-3 py-2 mt-1 bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        required={required}
      />
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "age",
      "phone_number",
      "country_address",
      "state_address",
      "experience_years",
      "govt_id_proof_id",
      "govt_id_file",
    ];

    const missingFields = requiredFields.filter((field) => {
      if (field === "govt_id_file") {
        return !formData[field] || !uploadedFiles[field];
      }
      return !formData[field] || formData[field] === "";
    });

    if (missingFields.length > 0) {
      setMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    if (!formData.confirm_details) {
      setMessage("Please confirm that all details are correct.");
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

      // Debug: Log form data and uploaded files
      console.log("Form Data:", formData);
      console.log("Uploaded Files:", uploadedFiles);
      console.log("Government ID File:", formData.govt_id_file);
      console.log(
        "Government ID in uploadedFiles:",
        uploadedFiles.govt_id_file
      );

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto p-6 md:p-10 bg-gray-900 rounded-xl shadow-2xl text-white border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Join As our Advisor
        </h2>
               {" "}
        {message && (
          <div
            className={`mb-4 text-center p-3 rounded-lg ${
              message.includes("success")
                ? "bg-green-900 text-green-300 border border-green-700"
                : "bg-red-900 text-red-300 border border-red-700"
            }`}
          >
            {message}
          </div>
        )}
                {/* PROGRESS BAR */}       {" "}
        <div className="mb-8">
                   {" "}
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                       {" "}
            <div
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
                     {" "}
          </div>
                   {" "}
          <p className="text-sm text-center mt-3 text-gray-300 font-medium">
                        Step {currentStep} of {totalSteps}:{" "}
            {stepTitles[currentStep]}         {" "}
          </p>
                 {" "}
        </div>
               {" "}
        <form onSubmit={handleSubmit} className="space-y-6">
                    {/* STEP 1: Personal & Contact Details */}         {" "}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {" "}
              <h3 className="md:col-span-2 text-xl font-semibold border-b border-gray-600 pb-2 text-blue-400">
                1. Tell Us About Yourself
              </h3>
              <ProfilePhotoInput
                name="profile_photo"
                label="Profile Photo"
                accept="image/*"
              />
                           {" "}
              <label className="block">
                Full Name                 {" "}
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  readOnly
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1"
                />
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Email                 {" "}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1"
                />
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Age <span className="text-red-500">*</span>               {" "}
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="20-65"
                  min="20"
                  max="65"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Gender                 {" "}
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                                    <option value="Male">Male</option>         
                          <option value="Female">Female</option>               
                    <option value="Other">Other</option>               {" "}
                </select>
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Phone Number <span className="text-red-500">*</span>           
                   {" "}
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="123-456-7890"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Country Address <span className="text-red-500">*</span>         
                     {" "}
                <input
                  type="text"
                  name="country_address"
                  value={formData.country_address}
                  onChange={handleChange}
                  placeholder="Your current country"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                             {" "}
              </label>
                           {" "}
              <label className="block">
                State Address <span className="text-red-500">*</span>           
                   {" "}
                <input
                  type="text"
                  name="state_address"
                  value={formData.state_address}
                  onChange={handleChange}
                  placeholder="Your current state/province"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                             {" "}
              </label>
                           {" "}
              <label className="block md:col-span-2">
                Language Preferences                {" "}
                <input
                  type="text"
                  name="language_preferences"
                  value={formData.language_preferences}
                  onChange={handleChange}
                  placeholder="Languages you advise in (e.g. English, Hindi, Spanish)"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                             {" "}
              </label>
                           {" "}
              <div className="md:col-span-2 flex justify-end">
                               {" "}
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition transform hover:scale-105"
                >
                                    Next: Experience Details &rarr;            
                     {" "}
                </button>
                             {" "}
              </div>
                         {" "}
            </div>
          )}
                    {/* STEP 2: Professional Experience */}         {" "}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {" "}
              <h3 className="md:col-span-2 text-xl font-semibold border-b border-gray-600 pb-2 text-blue-400">
                2. Professional Background
              </h3>
                           {" "}
              <label className="block">
                Advisor Type                 {" "}
                <select
                  name="advisor_type"
                  value={formData.advisor_type}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                                   {" "}
                  <option value="financial">Financial Advisor</option>         
                          <option value="lifestyle">Lifestyle Advisor</option> 
                                  <option value="legal">Legal Advisor</option> 
                                 {" "}
                  <option value="healthcare">Healthcare Advisor</option>       
                            <option value="travel">Travel Advisor</option>     
                             {" "}
                  <option value="automobile">Automobile Advisor</option>       
                           {" "}
                  <option value="architectural">Architectural Advisor</option> 
                               {" "}
                </select>
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Years of Experience <span className="text-red-500">*</span>     
                         {" "}
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Current Company                {" "}
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your current employer"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Current Designation                {" "}
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Your title/role"
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                             {" "}
              </label>
                                          {" "}
              <label className="block">
                Highest Qualification                 {" "}
                <select
                  name="highest_qualification"
                  value={formData.highest_qualification}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                                    <option value="diploma">Diploma</option>   
                                <option value="bachelor">Bachelor</option>     
                              <option value="master">Master</option>           
                        <option value="phd">PhD</option>                 {" "}
                  <option value="degree">Other Degree</option>               {" "}
                </select>
                             {" "}
              </label>
                           {" "}
              <label className="block">
                Specialized In                {" "}
                <input
                  type="text"
                  name="specialized_in"
                  value={formData.specialized_in}
                  onChange={handleChange}
                  placeholder={getSpecializationPlaceholder(
                    formData.advisor_type
                  )} // Dynamic placeholder
                  className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                             {" "}
              </label>
                           {" "}
              <label className="block md:col-span-2">
                Previous Companies & Roles                {" "}
                <textarea
                  name="previous_companies"
                  value={formData.previous_companies}
                  onChange={handleChange}
                  placeholder="List previous companies, roles, and dates (optional)"
                  className="w-full border border-gray-600 rounded px-3 py-2 mt-1 min-h-24 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                             {" "}
              </label>
                           {" "}
              <div className="md:col-span-2 flex justify-between pt-4">
                               {" "}
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-500"
                >
                                    &larr; Previous                {" "}
                </button>
                               {" "}
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition transform hover:scale-105"
                >
                                    Next: Documents &rarr;                {" "}
                </button>
                             {" "}
              </div>
                         {" "}
            </div>
          )}
                    {/* STEP 3: Documentation & Confirmation */}         {" "}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {" "}
              <h3 className="md:col-span-2 text-xl font-semibold border-b border-gray-600 pb-2 text-blue-400">
                3. Verification & Submit
              </h3>
                           {" "}
              <FileInput
                name="educational_certificate"
                label="Educational Certificate (Highest Qualification)"
                accept=".pdf,image/*"
              />
                           {" "}
              <FileInput
                name="resume"
                label="Resume/CV"
                accept=".pdf,image/*"
              />
                                           {/* Government ID Section */}       
                   {" "}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border border-gray-600 p-4 rounded-lg bg-gray-800">
                               {" "}
                <label className="block">
                  Government ID Type                  {" "}
                  <select
                    name="govt_id_type"
                    value={formData.govt_id_type}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                                       {" "}
                    <option value="passport">Passport</option>                 
                      <option value="aadhar">Aadhar</option>                   {" "}
                    <option value="license">License</option>                 {" "}
                  </select>
                                 {" "}
                </label>
                                                {" "}
                <label className="block sm:col-span-2">
                  Government ID Number <span className="text-red-500">*</span> 
                                 {" "}
                  <input
                    type="text"
                    name="govt_id_proof_id"
                    value={formData.govt_id_proof_id}
                    onChange={handleChange}
                    placeholder="Enter official ID Number"
                    className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-white mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                                 {" "}
                </label>
                               {" "}
                <div className="sm:col-span-3">
                                     {" "}
                  <FileInput
                    name="govt_id_file"
                    label="Upload Government ID File"
                    accept=".pdf,image/*"
                    required
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                            {/* Confirmation */}             {" "}
              <label className="md:col-span-2 flex items-center space-x-3 mt-4 p-3 bg-yellow-900 rounded-lg border border-yellow-700">
                               {" "}
                <input
                  type="checkbox"
                  name="confirm_details"
                  checked={formData.confirm_details}
                  onChange={handleChange}
                  required
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                               {" "}
                <span className="text-sm font-medium text-white">
                                    <span className="text-red-500">*</span> I
                  confirm all details provided are valid and correct, and I
                  agree to the terms of becoming an advisor.                {" "}
                </span>
                             {" "}
              </label>
                            {/* Submit Button */}             {" "}
              <div className="md:col-span-2 flex justify-between pt-4">
                               {" "}
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-500"
                >
                                    &larr; Previous                {" "}
                </button>
                               {" "}
                <button
                  type="submit"
                  disabled={loading || !formData.confirm_details}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-xl hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                                   {" "}
                  {loading ? "Submitting..." : "Submit Advisor Request"}       
                         {" "}
                </button>
                             {" "}
              </div>
                         {" "}
            </div>
          )}
                 {" "}
        </form>
             {" "}
      </div>
         {" "}
    </div>
  );
}

export default BecomeAdvisorForm;
