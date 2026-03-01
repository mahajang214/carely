import React, { useEffect, useState } from "react";
import { caregiverAPI } from "../caregiverAPI";
import { motion } from "framer-motion";
import { CheckCircle2, ReceiptText } from "lucide-react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const statusTabs = [
    "all",
    "accepted",
    "in-progress",
    "completed",
    "cancelled",
  ];

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res =
        activeTab === "all"
          ? await caregiverAPI.allBookingRequest()
          : await caregiverAPI.allBookingRequest(`?status=${activeTab}`);

      setBookings(res?.data?.data || []);
      // console.log("BOOKING :", res?.data?.data);
    } catch (error) {
      console.error("Fetch booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    await caregiverAPI.updateBookingRequest(id, { status });
    fetchBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* STATUS FILTER */}
      <div className="flex flex-wrap gap-3 mb-8">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No bookings found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white shadow-xl rounded-2xl p-6 border"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {booking?.bookingServiceCategory}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Booking ID: {booking?._id}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                    booking?.bookingStatus,
                  )}`}
                >
                  {booking?.bookingStatus}
                </span>
              </div>

              {/* PATIENT DETAILS */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold mb-2 text-gray-700">
                  Patient Information
                </h4>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p>
                    <strong>Name:</strong> {booking?.patientId?.firstName}{" "}
                    {booking?.patientId?.lastName}
                  </p>
                  <p>
                    <strong>Age:</strong> {booking?.patientId?.age}
                  </p>
                  <p>
                    <strong>Gender:</strong> {booking?.patientId?.gender}
                  </p>
                  <p>
                    <strong>Blood Group:</strong>{" "}
                    {booking?.patientId?.bloodGroup}
                  </p>
                  <p className="col-span-2">
                    <strong>Address:</strong>{" "}
                    {booking?.patientId?.address?.fullAddress}
                  </p>
                </div>
              </div>

              {/* MEDICAL INFO */}
              <div className="bg-red-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold mb-2 text-red-700">
                  Medical Information
                </h4>

                <p className="text-sm">
                  <strong>Allergies:</strong>{" "}
                  {booking?.patientId?.allergies?.length
                    ? booking?.patientId?.allergies.join(", ")
                    : "None"}
                </p>

                <p className="text-sm">
                  <strong>Chronic Conditions:</strong>{" "}
                  {booking?.patientId?.chronicConditions?.length
                    ? booking?.patientId?.chronicConditions.join(", ")
                    : "None"}
                </p>
              </div>

              {/* EMERGENCY CONTACT */}
              <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold mb-2 text-yellow-700">
                  Emergency Contact
                </h4>
                <p className="text-sm">
                  <strong>Name:</strong>{" "}
                  {booking?.patientId?.emergencyContact?.name}
                </p>
                <p className="text-sm">
                  <strong>Relationship:</strong>{" "}
                  {booking?.patientId?.emergencyContact?.relationship}
                </p>
                <p className="text-sm">
                  <strong>Mobile Number :</strong>{" "}
                  {booking?.patientId?.emergencyContact?.phoneNo}
                </p>
              </div>

              {/* RESPONSIBLE MEMBER */}
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold mb-2 text-blue-700">
                  Responsible Member
                </h4>

                <p className="text-sm">
                  <strong>Name:</strong> {booking?.userId?.firstName}{" "}
                  {booking?.userId?.lastName}
                </p>

                <p className="text-sm">
                  <strong>Mobile Number:</strong>{" "}
                  {booking?.userId?.mobileNumber}
                </p>
              </div>

              {/* SCHEDULE */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {new Date(
                      booking?.schedule?.startDate,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium">
                    {new Date(booking?.schedule?.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Time Slot</p>
                  <p className="font-medium">{booking?.schedule?.timeSlot}</p>
                </div>

                <div>
                  <p className="text-gray-500">Total Days</p>
                  <p className="font-medium">{booking?.totalDays}</p>
                </div>
              </div>

              {/* BILL DETAILS */}
              <div className="border-t pt-4 bg-gray-50 rounded-xl p-4 mt-4">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Billing Details
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price (per day)</span>
                    <span>₹{booking?.pricing?.basePrice}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Service Duration (Hours)</span>
                    <span>{booking?.duration?.hours} hrs</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Price Per Day</span>
                    <span>₹{booking?.duration?.pricePerDay}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total Days</span>
                    <span>{booking?.totalDays}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>₹{booking?.pricing?.platformFee || 0}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{booking?.pricing?.tax || 0}</span>
                  </div>

                  <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold">
                    <span>Grand Total</span>
                    <span className="text-blue-600">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(booking?.grandTotal)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    Payment Method: {booking?.paymentMethod}
                  </div>

                  {/* Transaction Status */}
                  <div className="border-t pt-4 mt-4">
                    {booking?.transactionId ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between"
                      >
                        <div>
                          <p className="flex items-center gap-2 text-green-700 font-semibold">
                            <CheckCircle2 size={18} />
                            Payment Completed
                          </p>

                          <p className="text-xs text-gray-600 mt-1">
                            Transaction ID:
                          </p>

                          <p className="text-sm font-mono text-gray-800 break-all">
                            {booking.transactionId}
                          </p>
                        </div>

                        <ReceiptText className="text-green-500" size={22} />
                      </motion.div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        No transaction yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* STATUS ACTIONS */}
              {booking?.bookingStatus === "accepted" && (
                <button
                  onClick={() => handleStatusUpdate(booking._id, "in-progress")}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                >
                  Start Service
                </button>
              )}

              {booking?.bookingStatus === "in-progress" && (
                <button
                  onClick={() => handleStatusUpdate(booking._id, "completed")}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Mark Completed
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
