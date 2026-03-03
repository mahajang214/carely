import React, { useEffect, useState, lazy, Suspense } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { Activity, IndianRupee } from "lucide-react";

const AnalyticsCharts = lazy(
  () => import("../../../components/analytics/AnalyticsCharts.jsx"),
);

function Analytics() {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [platformRevenue, setPlatformRevenue] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    grossAmount: 0,
  });
  const [mostActiveCities, setMostActiveCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminAPI.getCombineAPI();

        const data = response?.data?.data;

        if (data) {
          setMonthlyRevenue(data.monthlyRevenue || []);
          setPlatformRevenue(data.platformRevenue || {});
          setMostActiveCities(data.mostActiveCities || []);

          // ✅ Merge cityOverview (caregivers) with mostActiveCities (users)
          const caregiverCities = data.cityOverview || [];
          const userCities = data.mostActiveCities || [];

          const mergedCities = caregiverCities.map((careCity) => {
            const matchedUserCity = userCities.find(
              (userCity) => userCity._id === careCity._id,
            );

            return {
              city: careCity._id || "Unknown",
              caregiverCount: careCity.caregiverCount || 0,
              userCount: matchedUserCity?.userCount || 0,
            };
          });

          setLocations(mergedCities);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading analytics...</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 lg:space-y-10"
    >
      {/* ================= PLATFORM REVENUE CARDS ================= */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Total Revenue */}
        <div className="bg-white shadow-sm hover:shadow-md transition rounded-xl p-4 sm:p-5 flex items-center gap-4">
          <IndianRupee className="text-green-500 w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm text-gray-500">
              Total Revenue
            </div>
            <div className="font-bold text-lg sm:text-xl break-words">
              {(platformRevenue.totalRevenue || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white shadow-sm hover:shadow-md transition rounded-xl p-4 sm:p-5 flex items-center gap-4">
          <Activity className="text-blue-500 w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Transactions</div>
            <div className="font-bold text-lg sm:text-xl">
              {platformRevenue.totalTransactions || 0}
            </div>
          </div>
        </div>

        {/* Gross Amount */}
        <div className="bg-white shadow-sm hover:shadow-md transition rounded-xl p-4 sm:p-5 flex items-center gap-4">
          <IndianRupee className="text-yellow-500 w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm text-gray-500">Gross Amount</div>
            <div className="font-bold text-lg sm:text-xl break-words">
              {(platformRevenue.grossAmount || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= CHARTS ================= */}
      <Suspense
        fallback={
          <div className="bg-white shadow-sm rounded-xl p-6 text-center text-gray-500">
            Loading charts...
          </div>
        }
      >
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <AnalyticsCharts
            monthlyRevenue={monthlyRevenue}
            mostActiveCities={mostActiveCities}
          />
        </div>
      </Suspense>

      {/* ================= CITY OVERVIEW TABLE ================= */}
      <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6">
        <div className="text-base sm:text-lg font-semibold mb-4">
          City Overview
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm sm:text-base border-collapse">
            <thead>
              <tr className="bg-gray-100 text-xs sm:text-sm">
                <th className="px-4 py-3 text-left font-medium">City</th>
                <th className="px-4 py-3 text-left font-medium">Users</th>
                <th className="px-4 py-3 text-left font-medium">Caregivers</th>
              </tr>
            </thead>
            <tbody>
              {locations.length > 0 ? (
                locations.map((loc) => (
                  <tr
                    key={loc.city}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{loc.city}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {loc.userCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {loc.caregiverCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    No city data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default Analytics;
