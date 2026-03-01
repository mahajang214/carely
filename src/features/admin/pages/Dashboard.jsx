import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider";
import { MapPin, Stethoscope, Users } from "lucide-react";

function Dashboard() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [platformRevenue, setPlatformRevenue] = useState(null);
  const [cities, setCities] = useState([]);
  const [locationOverview, setLocationOverview] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [revenueRes, platformRes, citiesRes, locationRes] =
        await Promise.all([
          adminAPI.getMonthlyRevenue(),
          adminAPI.getPlatformRevenue(),
          adminAPI.getMostActiveCities(),
          adminAPI.getLocationWithCareGiversAndUsers(),
        ]);

      setMonthlyRevenue(revenueRes.data?.data || []);
      setPlatformRevenue(platformRes.data?.data || null);
      setCities(citiesRes.data?.data || []);
      setLocationOverview(locationRes.data?.data || []);
      // console.log("==== DASHBOARD API RESPONSE ====");
      // console.log("Monthly Revenue:", revenueRes.data?.data);
      // console.log("Platform Revenue:", platformRes.data?.data);
      // console.log("Most Active Cities:", citiesRes.data?.data);
      // console.log("Location Overview:", locationRes.data?.data);
      // console.log("================================");
    } catch (error) {
      console.error(error);
      showToast("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  return (
    <motion.div
      className="p-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold text-gray-800">📊 Admin Dashboard</h1>

      {/* ===== Revenue Summary Cards ===== */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-sm text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-600">
            {(platformRevenue?.totalRevenue || 0).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-sm text-gray-500">Total Transactions</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {platformRevenue?.totalTransactions || 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-sm text-gray-500">Total Gross Profit </h3>
          <p className="text-2xl font-bold text-green-600">
            {(platformRevenue?.grossAmount || 0).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </p>
        </div>
      </div>

      {/* ===== Monthly Revenue ===== */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>

        {monthlyRevenue.length === 0 ? (
          <p className="text-gray-500">No revenue data available</p>
        ) : (
          <div className="space-y-3">
            {monthlyRevenue.map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <span>
                  {item.month} {item.year}
                </span>
                <span className="font-semibold text-green-600">
                  ₹{item.totalRevenue}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Most Active Cities ===== */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Most Active Cities</h2>

        {cities.length === 0 ? (
          <p className="text-gray-500">No city data available</p>
        ) : (
          <div className="space-y-2">
            {cities.map((city, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <span className="font-medium text-gray-700">
                  {city._id || "Unknown City"}
                </span>

                <span className="font-semibold text-indigo-600">
                  {city.userCount || 0} Users
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Location Overview ===== */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Location Overview</h2>

        {locationOverview.length === 0 ? (
          <p className="text-gray-500">No location data available</p>
        ) : (
          <div className="space-y-2">
            {locationOverview.map((loc, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-3"
              >
                {/* City Name */}
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <MapPin size={16} className="text-gray-500" />
                  {loc.city || "Unknown"}
                </div>

                {/* Counts */}
                <div className="flex items-center gap-6 text-sm font-semibold">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Users size={16} />
                    {loc.userCount || 0}
                  </div>

                  <div className="flex items-center gap-1 text-purple-600">
                    <Stethoscope size={16} />
                    {loc.caregivers || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Dashboard;
