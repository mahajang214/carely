import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { useToast } from "../../../components/ui/ToastProvider";
import {
  MapPin,
  Users,
  Stethoscope,
  IndianRupee,
  Activity,
} from "lucide-react";

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
      <div className="flex items-center justify-center h-[70vh] text-gray-500 text-lg fade-in">
        Loading dashboard...
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 space-y-8">

    {/* ===== Header ===== */}
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
      Admin Dashboard
    </h1>

    {/* ===== Revenue Cards ===== */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

      {/* Total Revenue */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 sm:p-6 flex items-center justify-between border">
        <div>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 break-words">
            {(platformRevenue?.totalRevenue || 0).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </p>
        </div>
        <IndianRupee className="text-blue-500 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 p-2 rounded-xl" />
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 sm:p-6 flex items-center justify-between border">
        <div>
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">
            {platformRevenue?.totalTransactions || 0}
          </p>
        </div>
        <Activity className="text-indigo-500 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 p-2 rounded-xl" />
      </div>

      {/* Gross Amount */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 sm:p-6 flex items-center justify-between border">
        <div>
          <p className="text-sm text-gray-500">Gross Amount</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 break-words">
            {(platformRevenue?.grossAmount || 0).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </p>
        </div>
        <IndianRupee className="text-green-500 w-8 h-8 sm:w-10 sm:h-10 bg-green-100 p-2 rounded-xl" />
      </div>
    </div>

    {/* ===== Bottom Section ===== */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {/* Monthly Revenue */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 sm:p-6 border">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Monthly Revenue
        </h2>

        {monthlyRevenue.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No revenue data available
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {monthlyRevenue.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm sm:text-base"
              >
                <span className="text-gray-600">
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

      {/* Most Active Cities */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 sm:p-6 border">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Most Active Cities
        </h2>

        {cities.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No city data available
          </p>
        ) : (
          <div className="space-y-3">
            {cities.map((city, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm sm:text-base"
              >
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  {city._id || "Unknown"}
                </span>

                <span className="text-indigo-600 font-semibold">
                  {city.userCount || 0} Users
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location Overview */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 sm:p-6 border md:col-span-2 xl:col-span-1">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Location Overview
        </h2>

        {locationOverview.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No location data available
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {locationOverview.map((loc, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-50 p-3 rounded-lg text-sm sm:text-base"
              >
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  {loc.city || "Unknown"}
                </div>

                <div className="flex items-center gap-4 font-semibold">
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

    </div>
  </div>
);
}

export default Dashboard;
