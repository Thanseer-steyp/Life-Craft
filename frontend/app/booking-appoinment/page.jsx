"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdvisorsPage() {
  const [advisors, setAdvisors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/advisor/advisors-list/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => setAdvisors(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleBook = async (advisorId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/user/book-appointment/",
        { advisor_id: advisorId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      alert("Appointment request sent!");
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Available Advisors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advisors.map((advisor) => (
          <div key={advisor.id} className="border p-4 rounded-xl shadow">
            <h2 className="font-semibold">{advisor.username}</h2>
            <p>{advisor.email}</p>
            <button
              onClick={() => setSelected(advisor)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg"
            >
              Consult
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="font-bold text-lg mb-2">
              Book Appointment with {selected.username}
            </h2>
            <p>Are you sure you want to request a consultation?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBook(selected.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
