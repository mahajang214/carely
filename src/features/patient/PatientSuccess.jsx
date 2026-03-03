import React from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartHandshake,
  ShieldCheck,
  BedDouble,
  CheckCircle,
  Home,
} from "lucide-react";

function PatientSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-10 text-center card-hover fade-in">
        {/* Top Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-600" size={48} />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Everything Is Taken Care Of ❤️
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Your responsible member will now handle everything for you. You can
          relax, rest peacefully, and focus only on your recovery.
        </p>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 fade-in-stagger mb-10">
          <div className="bg-blue-50 p-6 rounded-xl service-card">
            <HeartHandshake className="mx-auto text-blue-600 mb-3" size={36} />
            <h3 className="font-semibold text-gray-800 mb-2">Full Support</h3>
            <p className="text-sm text-gray-600">
              Your caregiver and responsible member are managing your care.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl service-card">
            <ShieldCheck className="mx-auto text-green-600 mb-3" size={36} />
            <h3 className="font-semibold text-gray-800 mb-2">Safe & Secure</h3>
            <p className="text-sm text-gray-600">
              All your services are confirmed and being monitored.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl service-card">
            <BedDouble className="mx-auto text-purple-600 mb-3" size={36} />
            <h3 className="font-semibold text-gray-800 mb-2">Time To Rest</h3>
            <p className="text-sm text-gray-600">
              Take this time to relax. Everything else is handled for you.
            </p>
          </div>
        </div>

        {/* Navigate Button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
        >
          <Home size={20} />
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default PatientSuccess;
