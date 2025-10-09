"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Globe, Briefcase, Award, FileText, Shield, CheckCircle, ArrowRight, ArrowLeft, Upload, X } from "lucide-react";

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
      if (name === "age" && value.length > 2) return;
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
      architectural: "e.g., Residential Design, Commercial Architecture, Interior Design",
    };
    return placeholders[advisorType] || "Your area of expertise";
  };

  const FileInput = ({ name, label, accept, required = false }) => {
    const fileInfo = uploadedFiles[name];

    return (
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-slate-200 font-medium">
          <Upload className="w-4 h-4 text-purple-400" />
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>

        {fileInfo && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 text-sm font-medium">File uploaded successfully</p>
                  <p className="text-green-200/70 text-xs mt-1">
                    {fileInfo.name} ({(fileInfo.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
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
                  const fileInput = document.querySelector(`input[name="${name}"]`);
                  if (fileInput) fileInput.value = "";
                }}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <input
          type="file"
          name={name}
          accept={accept}
          onChange={handleChange}
          className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
        />
      </div>
    );
  };

  const ProfilePhotoInput = ({ name, label, accept, required = false }) => (
    <div className="space-y-3">
      <label className="flex items-center space-x-2 text-slate-200 font-medium">
        <User className="w-4 h-4 text-purple-400" />
        <span>{label}</span>
        {required && <span className="text-red-400">*</span>}
      </label>

      {profilePhotoPreview && (
        <div className="flex justify-center">
          <div className="relative inline-block group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg shadow-purple-500/30">
              <img src={profilePhotoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
            </div>
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
                const fileInput = document.querySelector(`input[name="${name}"]`);
                if (fileInput) fileInput.value = "";
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        name={name}
        accept={accept}
        onChange={handleChange}
        className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
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

    const requiredFields = ["age", "phone_number", "country_address", "state_address", "experience_years", "govt_id_proof_id", "govt_id_file"];
    const missingFields = requiredFields.filter((field) => {
      if (field === "govt_id_file") {
        return !formData[field] || !uploadedFiles[field];
      }
      return !formData[field] || formData[field] === "";
    });

    if (missingFields.length > 0) {
      setMessage(`Please fill in all required fields: ${missingFields.join(", ")}`);
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

      await axios.post("http://localhost:8000/api/v1/user/become-advisor/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Become an Advisor
          </h1>
          <p className="text-slate-300 text-lg">Join our elite network of professionals and make an impact</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 md:p-12">
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${message.includes("success") ? "bg-green-500/20 border-green-400/50 text-green-300" : "bg-red-500/20 border-red-400/50 text-red-300"}`}>
              <div className="flex items-center space-x-2">
                {message.includes("success") ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300 ${currentStep >= step ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50" : "bg-slate-700/50 text-slate-400"}`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${currentStep > step ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-slate-700/50"}`}></div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-slate-300 font-medium">
              Step {currentStep} of {totalSteps}: <span className="text-purple-400">{stepTitles[currentStep]}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <ProfilePhotoInput name="profile_photo" label="Profile Photo" accept="image/*" />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Full Name</span>
                    </label>
                    <input type="text" name="full_name" value={formData.full_name} readOnly className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span>Email</span>
                    </label>
                    <input type="email" name="email" value={formData.email} readOnly className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <span>Age</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="20-65" min="20" max="65" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" required />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <span>Gender</span>
                    </label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" required>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span>Phone Number</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="123-456-7890" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" required />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <Globe className="w-4 h-4 text-purple-400" />
                      <span>Country</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input type="text" name="country_address" value={formData.country_address} onChange={handleChange} placeholder="Your country" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" required />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>State/Province</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input type="text" name="state_address" value={formData.state_address} onChange={handleChange} placeholder="Your state" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" required />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <Globe className="w-4 h-4 text-purple-400" />
                      <span>Languages</span>
                    </label>
                    <input type="text" name="language_preferences" value={formData.language_preferences} onChange={handleChange} placeholder="e.g., English, Hindi, Spanish" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button type="button" onClick={nextStep} className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:scale-105">
                    <span>Continue to Experience</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Professional Background</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span>Advisor Type</span>
                    </label>
                    <select name="advisor_type" value={formData.advisor_type} onChange={handleChange} className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all">
                      <option value="financial">Financial Advisor</option>
                      <option value="lifestyle">Lifestyle Advisor</option>
                      <option value="legal">Legal Advisor</option>
                      <option value="healthcare">Healthcare Advisor</option>
                      <option value="travel">Travel Advisor</option>
                      <option value="automobile">Automobile Advisor</option>
                      <option value="architectural">Architectural Advisor</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <span>Years of Experience</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} placeholder="e.g., 5" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" required />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <span>Current Company</span>
                    </label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Your employer" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <span>Current Designation</span>
                    </label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Your role" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>Highest Qualification</span>
                    </label>
                    <select name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all">
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="master">Master</option>
                      <option value="phd">PhD</option>
                      <option value="degree">Other Degree</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <span>Specialization</span>
                    </label>
                    <input type="text" name="specialized_in" value={formData.specialized_in} onChange={handleChange} placeholder={getSpecializationPlaceholder(formData.advisor_type)} className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center space-x-2 text-slate-200 font-medium">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>Previous Experience</span>
                    </label>
                    <textarea name="previous_companies" value={formData.previous_companies} onChange={handleChange} placeholder="List your previous companies and roles" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm min-h-32 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button type="button" onClick={prevStep} className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-600 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </button>
                  <button type="button" onClick={nextStep} className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:scale-105">
                    <span>Continue to Verification</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Verification & Documents</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileInput name="educational_certificate" label="Educational Certificate" accept=".pdf,image/*" />
                  <FileInput name="resume" label="Resume/CV" accept=".pdf,.doc,.docx" />

                  <div className="md:col-span-2 p-6 bg-slate-800/30 rounded-xl border border-slate-600/50 space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span>Government ID Verification</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-slate-200 font-medium">ID Type</label>
                        <select name="govt_id_type" value={formData.govt_id_type} onChange={handleChange} className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all">
                          <option value="passport">Passport</option>
                          <option value="aadhar">Aadhar</option>
                          <option value="license">License</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-slate-200 font-medium">
                          <span>ID Number</span>
                          <span className="text-red-400">*</span>
                        </label>
                        <input type="text" name="govt_id_proof_id" value={formData.govt_id_proof_id} onChange={handleChange} placeholder="Enter official ID number" className="w-full border border-slate-600/50 rounded-xl px-4 py-3 bg-slate-800/50 text-slate-200 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" required />
                      </div>
                    </div>

                    <div className="pt-2">
                      <FileInput name="govt_id_file" label="Upload Government ID File" accept=".pdf,image/*" required />
                    </div>
                  </div>

                  <div className="md:col-span-2 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="confirm_details"
                        checked={formData.confirm_details}
                        onChange={handleChange}
                        required
                        className="mt-1 h-5 w-5 text-purple-600 border-slate-500 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-slate-200 font-medium">
                        <span className="text-red-400">*</span> I confirm that all details provided are valid and correct, and I agree to the terms of becoming an advisor.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button type="button" onClick={prevStep} className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-600 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.confirm_details}
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default BecomeAdvisorForm;