"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function BugReportForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    screenshot: null,
  });
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", username: "" });

  // ✅ Load user info from token
  useEffect(() => {
    const access = localStorage.getItem("access");
    setToken(access);

    if (access) {
      axios
        .get("http://localhost:8000/api/v1/user/user-dashboard/", {
          headers: { Authorization: `Bearer ${access}` },
        })
        .then((res) => {
          setUserInfo({
            name: res.data.name || "",
            email: res.data.email || "",
            username: res.data.username || "",
          });
        })
        .catch((err) => console.error("User info fetch error:", err));
    }
  }, []);

  // ✅ Input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("⚠️ You must be logged in to submit a bug report.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    try {
      await axios.post("http://localhost:8000/api/v1/user/bugs/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✅ Bug report submitted successfully!");
      setForm({ title: "", description: "", priority: "medium", screenshot: null });
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit bug report!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-8 text-black">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          🪲 Bug Report Form
        </h1>

        {/* 🧑 User info */}
        {userInfo.username && (
          <div className="mb-6 text-center text-black">
            <p>
              Reporting as:{" "}
              <strong className="text-black">
                {userInfo.name || userInfo.username}
              </strong>
            </p>
            <p className="text-sm text-black">{userInfo.email}</p>
          </div>
        )}

        {/* 📋 Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 text-black"
        >
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-black">Bug Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Enter bug title"
              value={form.title}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col">
          <label className="mb-1 font-medium text-black">Priority *</label>
          <div className="relative">
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full appearance-none border border-gray-300 rounded-md p-2 pr-10 bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400 transition-all duration-200"
            >
              <option value="low" className="text-black">Low</option>
              <option value="medium" className="text-black">Medium</option>
              <option value="high" className="text-black">High</option>
            </select>

            {/* ▼ Custom Dropdown Arrow */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              ▼
            </span>
          </div>
          </div>


          <div className="flex flex-col col-span-2">
            <label className="mb-1 font-medium text-black">
              Description *
            </label>
            <textarea
              name="description"
              placeholder="Describe the issue..."
              value={form.description}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md p-3 h-28 focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>

          {/* 📸 Screenshot Upload */}
          <div className="flex flex-col col-span-2">
            <label className="mb-2 font-medium text-black">Screenshot (optional)</label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-all duration-200">
              {form.screenshot ? (
                <div className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(form.screenshot)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md mb-3 border border-gray-200"
                  />
                  <p className="text-sm text-black">{form.screenshot.name}</p>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, screenshot: null })}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="screenshot"
                    className="cursor-pointer flex flex-col items-center text-black"
                  >
                    <div className="bg-green-100 text-green-600 w-12 h-12 flex items-center justify-center rounded-full mb-2">
                      📷
                    </div>
                    <span className="text-sm">Click or drag file to upload</span>
                  </label>
                  <input
                    id="screenshot"
                    type="file"
                    name="screenshot"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>


          <div className="flex justify-between col-span-2 mt-4">
            <button
              type="reset"
              onClick={() =>
                setForm({
                  title: "",
                  description: "",
                  priority: "medium",
                  screenshot: null,
                })
              }
              className="px-6 py-2 bg-gray-200 text-black font-medium rounded-md hover:bg-gray-300"
            >
              CLEAR
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
            >
              SUBMIT BUG
            </button>
          </div>
        </form>

        {message && (
          <p className="text-center mt-6 text-black font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
