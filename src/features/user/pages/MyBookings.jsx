import React, { useEffect, useState } from "react";
import { userAPI } from "../userAPI";
import { useToast } from "../../../components/ui/ToastProvider";
import { CheckCircle, NotebookText } from "lucide-react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // when user pay amount then ask review card
  const [reviewData, setReviewData] = useState({
    bookingId: null,
    caregiverId: null,
    rating: 0,
    review: "",
  });

  const [reviewLoading, setReviewLoading] = useState(false);

  const handleAddReview = async () => {
    try {
      if (!reviewData.rating) {
        showToast("Please select rating");
        return;
      }

      const payload = {
        caregiverId: reviewData.caregiverId,
        bookingId: reviewData.bookingId,
        rating: reviewData.rating,
        review: reviewData.review,
      };

      const res = await userAPI.addReview(payload);

      if (res.data.data.success) {
        showToast("Review added successfully ");
        fetchBookings();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        showToast("You already submitted a review for this booking");
      } else {
        showToast("Review failed");
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
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

  const handlePayment = async (bookingId) => {
    try {
      setLoading(true);

      const payload = {
        bookingId,
        paymentMethod: "UPI",
      };

      const res = await userAPI.createTransaction(payload);

      if (res.data.success) {
        showToast("Payment Successful ");
        fetchBookings();
      }
    } catch (error) {
      console.log("Payment Error : ", error.message);
      showToast("Payment Failed ");
    } finally {
      setLoading(false);
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

  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 hover:scale-105"
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
              <div
                key={booking._id}
                className="bg-white shadow-lg rounded-2xl p-6 border fade-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Service Title */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xl font-semibold">
                      {booking?.bookingServiceCategory}
                    </p>
                    <p className="text-xs text-gray-700">ID: {booking?._id}</p>
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
                          loading="eager"
                          className="w-16 h-16 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-semibold text-lg">
                            {caregiver?.firstName} {caregiver?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {caregiver?.mobileNumber}
                          </p>
                          <p className="text-sm text-green-700">
                            {caregiver?.ratings.totalReviews || 0}
                          </p>
                          <p className="text-sm text-yellow-600">
                            ⭐ {caregiver?.ratings.average || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {caregiver?.qualifications?.map((q) => (
                          <span
                            key={q}
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
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between fade-slide-up">
                      <div>
                        <p className="flex items-center gap-2 text-green-700 font-semibold">
                          <CheckCircle size={18} />
                          Payment Completed
                        </p>

                        <p className="text-xs text-gray-600 mt-1">
                          Transaction ID:
                        </p>

                        <p className="text-sm font-mono text-gray-800 break-all">
                          {booking.transactionId}
                        </p>
                      </div>

                      <NotebookText className="text-green-500" size={22} />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 italic">
                      No transaction yet
                    </div>
                  )}
                </div>

                {/* Review Section */}
                {booking?.bookingStatus === "completed" &&
                booking?.transactionId &&
                reviewLoading === false ? (
                  <div className="border-t mt-4 pt-4 bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3 text-lg">
                      Rate Your Caregiver
                    </h4>

                    {/* Star Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive =
                          reviewData.bookingId === booking._id &&
                          reviewData.rating >= star;

                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              const newRating =
                                reviewData.rating === star ? 0 : star;

                              setReviewData({
                                ...reviewData,
                                bookingId: booking._id,
                                caregiverId: caregiver?._id,
                                rating: newRating,
                              });
                            }}
                            className={`text-3xl transition ${
                              isActive
                                ? "text-yellow-500 scale-110"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                          >
                            ⭐
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Rating Display */}
                    <p className="text-sm font-medium mb-3">
                      Selected Rating:{" "}
                      <span className="text-blue-600">
                        {reviewData.bookingId === booking._id
                          ? reviewData.rating
                          : 0}
                      </span>{" "}
                      / 5
                    </p>

                    {/* Review Text */}
                    <textarea
                      placeholder="Write your experience..."
                      className="w-full border rounded-lg p-2 text-sm mb-3 focus:ring-2 focus:ring-blue-300 outline-none"
                      rows={3}
                      value={
                        reviewData.bookingId === booking._id
                          ? reviewData.review
                          : ""
                      }
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          bookingId: booking._id,
                          caregiverId: caregiver?._id,
                          review: e.target.value,
                        })
                      }
                    />

                    {/* Submit Button */}
                    <button
                      onClick={handleAddReview}
                      disabled={
                        reviewData.bookingId !== booking._id ||
                        reviewData.rating === 0
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      Submit Review
                    </button>
                  </div>
                ) : (
                  booking?.bookingStatus === "completed" &&
                  booking?.transactionId && (
                    <div className="text-center py-10">Loading...</div>
                  )
                )}

                {booking?.bookingStatus === "completed" &&
                  !booking?.transactionId && (
                    <button
                      onClick={() => handlePayment(booking._id)}
                      disabled={loading}
                      className="mt-4 w-full bg-[#004D1F] hover:bg-[#002e13] font-bold transition-all duration-300 text-white py-2 rounded-lg disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Pay Now"}
                    </button>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2 flex-wrap">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 transform ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white shadow-lg scale-110"
                  : "bg-gray-200 hover:bg-gray-300 hover:scale-110"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
