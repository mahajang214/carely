import React, { useEffect, useState } from "react";
import { userAPI } from "../userAPI";
import { Calendar, Clock, CheckCircle, XCircle, Users } from "lucide-react";

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
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-gray-500 animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Bookings",
      value: stats.total,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Bookings",
      value: stats.active,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="p-6 space-y-10 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-gray-500">Here’s a quick summary of your activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-in-stagger">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl shadow-sm p-6 bg-white card-hover"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="text-gray-500 text-sm">{card.title}</h3>

              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Linked Patients */}
      <div className="bg-white shadow-sm rounded-2xl p-6 fade-in">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          Linked Patients ({linkedPatients.length})
        </h2>

        {linkedPatients.length === 0 ? (
          <p className="text-gray-500">No linked patients found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-in-stagger">
            {linkedPatients.map((patient) => (
              <div
                key={patient._id}
                className="border rounded-xl p-4 card-hover bg-gray-50"
              >
                <p className="font-medium">Name: {patient.patientName}</p>
                <p className="text-sm text-gray-500">
                  Relation: {patient.relationship}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
