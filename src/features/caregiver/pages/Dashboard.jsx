import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { caregiverAPI } from "../caregiverAPI";
import { userAPI } from "../../user/userAPI";
import { commonAPI } from "../../common/commonAPI";
import { Loader2, User, Bell, CreditCard, Calendar, CheckCircle } from "lucide-react";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Profile
      const profileRes = await caregiverAPI.getMyProfile();
      if (profileRes.data.success) setProfile(profileRes.data.data);

      // Earnings
      const earningsRes = await caregiverAPI.getMyEarnings();
      if (earningsRes.data.success) setEarnings(earningsRes.data.data);

      // Bookings (last 5 recent)
      const bookingsRes = await caregiverAPI.allBookingRequest();
      if (bookingsRes.data.success)
        setBookings(bookingsRes.data.data.slice(0, 5));

      // Notifications (last 5)
      const notifRes = await commonAPI.getNotifications();
      if (notifRes.data.success)
        setNotifications(notifRes.data.data.slice(0, 5));

    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User size={32} /> Welcome, {profile?.firstName || "Caregiver"}
        </h1>
        <div className="relative">
          <Bell size={28} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-xl p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Earnings</span>
          <h2 className="text-2xl font-bold mt-2">
            ₹{earnings?.totalEarning.toLocaleString("en-IN")}
          </h2>
        </div>
        <div className="bg-white shadow rounded-xl p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Commission</span>
          <h2 className="text-2xl font-bold mt-2">
            ₹{earnings?.totalCommission.toLocaleString("en-IN")}
          </h2>
        </div>
        <div className="bg-white shadow rounded-xl p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Bookings</span>
          <h2 className="text-2xl font-bold mt-2">{earnings?.totalTransactions || 0}</h2>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar /> Recent Bookings
        </h3>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No recent bookings.</p>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <motion.div
                key={b._id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer flex justify-between items-center"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <h4 className="font-semibold">{b.bookingServiceCategory}</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    b.bookingStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : b.bookingStatus === "in-progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {b.bookingStatus.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell /> Recent Notifications
        </h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No new notifications.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className="bg-white shadow rounded-xl p-3 flex justify-between items-center"
              >
                <p className="text-sm text-gray-700">{n.message}</p>
                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;