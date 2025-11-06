"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import axiosInstance from "@/components/config/axiosInstance";

function BecomeAdvisorForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    profile_photo: null,
    full_name: "",
    dob_year: "",
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
  const totalSteps = 4;
  const stepTitles = {
    1: "Personal Details",
    2: "Professional Details",
    3: "Documents Verification",
    4: "Preview & Confirmation",
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);

    if (accessToken) {
      axiosInstance
        .get("api/v1/user/user-dashboard/")
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
      // FILE UPLOAD HANDLING
      if (files && files[0]) {
        const file = files[0];

        // ✅ PROFILE PHOTO VALIDATION + PREVIEW
        if (name === "profile_photo") {
          const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
          if (!allowedTypes.includes(file.type)) {
            setMessage(
              "File is not acceptable. Only PNG, JPG, and JPEG are allowed."
            );
            // Reset invalid file input
            e.target.value = "";
            setFormData((prev) => ({ ...prev, [name]: null }));
            setUploadedFiles((prev) => {
              const newFiles = { ...prev };
              delete newFiles[name];
              return newFiles;
            });
            setProfilePhotoPreview(null);
            return;
          }

          // ✅ Generate preview for profile photo
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePhotoPreview(reader.result);
          };
          reader.readAsDataURL(file);
        }

        // ✅ Update formData and uploadedFiles state
        setFormData((prev) => ({ ...prev, [name]: file }));
        setUploadedFiles((prev) => ({
          ...prev,
          [name]: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
        }));
      } else {
        // If no file selected (user removed file)
        setFormData((prev) => ({ ...prev, [name]: null }));
        setUploadedFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[name];
          return newFiles;
        });

        if (name === "profile_photo") setProfilePhotoPreview(null);
      }
    } else if (type === "checkbox") {
      // ✅ Checkbox toggle (for confirm_details)
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // ✅ Normal text/number/select fields
      if (name === "dob_year" && value.length > 4) return; // restrict age input
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const initialFormData = {
    profile_photo: null,
    dob_year: "",
    gender: "Male",
    full_name: "",
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
  };

  const handleClear = () => {
    setFormData((prev) => ({
      ...initialFormData,
      full_name: prev.full_name,
      email: prev.email,
    }));
    setUploadedFiles({});
    setProfilePhotoPreview(null);

    document.querySelectorAll('input[type="file"]').forEach((input) => {
      input.value = "";
    });
  };

  const requiredFieldsByStep = {
    1: [
      "profile_photo",
      "dob_year",
      "gender",
      "language_preferences",
      "phone_number",
      "country_address",
      "state_address",
    ],
    2: ["advisor_type", "experience_years", "highest_qualification"],
    3: [
      "govt_id_type",
      "govt_id_proof_id",
      "govt_id_file",
      "educational_certificate",
    ],
    4: ["confirm_details"], // step 4 requires confirmation checkbox
  };

  const nextStep = () => {
    const requiredFields = requiredFieldsByStep[currentStep] || [];

    const missingFields = requiredFields.filter((field) => {
      if (field === "profile_photo" || field === "govt_id_file") {
        return !formData[field]; // check if file is selected
      }
      if (field === "confirm_details") {
        return !formData[field]; // check if checkbox is checked
      }
      return !formData[field] || formData[field] === ""; // normal fields
    });

    if (missingFields.length > 0) {
      setMessage(
        `Oops! Some required fields are missing. Please fill them in to continue.`
      );
      return; // stop going to next step
    }

    setMessage(""); // clear previous message
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSpecializationPlaceholder = (advisorType) => {
    const placeholders = {
      financial: "Investment Planning, Tax Advisory, Retirement Planning",
      lifestyle: "Wellness Coaching, Life Balance, Personal Development",
      legal: "Corporate Law, Family Law, Real Estate Law",
      healthcare: "General Medicine, Mental Health, Nutrition",
      travel: "Adventure Travel, Luxury Travel, Business Travel",
      automobile: "Car Maintenance, Vehicle Selection, Auto Insurance",
      architectural:
        "Residential Design, Commercial Architecture, Interior Design",
    };
    return placeholders[advisorType] || "Your area of expertise";
  };

  const FileInput = ({ name, label, accept, required = false }) => {
    const fileInfo = uploadedFiles[name];

    return (
      <div className="block">
        <label className="text-gray-700 text-sm font-medium mb-2 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {fileInfo ? (
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-300 rounded">
            <span className="text-sm text-gray-600 truncate">
              {fileInfo.name}
            </span>
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
              className="text-red-600 hover:text-red-700 text-sm ml-2 whitespace-nowrap"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              name={name}
              accept={accept}
              onChange={handleChange}
              className="hidden"
              id={name}
            />
            <label
              htmlFor={name}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded bg-white text-gray-700 text-sm cursor-pointer hover:bg-gray-50"
            >
              Choose File
            </label>
          </div>
        )}
      </div>
    );
  };

  const ProfilePhotoInput = ({ name, label, required = false }) => {
    const fileInfo = uploadedFiles[name];

    return (
      <div className="block">
        <label className="text-gray-700 text-sm font-medium mb-2 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {fileInfo ? (
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-300 rounded">
            <span className="text-sm text-gray-600 truncate">
              {fileInfo.name}
            </span>
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
                setProfilePhotoPreview(null);
              }}
              className="text-red-600 hover:text-red-700 text-sm ml-2 whitespace-nowrap"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              name={name}
              accept=".png, .jpg, .jpeg"
              onChange={handleChange}
              className="hidden"
              id={name}
              required={required}
            />
            <label
              htmlFor={name}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded bg-white text-gray-700 text-sm cursor-pointer hover:bg-gray-50 transition"
            >
              Select Profile Photo
            </label>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }

    const requiredFields = [
      "profile_photo",
      "dob_year",
      "gender",
      "language_preferences",
      "phone_number",
      "country_address",
      "state_address",
      "advisor_type",
      "experience_years",
      "highest_qualification",
      "govt_id_type",
      "govt_id_proof_id",
      "govt_id_file",
      "educational_certificate",
      "confirm_details",
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

      // Debug: Log the payload to see what's being sent
      console.log("Form data being sent:", formData);
      console.log("Uploaded files:", uploadedFiles);

      const response = await axios.post(
        "http://localhost:8000/api/v1/user/become-advisor/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Your advisor request has been submitted successfully.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#16a34a", // nice green color
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/"); // redirect after clicking OK
        }
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message;

      Swal.fire({
        title: "Error!",
        text: `Failed to submit advisor request: ${errorMessage}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626", // red
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl mx-auto p-8 md:p-12 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Advisor Registration
        </h2>

        {message && (
          <div
            className={`mb-6 text-center p-4 rounded-lg ${
              message.includes("success")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* PROGRESS BAR */}
        <div className="mb-10">
          <div className="flex items-center w-full">
            {[1, 2, 3, 4].map((step, idx) => (
              <div
                key={step}
                className={`flex items-center ${idx < 3 ? "flex-1" : ""}`}
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep > step
                      ? "bg-green-500 text-white"
                      : currentStep === step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>

                {/* Step Title */}
                <div className="ml-3 min-w-max">
                  <p
                    className={`text-xs font-medium ${
                      currentStep >= step ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {stepTitles[step]}
                  </p>
                </div>

                {/* Line Between Steps (not after last step) */}
                {idx < 3 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProfilePhotoInput
                  name="profile_photo"
                  label="Profile Photo"
                  required
                />

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Full Name<span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    readOnly
                    className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-700"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Email<span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-700"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    DOB Year<span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="number"
                    name="dob_year"
                    value={formData.dob_year}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Gender<span className="text-red-500 ml-1">*</span>
                  </span>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border appearance-none border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>

                    {/* Custom dropdown arrow */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Phone Number<span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Country<span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="text"
                    name="country_address"
                    value={formData.country_address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    State<span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="text"
                    name="state_address"
                    value={formData.state_address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Language Preferences
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="text"
                    name="language_preferences"
                    value={formData.language_preferences}
                    onChange={handleChange}
                    placeholder="English, Malayalam"
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </label>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                In order to process your registration, we ask you to provide the
                following information. Please note that all fields marked with
                an asterisk (*) are required.
              </p>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 transition"
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition flex items-center"
                >
                  CONTINUE
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

          {/* STEP 2: Agency Details */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Advisor Type<span className="text-red-500 ml-1">*</span>
                  </span>
                  <div className="relative">
                    <select
                      name="advisor_type"
                      value={formData.advisor_type}
                      onChange={handleChange}
                      className="w-full border appearance-none border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    >
                      <option value="financial">Financial Advisor</option>
                      <option value="lifestyle">Lifestyle Advisor</option>
                      <option value="legal">Legal Advisor</option>
                      <option value="healthcare">Healthcare Advisor</option>
                      <option value="travel">Travel Advisor</option>
                      <option value="automobile">Automobile Advisor</option>
                      <option value="architectural">
                        Architectural Advisor
                      </option>
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Years of Experience
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Current Company
                  </span>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Current Designation
                  </span>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Highest Qualification
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <div className="relative">
                    <select
                      name="highest_qualification"
                      value={formData.highest_qualification}
                      onChange={handleChange}
                      className="w-full border appearance-none border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    >
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="master">Master</option>
                      <option value="phd">PhD</option>
                      <option value="degree">Other Degree</option>
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Specialized In
                  </span>
                  <input
                    type="text"
                    name="specialized_in"
                    value={formData.specialized_in}
                    onChange={handleChange}
                    placeholder={getSpecializationPlaceholder(
                      formData.advisor_type
                    )}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                  />
                </label>

                <label className="block md:col-span-3">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Previous Companies & Roles
                  </span>
                  <textarea
                    name="previous_companies"
                    value={formData.previous_companies}
                    onChange={handleChange}
                    placeholder="List previous companies, roles, and dates (optional)"
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    rows="3"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-8">
                In order to process your registration, we ask you to provide the
                following information. Please note that all fields marked with
                an asterisk (*) are required.
              </p>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold flex items-center rounded hover:bg-gray-400 transition"
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
                  </svg>
                  BACK
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition flex items-center"
                >
                  CONTINUE
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

          {/* STEP 3: Contact Person Details */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Documents Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput
                  name="educational_certificate"
                  label="Educational Certificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />

                <FileInput
                  name="resume"
                  label="Resume/CV"
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Government ID Type
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <div className="relative">
                    <select
                      name="govt_id_type"
                      value={formData.govt_id_type}
                      onChange={handleChange}
                      className="w-full border appearance-none border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                      required
                    >
                      <option value="passport">Passport</option>
                      <option value="aadhar">Aadhar</option>
                      <option value="license">License</option>
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </label>

                <label className="block">
                  <span className="text-gray-700 text-sm font-medium mb-2 block">
                    Government ID Number
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="text"
                    name="govt_id_proof_id"
                    value={formData.govt_id_proof_id}
                    onChange={handleChange}
                    placeholder="Enter your ID number"
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </label>

                <FileInput
                  name="govt_id_file"
                  label="Government ID Document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-8">
                In order to process your registration, we ask you to provide the
                following information. Please note that all fields marked with
                an asterisk (*) are required.
              </p>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-8 py-3 bg-gray-300 text-gray-700 flex items-center font-semibold rounded hover:bg-gray-400 transition"
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
                  </svg>
                  BACK
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition flex items-center"
                >
                  CONTINUE
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

          {/* STEP 4: Work Order Scope */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Preview & Confirmation
              </h3>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Personal Details
                </h4>

                <div className="grid grid-cols-3 text-sm gap-y-4 relative">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-800">
                      {formData.full_name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-800">{formData.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-800">
                      {formData.phone_number}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Year/Age:</span>
                    <span className="ml-2 text-gray-800">
                      {formData.dob_year} (
                      {new Date().getFullYear() - formData.dob_year} years)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Gender:</span>
                    <span className="ml-2 text-gray-800">
                      {formData.gender}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Country:</span>
                    <span className="ml-2 text-gray-800">
                      {formData.country_address}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">State:</span>
                    <span className="ml-2 text-gray-800">
                      {formData.state_address}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">
                      Languages Known:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.language_preferences}
                    </span>
                  </div>
                  {profilePhotoPreview && (
                    <div className="absolute right-0 -top-27.5">
                      <img
                        src={profilePhotoPreview}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-full shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Professional Details
                </h4>
                <div className="grid grid-cols-3 gap-y-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Advisor Type:
                    </span>
                    <span className="ml-2 text-gray-800 capitalize">
                      {formData.advisor_type}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Experience:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.experience_years} years
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Working at:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.company || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Designation:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.designation || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Qualification:
                    </span>
                    <span className="ml-2 text-gray-800 capitalize">
                      {formData.highest_qualification}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Specialization:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.specialized_in || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Previously worked for:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.previous_companies || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Documents Verification
                </h4>
                <div className="grid grid-cols-3 gap-y-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Educational Certificate:
                    </span>
                    <span className="ml-2 text-gray-800 capitalize">
                      {formData.educational_certificate
                        ? "Provided"
                        : "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Resume/CV:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.resume ? "Provided" : "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Government Id:
                    </span>
                    <span className="ml-2 text-gray-800 capitalize">
                      {formData.educational_certificate
                        ? "Provided"
                        : "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Government Id Type:
                    </span>
                    <span className="ml-2 text-gray-800 capitalize">
                      {formData.govt_id_type}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Government Id No:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {formData.govt_id_proof_id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="confirm_details"
                    checked={formData.confirm_details}
                    onChange={handleChange}
                    className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that all the information provided above is
                    accurate and complete. I understand that providing false
                    information may result in the rejection of my advisor
                    application.
                  </span>
                </label>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-8 py-3 bg-gray-300 flex items-center text-gray-700 font-semibold rounded hover:bg-gray-400 transition"
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
                  </svg>
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      SUBMITTING...
                    </>
                  ) : (
                    "SUBMIT APPLICATION"
                  )}
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
