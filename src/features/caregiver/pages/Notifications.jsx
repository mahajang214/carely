import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleX } from "lucide-react";
import { Button } from "../../../components/ui";
import Loader from "../../../components/common/Loader.jsx";
import { commonAPI } from "../../common/commonAPI.js";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import { caregiverAPI } from "../caregiverAPI.js";

const InfoItem = ({ label, value, highlight, capitalize, badge }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    {badge ? (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
        {value}
      </span>
    ) : (
      <p
        className={`font-semibold ${
          highlight ? "text-blue-600 text-xl" : "text-gray-800"
        } ${capitalize ? "capitalize" : ""}`}
      >
        {value || "-"}
      </p>
    )}
  </div>
);

const StatusBadge = ({ label, active }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  </div>
);

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [serviceInfo, setServiceInfo] = useState(null);

  // toast
  const { showToast } = useToast();

  // booking
  const [bookingInfo, setBookingInfo] = useState(null);

  const getAllNotifications = async () => {
    setLoading(true);
    try {
      const response = await commonAPI.getNotifications();
      // console.log("Response:", response.data.data.data);
      setNotifications(response.data.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error.message);
      showToast("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllNotifications();
  }, []);

  const getOneNotification = async (serviceId) => {
    setLoading(true);
    try {
      const res = await commonAPI.getNotificationDetails(serviceId);
      setActiveNotification(res.data.data.data);
      // console.log("ONE NOTIFICATION : ", res.data.data.data);
      if (res.data.data.data.type === "service") {
        getServiceDetails(res.data.data.data.referenceId);
        if (res.data.data.data.bookingId) {
          await getBooking(res.data.data.data.bookingId);
          return;
        }
      }

      // console.log("NOTIFICATION RESPONSE:", res.data.data.data);
      // setServiceInfo(res.data.data);
      //   setServiceDetails(res.data.data);
    } catch (error) {
      showToast("Failed to load notification details");
    } finally {
      setLoading(false);
    }
  };

  const getBooking = async (bookingId) => {
    setLoading(true);
    try {
      const res = await commonAPI.getBookingDetails(bookingId);

      // console.log("BOOKING RESPONSE:", res.data.data);
      return setBookingInfo(res.data.data);
      // setServiceDetails(res.data.data);
    } catch (error) {
      console.log("BOOKING ERROR : ", error.message);
      showToast("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const getServiceDetails = async (serviceId) => {
    setLoading(true);
    try {
      const res = await commonAPI.getServiceInfo(serviceId);

      setServiceInfo(res.data);
      // console.log("SERVICE DETAILS:", res.data);
      //   setServiceDetails(res.data.data);
    } catch (error) {
      showToast("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    setLoading(true);
    if (!id) {
      return showToast("Invalid ID");
    }
    try {
      // 🔥 Call your backend API to accept request
      await caregiverAPI.acceptServiceRequest(id);

      showToast("Service Request Accepted ");

      // Optionally refresh notifications
      getAllNotifications();
    } catch (error) {
      console.error("Failed to accept request", error);
      showToast("Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-3 relative">
      {loading ? (
        <Loader className="w-full h-64 flex items-center justify-center" />
      ) : (
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <motion.div
              key={notification._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border hover:bg-gray-200 rounded-lg cursor-pointer shadow-sm"
              onClick={() => {
                // console.log(" notification id :", notification._id);
                return getOneNotification(notification._id);
              }}
            >
              <h2 className="font-semibold">{notification.title}</h2>
              <p className="text-sm text-gray-500">{notification.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* FULL SCREEN MODAL */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white w-full h-full p-8 overflow-y-auto"
            >
              <div className="flex justify-end">
                <Button
                  variant="subDanger"
                  onClick={() => setActiveNotification(null)}
                >
                  <CircleX /> Close
                </Button>
              </div>

              <h2 className="text-3xl font-bold mb-4">
                {activeNotification.title}
              </h2>

              <p className="mb-4">{activeNotification.message}</p>

              <p className="text-sm text-gray-500">
                Type: {activeNotification.type}
              </p>

              <p className="text-sm text-gray-500">
                Priority: {activeNotification.priority}
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Date: {new Date(activeNotification.createdAt).toLocaleString()}
              </p>

              {/* 🔥 IF SERVICE TYPE → SHOW FULL INFO */}

              {/* 🔥 SERVICE DETAILS */}
              {serviceInfo != null && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Service Details
                  </h3>

                  <div className="bg-gray-50 p-6 shadow-lg rounded-2xl border border-gray-200">
                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      {serviceInfo?.data?.name}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {serviceInfo?.data?.description}
                    </p>

                    {/* Info Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <InfoItem
                        label="Category"
                        value={serviceInfo?.data?.categoryName}
                      />

                      <InfoItem
                        label="Pricing Type"
                        value={serviceInfo?.data?.pricingType}
                        capitalize
                      />

                      <InfoItem
                        label="Base Price"
                        value={`₹${serviceInfo?.data?.basePrice}`}
                        highlight
                      />

                      <StatusBadge
                        label="Status"
                        active={serviceInfo?.data?.isActive}
                      />
                    </div>

                    {/* Qualifications */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">
                        Required Caregiver Qualification
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {serviceInfo?.data?.requiredQualification?.length >
                        0 ? (
                          serviceInfo.data.requiredQualification.map((q, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {q}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </div>
                    </div>

                    {/* Duration Options */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Available Duration Options
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {serviceInfo?.data?.durationOptions?.map((opt, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium"
                          >
                            {opt.hours} Hours – ₹{opt.price}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🔥 BOOKING DETAILS */}
              {/* 🔥 BOOKING DETAILS */}
              {bookingInfo != null && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Booking Details
                  </h3>

                  <div className="bg-gray-50 p-6 shadow-lg rounded-2xl border border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <InfoItem
                        label="Start Date"
                        value={
                          bookingInfo?.schedule?.startDate
                            ? new Date(
                                bookingInfo.schedule.startDate,
                              ).toLocaleDateString()
                            : "-"
                        }
                      />

                      <InfoItem
                        label="End Date"
                        value={
                          bookingInfo?.schedule?.endDate
                            ? new Date(
                                bookingInfo.schedule.endDate,
                              ).toLocaleDateString()
                            : "-"
                        }
                      />

                      <InfoItem
                        label="Time Slot"
                        value={bookingInfo?.schedule?.timeSlot || "-"}
                      />

                      <InfoItem
                        label="Shift Duration"
                        value={`${bookingInfo?.duration?.hours || 0} Hours`}
                      />

                      <InfoItem
                        label="Total Days"
                        value={bookingInfo?.totalDays || 0}
                      />

                      <InfoItem
                        label="Payment Method"
                        value={bookingInfo?.paymentMethod?.toUpperCase()}
                      />

                      <InfoItem
                        label="Payment Status"
                        value={bookingInfo?.paymentStatus}
                      />

                      <InfoItem
                        label="Booking Status"
                        value={bookingInfo?.bookingStatus}
                        badge
                      />
                    </div>

                    {/* Total Price */}
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-gray-500 text-sm">Total Price</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{bookingInfo?.grandTotal}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACCEPT BUTTON */}
              {bookingInfo?.bookingStatus === "pending" ? (
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAcceptRequest(bookingInfo?._id)}
                  >
                    Accept Request
                  </Button>
                </div>
              ) : activeNotification.type === "service" ? (
                <div className="mt-6 flex justify-end">
                  <div className="bg-red-400 text-white px-3 py-2 rounded">
                    Not Available
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;
