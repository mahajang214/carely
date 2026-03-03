import React, { useEffect, useState } from "react";
import { caregiverAPI } from "../caregiverAPI";
import { motion } from "framer-motion";
import { ReceiptIndianRupeeIcon, ShieldCheck } from "lucide-react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
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
  }, []);

  useEffect(() => {
    filterBookings();
  }, [activeTab, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await caregiverAPI.allBookingRequest();
      const data = res?.data?.data || [];
      setBookings(data);
    } catch (error) {
      console.error("Fetch booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (activeTab === "all") {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(
        (booking) => booking.bookingStatus === activeTab,
      );
      setFilteredBookings(filtered);
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
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      {/* STATUS FILTER */}
      <div className="flex overflow-x-auto sm:flex-wrap gap-3 mb-8 pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 whitespace-nowrap rounded-full capitalize text-sm font-medium transition ${
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
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No bookings found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 border flex flex-col"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {booking?.bookingServiceCategory}
                  </p>
                  <p className="text-xs text-gray-600 break-all">
                    Booking ID: {booking?._id}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize w-fit ${getStatusColor(
                    booking?.bookingStatus,
                  )}`}
                >
                  {booking?.bookingStatus}
                </span>
              </div>

              {/* PATIENT DETAILS */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Patient Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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

                  <p className="sm:col-span-2 break-words">
                    <strong>Address:</strong>{" "}
                    {booking?.patientId?.address?.fullAddress}
                  </p>
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
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

              {/* BILLING */}
              <div className="border-t pt-4 bg-gray-50 rounded-xl p-4 mt-auto">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Billing Details
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price</span>
                    <span>₹{booking?.pricing?.basePrice}</span>
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
                    <span>Total</span>
                    <span className="text-blue-600">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(booking?.grandTotal)}
                    </span>
                  </div>

                  {/* PAYMENT */}
                  <div className="border-t pt-4 mt-4">
                    {booking?.transactionId ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-start">
                        <div>
                          <p className="flex items-center gap-2 text-green-700 font-semibold">
                            <ShieldCheck size={18} />
                            Payment Completed
                          </p>

                          <p className="text-xs text-gray-600 mt-1">
                            Transaction ID
                          </p>

                          <p className="text-sm font-mono break-all">
                            {booking.transactionId}
                          </p>
                        </div>

                        <ReceiptIndianRupeeIcon
                          size={22}
                          className="text-green-500"
                        />
                      </div>
                    ) : (
                      <p className="text-sm italic text-gray-600">
                        No transaction yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
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
