import React, { useEffect, useState, lazy, Suspense } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { Activity, IndianRupee } from "lucide-react";


const AnalyticsCharts = lazy(
  () => import("../../../components/analytics/AnalyticsCharts"),
);

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

function Analytics() {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [platformRevenue, setPlatformRevenue] = useState({});
  const [mostActiveCities, setMostActiveCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [monthlyRes, platformRes, citiesRes, locationsRes] =
          await Promise.all([
            adminAPI.getMonthlyRevenue(),
            adminAPI.getPlatformRevenue(),
            adminAPI.getMostActiveCities(),
            adminAPI.getLocationWithCareGiversAndUsers(),
          ]);

        setMonthlyRevenue(monthlyRes.data?.data || []);
        setPlatformRevenue(platformRes.data?.data || {});
        setMostActiveCities(citiesRes.data?.data || []);
        setLocations(locationsRes.data?.data || []);
        // console.log("LOCATIONS : ", locationsRes.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Loading analytics...</div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="p-6 space-y-10"
    >
     

      {/* Platform Revenue Summary */}
      <motion.div
        className="grid grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white shadow rounded p-4 flex items-center gap-3">
          <IndianRupee className="text-green-500" />
          <div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="font-bold text-lg">
              {(platformRevenue.totalRevenue || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 flex items-center gap-3">
          <Activity className="text-blue-500" />
          <div>
            <div className="text-sm text-gray-500">Transactions</div>
            <div className="font-bold text-lg">
              {platformRevenue.totalTransactions || 0}
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 flex items-center gap-3">
          <IndianRupee className="text-yellow-500" />
          <div>
            <div className="text-sm text-gray-500">Gross Amount</div>
            <div className="font-bold text-lg">
              {(platformRevenue.grossAmount || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lazy Loaded Charts */}
      <Suspense
        fallback={
          <div className="bg-white shadow rounded p-6 text-center text-gray-500">
            Loading charts...
          </div>
        }
      >
        <AnalyticsCharts
          monthlyRevenue={monthlyRevenue}
          mostActiveCities={mostActiveCities}
        />
      </Suspense>

      {/* Locations Table */}
      <div className="bg-white shadow rounded p-6">
        <div className="text-lg font-semibold mb-4">City Overview</div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">City</th>
                <th className="border px-4 py-2 text-left">Number of Users</th>
                <th className="border px-4 py-2 text-left">
                  Number of Caregivers
                </th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{loc.city}</td>
                  <td className="border px-4 py-2">{loc.userCount}</td>
                  <td className="border px-4 py-2">{loc.caregiverCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default Analytics;
