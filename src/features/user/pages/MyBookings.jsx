import React, { useEffect, useState } from "react";
import { userAPI } from "../userAPI";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider";
import { CheckCircle2, ReceiptText } from "lucide-react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1); // reset page on tab change
    fetchBookings();
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let res;

      switch (activeTab) {
        case "accepted":
          res = await userAPI.getMyBookedAcceptedServicesBooking();
          break;
        case "pending":
          res = await userAPI.getMyBookedPendingServicesBooking();
          break;
        case "completed":
          res = await userAPI.getMyBookedCompletedServicesBooking();
          break;
        case "cancelled":
          res = await userAPI.getMyBookedCancelledServicesBooking();
          break;
        case "inprogress":
          res = await userAPI.getMyBookedInProgressServicesBooking();
          break;
        default:
          res = await userAPI.getMyAllBookings();
      }

      setBookings(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      showToast("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await userAPI.cancleBooking(id);
      showToast("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      showToast("Cancel failed");
    }
  };

  const statusTabs = [
    "all",
    "pending",
    "accepted",
    "inprogress",
    "completed",
    "cancelled",
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "inprogress":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      setLoading(true);

      const payload = {
        bookingId,
        paymentMethod: "UPI", // or Card / Cash / etc
      };

      const res = await userAPI.createTransaction(payload);

      if (res.data.success) {
        showToast("Payment Successful ");

        // If invoice path exists
        // if (res.data.invoice) {
        //   window.open(res.data.invoice, "_blank");
        // }

        // Optional: Refresh bookings
        fetchBookings();

        // Optional: Redirect to transactions page
        // navigate("/transactions");
      }
    } catch (error) {
      console.log("Payment Error : ", error.message);
      showToast("Payment Failed ");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 🔥 Status Tabs */}
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
          {paginatedBookings.map((booking, index) => {
            const caregiver = booking?.caregiverId;

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white shadow-lg rounded-2xl p-6 border"
              >
                {/* Service Title */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {booking?.bookingServiceCategory}
                    </h3>
                    <p className="text-xs text-gray-400">ID: {booking?._id}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                      booking?.bookingStatus,
                    )}`}
                  >
                    {booking?.bookingStatus}
                  </span>
                </div>

                {/* Caregiver */}
                {caregiver &&
                  !["all", "pending", "cancelled"].includes(activeTab) && (
                    <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                      <div className="flex items-center gap-4">
                        <img
                          src={caregiver?.profilePicture}
                          alt="caregiver"
                          className="w-16 h-16 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-semibold text-lg">
                            {caregiver?.firstName} {caregiver?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {caregiver?.mobileNumber}
                          </p>
                          <p className="text-sm text-yellow-600">
                            ⭐ {caregiver?.ratingAverage || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {caregiver?.qualifications?.map((q, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Start</p>
                    <p className="font-medium">
                      {new Date(
                        booking?.schedule?.startDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">End</p>
                    <p className="font-medium">
                      {new Date(
                        booking?.schedule?.endDate,
                      ).toLocaleDateString()}
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

                {/* Pricing Breakdown */}
                <div className="border-t pt-4 text-sm">
                  <h4 className="font-semibold mb-3">Pricing Breakdown</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Base Price / Hr</p>
                      <p className="font-semibold">
                        ₹{booking?.pricing?.basePrice}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Hours / Day</p>
                      <p className="font-semibold">
                        {booking?.duration?.hours}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Per Day Price</p>
                      <p className="font-semibold">
                        ₹{booking?.duration?.pricePerDay}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Platform Fee</p>
                      <p className="font-semibold">
                        ₹{booking?.pricing?.platformFee || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Tax</p>
                      <p className="font-semibold">
                        ₹{booking?.pricing?.tax || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Payment</p>
                      <p className="font-semibold capitalize">
                        {booking?.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-between items-center">
                    <p className="text-lg font-semibold">Grand Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(booking?.grandTotal)}
                    </p>
                  </div>
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

                {booking?.bookingStatus === "completed" &&
                  !booking?.transactionId && (
                    <button
                      onClick={() => handlePayment(booking._id)}
                      disabled={loading}
                      className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Pay Now"}
                    </button>
                  )}
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2 flex-wrap">
          {[...Array(totalPages)].map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
