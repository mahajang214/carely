import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider";
import { EyeIcon } from "lucide-react";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({});

  const { showToast } = useToast();

  // Fetch bookings based on filter
  const fetchBookings = async (type = "all") => {
    setLoading(true);
    try {
      let res;

      if (type === "pending") {
        res = await adminAPI.getAllPendingBookings();
      } else if (type === "completed") {
        res = await adminAPI.getAllCompletedBookings();
      } else if (type === "rejected") {
        res = await adminAPI.getAllRejectedBookings();
      } else {
        res = await adminAPI.getAllBookings();
      }

      setBookings(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching bookings", err);
      showToast("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking details
  const fetchBookingDetails = async (id) => {
    if (!id || bookingDetails[id]) return;

    try {
      const res = await adminAPI.getBookingDetails(id);
      // console.log("RESPONSE : ", res.data.data);
      setBookingDetails((prev) => ({
        ...prev,
        [id]: res.data?.data,
      }));
    } catch (err) {
      console.error("Error fetching booking details", err);
      showToast("Error fetching booking details");
    }
  };

  useEffect(() => {
    fetchBookings(filter);
  }, [filter]);

  const toggleDetails = (id) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
      fetchBookingDetails(id);
    }
  };

  const getStatusColor = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <motion.div
      className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ================= FILTER BUTTONS ================= */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {["all", "pending", "completed", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm sm:text-base font-medium transition ${
              filter === f
                ? "bg-[#003A9E] text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No bookings found</div>
      ) : (
        bookings.map((booking, index) => (
          <motion.div
            key={booking._id}
            layout
            className="bg-white border rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* ================= HEADER ================= */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4">
              <div className="space-y-2">
                <p className="font-semibold text-base sm:text-lg break-all">
                  #{index + 1} Booking ID: {booking._id}
                </p>

                <span
                  className={`inline-block text-xs sm:text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
                    booking.bookingStatus ||
                      booking.requestStatus ||
                      booking.serviceStatus,
                  )}`}
                >
                  {booking.bookingStatus ||
                    booking.requestStatus ||
                    booking.serviceStatus ||
                    "N/A"}
                </span>
              </div>

              <button
                onClick={() => toggleDetails(booking._id)}
                className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto transition"
              >
                <EyeIcon size={16} /> Details
              </button>
            </div>

            {/* ================= DETAILS ================= */}
            <AnimatePresence>
              {openId === booking._id && bookingDetails[booking._id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t bg-gray-50 p-4 sm:p-6 space-y-6"
                >
                  {(() => {
                    const details = bookingDetails[booking._id];

                    const {
                      schedule,
                      duration,
                      grandTotal,
                      pricing,
                      patientId,
                      caregiverId,
                      userId,
                      serviceId,
                      totalDays,
                      __v,
                      ...rest
                    } = details;

                    return (
                      <>
                        {/* ===== BASIC INFO ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(rest).map(([key, value]) => {
                            if (
                              !value ||
                              typeof value === "object" ||
                              ["_id"].includes(key)
                            )
                              return null;

                            return (
                              <div
                                key={key}
                                className="bg-white p-3 rounded-lg shadow-sm"
                              >
                                <p className="text-xs sm:text-sm font-semibold text-gray-500 capitalize">
                                  {key}
                                </p>
                                <p className="text-sm sm:text-base text-gray-800 break-words">
                                  {value}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* ===== PATIENT ===== */}
                        {patientId && (
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 text-indigo-600">
                              Patient Information
                            </h3>
                            <p>
                              <strong>Name:</strong> {patientId.firstName}{" "}
                              {patientId.lastName}
                            </p>
                            <p>
                              <strong>Gender:</strong> {patientId.gender}
                            </p>
                          </div>
                        )}

                        {/* ===== CAREGIVER ===== */}
                        {caregiverId && (
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 text-green-600">
                              Caregiver Information
                            </h3>
                            <p>
                              <strong>Name:</strong> {caregiverId.firstName}{" "}
                              {caregiverId.lastName}
                            </p>
                            <p>
                              <strong>Email:</strong> {caregiverId.email}
                            </p>
                            <p>
                              <strong>Phone:</strong> {caregiverId.mobileNumber}
                            </p>
                          </div>
                        )}

                        {/* ===== USER ===== */}
                        {userId && (
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 text-pink-600">
                              Booking Created By
                            </h3>
                            <p>
                              <strong>Name:</strong> {userId.firstName}{" "}
                              {userId.lastName}
                            </p>
                            <p>
                              <strong>Email:</strong> {userId.email}
                            </p>
                            <p>
                              <strong>Phone:</strong> {userId.mobileNumber}
                            </p>
                          </div>
                        )}

                        {/* ===== SERVICE ===== */}
                        {serviceId && (
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 text-purple-600">
                              Service Information
                            </h3>
                            <p>
                              <strong>Service:</strong>{" "}
                              {serviceId.serviceName || serviceId.name}
                            </p>
                            <p>
                              <strong>Category:</strong>{" "}
                              {serviceId.categoryName}
                            </p>
                          </div>
                        )}

                        {/* ===== SCHEDULE ===== */}
                        {schedule && (
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-600">
                              Schedule
                            </h3>
                            <p>
                              <strong>Start Date:</strong>{" "}
                              {new Date(
                                schedule.startDate,
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>End Date:</strong>{" "}
                              {new Date(schedule.endDate).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Time:</strong> {schedule.timeSlot}
                            </p>
                          </div>
                        )}

                        {/* ===== DURATION ===== */}
                        {duration && (
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 text-orange-600">
                              Duration
                            </h3>
                            <p>
                              <strong>Total Days:</strong> {totalDays}
                            </p>
                            <p>
                              <strong>Type:</strong> {duration.hours} hours/day
                            </p>
                          </div>
                        )}

                        {/* ===== PRICING ===== */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-emerald-600">
                            Pricing
                          </h3>
                          <p>
                            <strong>Daily Rate:</strong>{" "}
                            {(pricing?.finalPerDay || 0).toLocaleString(
                              "en-IN",
                              {
                                style: "currency",
                                currency: "INR",
                              },
                            )}
                          </p>
                          <p>
                            <strong>Total Amount:</strong>{" "}
                            {(grandTotal || 0).toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

export default Bookings;
