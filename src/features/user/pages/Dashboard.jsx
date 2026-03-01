import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { userAPI } from "../userAPI";

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  });

  const [linkedPatients, setLinkedPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        totalRes,
        acceptedRes,
        pendingRes,
        inProgressRes,
        completedRes,
        cancelledRes,
        profileRes,
      ] = await Promise.all([
        userAPI.getMyAllBookings(),
        userAPI.getMyBookedAcceptedServicesBooking(),
        userAPI.getMyBookedPendingServicesBooking(),
        userAPI.getMyBookedInProgressServicesBooking(),
        userAPI.getMyBookedCompletedServicesBooking(),
        userAPI.getMyBookedCancelledServicesBooking(),
        userAPI.getMyLinkedPatients(),
      ]);

      const activeCount =
        acceptedRes.data.data.length +
        pendingRes.data.data.length +
        inProgressRes.data.data.length;

      setStats({
        total: totalRes.data.data.length,
        active: activeCount,
        completed: completedRes.data.data.length,
        cancelled: cancelledRes.data.data.length,
      });

      setLinkedPatients(profileRes.data.data.linkedPatients || []);
      // console.log("DATA : ", profileRes.data.data.linkedPatients);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-gray-500 animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-gray-500">Here’s a quick summary of your activity</p>
      </div>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Bookings", value: stats.total, color: "bg-blue-500" },
          {
            title: "Active Bookings",
            value: stats.active,
            color: "bg-yellow-500",
          },
          { title: "Completed", value: stats.completed, color: "bg-green-500" },
          { title: "Cancelled", value: stats.cancelled, color: "bg-red-500" },
        ].map((card, index) => (
          <motion.div
            key={card.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl shadow-md p-6 bg-white cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-full ${card.color} mb-4`} />
            <h3 className="text-gray-500 text-sm">{card.title}</h3>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* 👥 Linked Patients */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Linked Patients ({linkedPatients.length})
        </h2>

        {linkedPatients.length === 0 ? (
          <p className="text-gray-500">No linked patients found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedPatients?.map((patient, index) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-xl p-4 hover:shadow-md transition "
              >
                <p className="font-medium">Name : {patient.patientName}</p>
                <p className="text-sm text-gray-500">
                  Relation : {patient.relationship}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
