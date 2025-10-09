"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { User, Mail, Calendar, X, Check, Award, Clock, Briefcase, Star, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdvisorsPage() {
  const [advisors, setAdvisors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get(
          "http://localhost:8000/api/v1/advisor/advisors-list/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAdvisors(response.data);
      } catch (err) {
        console.error("Error fetching advisors:", err);
        showNotification("Failed to load advisors. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleBook = async (advisorId) => {
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("access");
      await axios.post(
        "http://localhost:8000/api/v1/user/book-appointment/",
        { advisor_id: advisorId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification(
        "🎉 Appointment request sent successfully! The advisor will contact you soon.",
        "success"
      );
      setSelected(null);
    } catch (err) {
      console.error("Booking error:", err);
      showNotification(
        "Failed to book appointment. Please try again later.",
        "error"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading advisors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div
            className={`rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-md border-2 ${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto hover:opacity-70 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl inline-block mb-6">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Meet Our Expert Advisors
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Connect with certified financial advisors who will help turn your dreams into achievable goals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Information Banner */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6 mb-10 transform hover:scale-[1.02] transition-transform">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                How It Works
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Select an advisor that matches your financial goals, request a consultation, and receive personalized guidance. 
                All appointments are reviewed within 24-48 hours, and you'll be contacted via email to schedule your session.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Star className="w-8 h-8" />
              </div>
              <div>
                <p className="text-3xl font-bold">{advisors.length}+</p>
                <p className="text-blue-100">Expert Advisors</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-green-100">Certified Professionals</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-3xl font-bold">24-48h</p>
                <p className="text-purple-100">Response Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advisors.map((advisor) => (
            <div
              key={advisor.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-purple-100 hover:border-purple-300 group transform hover:-translate-y-2"
            >
              {/* Card Header with Gradient */}
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 h-32">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-10"></div>
                <div className="absolute inset-0">
                  <div className="absolute top-4 right-4 bg-white bg-opacity-30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white border-opacity-50">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Certified
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="px-6 pb-6 -mt-14 relative">
                {/* Avatar Circle */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-28 h-28 rounded-full border-4 border-white shadow-2xl flex items-center justify-center mb-4 mx-auto ring-4 ring-purple-100">
                  <User className="w-14 h-14 text-white" />
                </div>

                {/* Advisor Details */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {advisor.username}
                  </h2>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl py-3 px-4 border-2 border-purple-200">
                    <div className="flex items-center justify-center text-gray-700">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-purple-600" />
                      <span className="text-sm font-medium truncate">{advisor.email}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      Financial Planning
                    </span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                      Dream Advisor
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-100 mb-5"></div>

                {/* Action Button */}
                <button
                  onClick={() => setSelected(advisor)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Calendar className="w-5 h-5" />
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {advisors.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 text-center py-20">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-purple-50">
              <User className="w-16 h-16 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              No Advisors Available
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Our advisory team is currently unavailable. Please check back later for consultation opportunities.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Confirmation Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 px-8 py-6 rounded-t-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Confirm Your Consultation
                  </h2>
                  <p className="text-purple-100">You're one step closer to achieving your dreams!</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-8">
              {/* Advisor Information Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200 shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                      Your Selected Advisor
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {selected.username}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-700 bg-white rounded-lg px-3 py-2 border border-purple-200">
                      <Mail className="w-4 h-4 flex-shrink-0 text-purple-600" />
                      <span className="text-sm font-medium">{selected.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-blue-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  What to Expect
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Personalized financial guidance tailored to your dreams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Expert analysis of your current financial situation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Actionable strategies to achieve your goals faster</span>
                  </li>
                </ul>
              </div>

              {/* Confirmation Notice */}
              <div className="bg-purple-50 rounded-2xl p-5 mb-6 border-2 border-purple-300">
                <div className="flex gap-3">
                  <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Important Information</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Your consultation request will be sent to <strong>{selected.username}</strong>. 
                      You will receive an email confirmation within 24-48 hours with available time slots for your session.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setSelected(null)}
                  disabled={bookingLoading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBook(selected.id)}
                  disabled={bookingLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}