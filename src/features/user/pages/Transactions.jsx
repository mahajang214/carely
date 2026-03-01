import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Calendar,
  IndianRupee,
  Eye,
  Loader2,
  CreditCard,
} from "lucide-react";
import { userAPI } from "../userAPI";
import { useToast } from "../../../components/ui/ToastProvider";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { showToast } = useToast();

  // Fetch My Transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getMyTransactions();
      // console.log("ALL TRANSACTIONS : ", res.data.data);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.log("ERROR : ", err.message);
      showToast("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOpenTransaction = async (id) => {
    setLoading(true);
    if (!id) {
      return showToast("Invalid");
    }
    try {
      const res = await userAPI.getTransaction(id);

      console.log("RESPONSE : ", res.data);
      if (res.data.success) {
        setSelectedTransaction(res.data.data); // THIS WAS MISSING
      }
    } catch (error) {
      console.log("ERROR : ", error.message);
      showToast("Unable to open transaction");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10 font-semibold">
        {error}
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
        <Receipt /> My Transactions
      </motion.h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="grid gap-4">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleOpenTransaction(tx._id)}
              className="bg-white shadow-sm rounded-2xl p-5 border hover:shadow-lg hover:scale-[1.01] transition cursor-pointer"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                {/* Left: Category */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {tx.bookingId?.bookingServiceCategory || "Service"}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Right: Price */}
                <div className="flex items-center gap-1 text-xl font-bold text-gray-900">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(tx.totalAmount)}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium
          ${
            tx.paymentStatus === "confirmed"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
                >
                  {tx.paymentStatus.toUpperCase()}
                </span>

                <Eye size={18} className="text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <CreditCard className="text-blue-600" />
              Transaction Summary
            </h3>

            {/* ===== TRANSACTION INFO ===== */}
            <div className="space-y-2 text-sm">
              <p>
                <strong>Transaction ID:</strong> {selectedTransaction._id}
              </p>

              <p>
                <strong>Total Amount:</strong>{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(selectedTransaction.totalAmount)}
              </p>

              <p>
                <strong>Payment Method:</strong>{" "}
                {selectedTransaction.paymentMethod}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="text-green-600 font-semibold">
                  {selectedTransaction.paymentStatus.toUpperCase()}
                </span>
              </p>

              <p>
                <strong>Paid At:</strong>{" "}
                {new Date(selectedTransaction.paidAt).toLocaleString()}
              </p>

              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedTransaction.createdAt).toLocaleString()}
              </p>
            </div>

            <hr className="my-4" />

            {/* ===== USER INFO ===== */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700">User Details</h4>

              <p>
                <strong>Name:</strong> {selectedTransaction.userId?.firstName}{" "}
                {selectedTransaction.userId?.lastName}
              </p>

              <p>
                <strong>Email:</strong> {selectedTransaction.userId?.email}
              </p>
            </div>

            <hr className="my-4" />

            {/* ===== CAREGIVER INFO ===== */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700">Caregiver Details</h4>

              <p>
                <strong>Name:</strong>{" "}
                {selectedTransaction.caregiverId?.firstName}{" "}
                {selectedTransaction.caregiverId?.lastName}
              </p>
            </div>

            <hr className="my-4" />

            {/* ===== BOOKING INFO ===== */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700">Booking Details</h4>

              <p>
                <strong>Booking ID:</strong>{" "}
                {selectedTransaction.bookingId?._id}
              </p>

              {selectedTransaction.bookingId?.serviceId && (
                <p>
                  <strong>Service ID:</strong>{" "}
                  {selectedTransaction.bookingId.serviceId}
                </p>
              )}
            </div>

            <hr className="my-4" />

            {/* ===== EARNINGS BREAKDOWN ===== */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700">
                Earnings Breakdown
              </h4>

              <p>
                <strong>Caregiver Earning:</strong>{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(selectedTransaction.caregiverEarning)}
              </p>

              <p>
                <strong>Platform Commission:</strong>{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(selectedTransaction.platformCommission)}
              </p>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Transactions;
