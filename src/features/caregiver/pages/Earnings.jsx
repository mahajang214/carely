import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Percent, Loader2 } from "lucide-react";
import { caregiverAPI } from "../caregiverAPI";

function Earnings() {
  const [earnings, setEarnings] = useState({
    totalEarning: 0,
    totalCommission: 0,
    totalTransactions: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await caregiverAPI.getMyEarnings();

      //   console.log("EARNINGS : ", res.data.data);
      if (res.data.success) {
        setEarnings(res.data.data);
      }
    } catch (error) {
      console.log("EARNINGS ERROR:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-72">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-6 flex items-center gap-2"
      >
        <Wallet className="text-green-600" />
        My Earnings
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md rounded-2xl p-6 border hover:shadow-xl transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-green-500" />
            <h3 className="text-gray-600 font-medium">Total Earnings</h3>
          </div>

          <p className="text-3xl font-bold text-green-600">
            {formatINR(earnings.totalEarning)}
          </p>
        </motion.div>

        {/* Platform Commission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white shadow-md rounded-2xl p-6 border hover:shadow-xl transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <Percent className="text-red-500" />
            <h3 className="text-gray-600 font-medium">Platform Commission</h3>
          </div>

          <p className="text-3xl font-bold text-red-500">
            {formatINR(earnings.totalCommission)}
          </p>
        </motion.div>

        {/* Total Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-md rounded-2xl p-6 border hover:shadow-xl transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="text-blue-500" />
            <h3 className="text-gray-600 font-medium">Total Transactions</h3>
          </div>

          <p className="text-3xl font-bold text-blue-600">
            {earnings.totalTransactions}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Earnings;
