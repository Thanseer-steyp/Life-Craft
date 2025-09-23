"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function DreamSetupForm() {
  const router = useRouter();
  const [dream, setDream] = useState({
    dream_name: "",
    budget: "",
    timeline_months: "",
    current_savings: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDream((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in to submit a dream.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("dream_name", dream.dream_name);
      formData.append("budget", dream.budget);
      formData.append("timeline_months", dream.timeline_months);
      formData.append("current_savings", dream.current_savings);
      formData.append("description", dream.description);

      await axios.post(
        "http://localhost:8000/api/v1/user/dream-setup/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Dream submitted successfully!");
      setDream({
        dream_name: "",
        budget: "",
        timeline_months: "",
        current_savings: "",
        description: "",
      });

      // Optional: redirect to a dashboard page
      router.push("/user-dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Error submitting dream.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-2xl font-semibold mb-4">Dream Setup</h2>
      {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="dream_name"
          value={dream.dream_name}
          onChange={handleChange}
          placeholder="Dream Name"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          name="budget"
          value={dream.budget}
          onChange={handleChange}
          placeholder="Budget"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          name="timeline_months"
          value={dream.timeline_months}
          onChange={handleChange}
          placeholder="Timeline (in months)"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          name="current_savings"
          value={dream.current_savings}
          onChange={handleChange}
          placeholder="Current Savings"
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          name="description"
          value={dream.description}
          onChange={handleChange}
          placeholder="Dream Description"
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Save Dream"}
        </button>
      </form>
    </div>
  );
}

export default DreamSetupForm;
