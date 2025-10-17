"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdvisorsPage() {
  const [advisors, setAdvisors] = useState([]);
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // ✅ Public endpoint — remove auth header
    axios
      .get("http://localhost:8000/api/v1/advisor/advisors-list/")
      .then((res) => {
        setAdvisors(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleBook = async (advisorId) => {
    const token = localStorage.getItem("access");

    // ✅ If not logged in → redirect to login
    if (!token) {
      alert("Please login to book an appointment.");
      router.push("/authentication"); // change to your login page route
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/v1/user/book-appointment/",
        { advisor_id: advisorId },
        {
          headers: { Authorization: `Bearer ${token}` },
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
    <div className="p-6 select-none">
      <h1 className="text-xl font-bold mb-4 text-[#bfa8fe]">
        Available Advisors
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advisors.map((advisor) => (
          <div
            key={advisor.id}
            className="border border-[#bfa8fe]/40 p-4 rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg text-[#4b3b8f]">
              {advisor.full_name}
            </h2>
            <button
              onClick={() => setSelected(advisor)}
              className="mt-3 px-4 py-2 bg-[#bfa8fe] text-white rounded-lg hover:bg-[#a88ffb] transition"
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
                className="px-3 py-1 bg-[#bfa8fe] text-white rounded-lg"
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
