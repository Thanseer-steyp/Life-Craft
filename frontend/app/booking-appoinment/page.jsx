"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Star } from "lucide-react";

export default function AdvisorsPage() {
  const [advisors, setAdvisors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  // Fetch advisors
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/advisor/advisors-list/")
      .then((res) => {
        setAdvisors(res.data);

        // Extract unique advisor types as categories
        const uniqueCategories = [
          "All",
          ...new Set(res.data.map((item) => item.advisor_type)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error(err));
  }, []);


  const handleAdvisorClick = (advisor) => {
    if (selected?.id === advisor.id) {
      // Clicking the same advisor closes the right panel
      setSelected(null);
    } else {
      setSelected(advisor);
    }
  };


  // Fetch booking status when advisor selected
  useEffect(() => {
    if (!selected) return;
    const token = localStorage.getItem("access");
    if (!token) return;

    axios
      .get(
        `http://localhost:8000/api/v1/user/check-appointment/${selected.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setBookingStatus(res.data.status || null);
      })
      .catch(() => setBookingStatus(null));
  }, [selected]);

  // Handle booking
  const handleBook = async (advisorId) => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login to book an appointment.");
      router.push("/authentication");
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

  // Filter advisors by category
  const filteredAdvisors =
    selectedCategory === "All"
      ? advisors
      : advisors.filter((advisor) => advisor.advisor_type === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Bubbles */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Choose Advisor Category
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition border ${
                  selectedCategory === category
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} Advisor
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Advisors List */}
          <div className="w-1/3 space-y-3 bg-white p-4 rounded-xl h-max">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Choose Advisor
            </h2>

            {filteredAdvisors.map((advisor) => (
              <div
                key={advisor.id}
                onClick={() => handleAdvisorClick(advisor)}
                className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                  selected?.id === advisor.id
                    ? "border-cyan-400 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={`http://localhost:8000${advisor.profile_photo}`}
                    alt={advisor.full_name}
                    className="w-14 h-14 rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {advisor.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {advisor.advisor_type.charAt(0).toUpperCase() +
                        advisor.advisor_type.slice(1)}{" "}
                      Advisor
                    </p>
                    <p className="text-xs text-gray-500">
                      {advisor.experience_years} years experience
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">4.9</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-2">
                    Available Today
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      • Online Consultation
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      • {advisor.company}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Fee Consultation
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    ₹200
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Advisor Details */}
          {selected && (
            <div className="flex-1 bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <img
                    src={`http://localhost:8000${selected.profile_photo}`}
                    alt={selected.full_name}
                    className="w-20 h-20 rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop";
                    }}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selected.full_name}
                    </h2>
                    <p className="text-gray-600">
                      {selected.advisor_type.charAt(0).toUpperCase() +
                        selected.advisor_type.slice(1)}{" "}
                      Specialist • {selected.experience_years} years experience
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-700 font-medium">
                        4.9
                      </span>
                    </div>
                  </div>
                </div>

                {bookingStatus === "pending" ? (
                  <button
                    disabled
                    className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                  >
                    Booking Pending...
                  </button>
                ) : bookingStatus === "accepted" ? (
                  <button
                    onClick={() => handleBook(selected.id)}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
                  >
                    Book Another Appointment
                  </button>
                ) : (
                  <button
                    onClick={() => handleBook(selected.id)}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
                  >
                    Book an Appointment
                  </button>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Education
                  </h3>
                  <p className="text-gray-800">
                    {selected.highest_qualification.toUpperCase()} in{" "}
                    {selected.specialized_in}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Certificate
                  </h3>
                  <p className="text-gray-800">
                    Certified {selected.advisor_type} Advisor
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  Languages
                </h3>
                <p className="text-gray-800">{selected.language_preferences}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  Location
                </h3>
                <p className="text-gray-800">
                  {selected.state_address}, {selected.country_address}
                </p>
              </div>
            </div>
          )}

          {!selected && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-lg">Select an advisor to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
