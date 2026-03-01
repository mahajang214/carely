import React, { useEffect, useState } from "react";
import { commonAPI } from "../../common/commonAPI";
import { userAPI } from "../../user/userAPI";
import { useToast } from "../../../components/ui/ToastProvider";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function BrowseServices() {
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [backendCategoriesList, setBackendCategoriesList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // select and open in full screen with more info
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const servicesPerPage = 6;

  // localstorage
  const [userPatients, setUserPatients] = useState([]);

  // booking card
  // "upi", "card", "cash"
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showBookingCard, setShowBookingCard] = useState(false);

  const [bookingData, setBookingData] = useState({
    categoryName: "",
    patientId: "",
    duration: {
      hours: "",
      price: "",
    },
    serviceId: "",
    paymentMethod: "upi",
    schedule: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      timeSlot: "",
    },
  });

  // 🔥 Decide which API to call
  const fetchServices = async () => {
    setLoading(true);
    try {
      let res;

      if (category ) {
        res = await userAPI.getFilteredServices({
          categoryName: category || undefined,
          page: currentPage,
          limit: servicesPerPage,
        });
        // console.log("Response : ", res.data.data.data);
        setServices(res.data.data.data);
        return;
      } else {
        res = await commonAPI.getServices({
          page: currentPage,
          limit: servicesPerPage,
          search,
        });
      }

      const responseData = res.data;

      const servicesArray = Array.isArray(responseData.data)
        ? responseData.data
        : [];
      // 🔥 Handle different response structures safely

      setServices(servicesArray);
      // console.log("SERVICES : ", services);

      setTotalPages(responseData.pagination?.totalPages || 1);
    } catch (error) {
      console.log("Error:", error.message);
      showToast("Unable to load services");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Fetch categories once
  const getCategories = async () => {
    try {
      const res = await commonAPI.getCategories();
      setBackendCategoriesList(res.data.data);
    } catch (error) {
      showToast("Unable to load categories");
    }
  };

  // 🔥 Main effect
  useEffect(() => {
    fetchServices();

    const userString = localStorage.getItem("user");

    if (!userString) return;

    const parsedUser = JSON.parse(userString);

    setUserPatients(
      Array.isArray(parsedUser.linkedPatients) ? parsedUser.linkedPatients : [],
    );
  }, [currentPage, search, category, duration]);

  // 🔥 Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, duration]);

  useEffect(() => {
    getCategories();
  }, []);

  const handleOpenService = async (serviceId) => {
    setDetailsLoading(true);
    setSelectedService(true); // open modal immediately
    setSelectedServiceId(serviceId);
    try {
      const res = await commonAPI.getServiceInfo(serviceId);

      // console.log("res:", res.data.data);

      setServiceDetails(res.data.data);
    } catch (error) {
      showToast("Failed to load service details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const isValidTimeDuration = () => {
    const { startTime, endTime } = bookingData.schedule;
    const requiredHours = Number(bookingData.duration.hours);

    if (!startTime || !endTime || !requiredHours) return true;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    // Handle overnight shift
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const diffHours = (endMinutes - startMinutes) / 60;

    return diffHours === requiredHours;
  };

  const handleBooking = async () => {
    setLoading(true);

    if (!isValidTimeDuration()) {
      showToast(
        `Time slot must be exactly ${bookingData.duration.hours} hours`,
      );
      return;
    }

    if (
      !bookingData.categoryName ||
      !bookingData.patientId ||
      !bookingData.duration.hours ||
      !bookingData.schedule.startDate ||
      !bookingData.schedule.endDate ||
      !bookingData.schedule.startTime ||
      !bookingData.schedule.endTime
    ) {
      return showToast("Please Fill Booking Details");
    }
    try {
      const payload = {
        ...bookingData,
        schedule: {
          ...bookingData.schedule,
          timeSlot: `${bookingData.schedule.startTime} - ${bookingData.schedule.endTime}`,
        },
      };

      const res = await userAPI.bookService(payload);

      // console.log("1. BOOKING RESPONSE:", res.data.data); //correct
      // console.log("2. BOOKING RESPONSE:", res.data.data.data);
      // console.log("3. BOOKING RESPONSE:", res.data);
      // console.log("bookingId: ", res.data.data._id);
      // return setBookingId(res.data.data._id);
      // if (res.data.data) {
      //   return setBookingId(res.data.data._id);
      // }

      setSelectedService(null);
      setServiceDetails(null);
      setSelectedDuration(null);
      setShowBookingCard(false);
      setBookingData({
        categoryName: "",
        patientId: "",
        duration: {
          hours: "",
          price: "",
        },
        serviceId: "",
        paymentMethod: "upi",
        schedule: {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          timeSlot: "",
        },
      });
      showToast("Booking Request Sended Successfull");
    } catch (error) {
      console.log("Error booking : ", error.message);
      showToast("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-8 bg-gray-50 min-h-screen"
    >
      {/* Filters */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap gap-4 mb-10 items-center justify-end"
      >
        <label className="text-xl text-gray-700">Filter :</label>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {backendCategoriesList.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-blue-600 font-semibold">
          Loading services...
        </div>
      )}

      {/* Empty */}
      {!loading && services.length === 0 && (
        <div className="text-center text-gray-500">No services found.</div>
      )}

      {/* Services Cards */}
      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {services?.map((service) => (
            <motion.div
              key={service._id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => handleOpenService(service._id)}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition cursor-pointer border border-gray-100"
            >
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {service.description}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                  {service.pricingType}
                </span>

                <span className="font-bold text-blue-600 text-lg">
                  ₹{service.basePrice}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* service info */}
      <AnimatePresence>
        {selectedService && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => {
                setSelectedService(null);
                setServiceDetails(null);
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex justify-center items-center p-6"
            >
              <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-10 relative">
                {/* Close */}
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setSelectedService(null);
                    setServiceDetails(null);
                  }}
                  className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl cursor-pointer"
                >
                  ✕
                </motion.button>

                {/* Loading */}
                {detailsLoading && (
                  <div className="text-center text-blue-600 font-semibold">
                    Loading service details...
                  </div>
                )}

                {/* Content */}
                {!detailsLoading && serviceDetails && (
                  <>
                    <h1 className="text-4xl font-bold mb-6">
                      {serviceDetails.name}
                    </h1>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {serviceDetails.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-semibold">
                          {serviceDetails.categoryName}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Pricing Type</p>
                        <p className="font-semibold">
                          {serviceDetails.pricingType}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Base Price/hour</p>
                        <p className="font-bold text-blue-600 text-xl">
                          ₹{serviceDetails.basePrice}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Caregiver Qualification
                        </p>
                        <div className="font-medium mt-2">
                          <div className="flex gap-3 flex-wrap">
                            {serviceDetails?.requiredQualification?.length >
                            0 ? (
                              serviceDetails.requiredQualification.map(
                                (opt, i) => (
                                  <div
                                    key={i}
                                    className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium"
                                  >
                                    {opt}
                                  </div>
                                ),
                              )
                            ) : (
                              <span>Not specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duration Options */}
                    <div className="mb-10">
                      <p className="text-sm text-gray-500 mb-4">
                        Select Duration
                      </p>

                      <div className="flex gap-4 flex-wrap">
                        {serviceDetails.durationOptions?.map((opt, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedDuration(opt);

                              setBookingData((prev) => ({
                                ...prev,
                                duration: {
                                  hours: opt.hours,
                                  price: opt.price,
                                },
                              }));
                            }}
                            className={`px-5 py-3 rounded-2xl border transition font-medium
          ${
            selectedDuration?.hours === opt.hours
              ? "bg-blue-600 text-white border-blue-600 shadow-lg"
              : "bg-gray-100 hover:bg-gray-200 border-gray-200"
          }
        `}
                          >
                            {opt.hours} Hours
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Price Display */}
                    {selectedDuration && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100"
                      >
                        <p className="text-sm text-gray-500 mb-1">
                          Selected Price
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          ₹{selectedDuration.price}
                        </p>
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: selectedDuration ? 1.03 : 1 }}
                      whileTap={{ scale: selectedDuration ? 0.95 : 1 }}
                      disabled={!selectedDuration}
                      onClick={() => {
                        if (!selectedDuration) return;

                        setShowBookingCard((prev) => !prev);

                        setBookingData((prev) => ({
                          ...prev,
                          categoryName: serviceDetails.categoryName,
                          serviceId: serviceDetails._id,
                        }));
                      }}
                      className={`w-full py-3 rounded-2xl text-lg font-semibold transition
    ${
      selectedDuration
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }
  `}
                    >
                      Send Booking Request
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BOOKING CARD */}
      <AnimatePresence>
        {showBookingCard && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative">
              {/* Close Button */}

              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => setShowBookingCard(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl cursor-pointer"
              >
                ✕
              </motion.button>

              <h2 className="text-xl font-bold mb-4">Book Service</h2>

              {userPatients?.length > 0 && (
                <h2 className="text-xl font-bold mb-4">Select Patient</h2>
              )}
              <div className="mb-4">
                {userPatients?.map((el) => {
                  const isSelected =
                    bookingData.patientId === (el.patientId || el._id);

                  return (
                    <button
                      key={el._id}
                      onClick={() =>
                        setBookingData((prev) => ({
                          ...prev,
                          patientId: el.patientId || el._id,
                        }))
                      }
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]"
            : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md"
        }
      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-lg">
                            {el.patientName}
                          </p>
                          <p
                            className={`text-sm ${
                              isSelected ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {el.relationship}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-sm font-medium">Category</label>
                {/* bookingData.categoryName */}
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="font-semibold text-blue-700">
                    {bookingData.categoryName}
                  </p>
                </div>
              </div>
              {/* duration */}
              <div className="mb-6">
                <label className="text-sm font-medium block mb-2">
                  Selected Duration
                </label>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="font-semibold text-blue-700">
                    {bookingData.duration.hours} Hours
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{bookingData.duration.price}
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-4">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={bookingData.schedule.startDate}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      schedule: {
                        ...bookingData.schedule,
                        startDate: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={bookingData.schedule.endDate}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      schedule: {
                        ...bookingData.schedule,
                        endDate: e.target.value,
                      },
                    })
                  }
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  value={bookingData.schedule.startTime || ""}
                  onChange={(e) => {
                    const startTime = e.target.value;

                    setBookingData((prev) => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule,
                        startTime,
                      },
                    }));
                  }}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="time"
                  value={bookingData.schedule.endTime || ""}
                  onChange={(e) => {
                    const endTime = e.target.value;

                    setBookingData((prev) => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule,
                        endTime,
                      },
                    }));
                  }}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              {!isValidTimeDuration() && (
                <p className="text-red-500 text-sm mt-2">
                  Time difference must be exactly {bookingData.duration.hours}{" "}
                  hours.
                </p>
              )}

              {/* Payment Method */}
              <div className="mb-6">
                <label className="text-sm font-medium">Payment Method</label>
                <select
                  value={bookingData.paymentMethod}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2 mt-1"
                >
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBookingCard(false)}
                  className="px-4 py-2 rounded-lg border cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleBooking()}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send Request To Nearby Agents
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ,
export default BrowseServices;
