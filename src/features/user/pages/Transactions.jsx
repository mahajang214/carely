import React, { useEffect, useState } from "react";
import { userAPI } from "../userAPI";
import { useToast } from "../../../components/ui/ToastProvider";
import { Loader2, IndianRupee, Eye, X, BadgeCheck } from "lucide-react";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getMyTransactions();

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
    if (!id) return showToast("Invalid transaction");

    try {
      setLoading(true);
      const res = await userAPI.getTransaction(id);

      if (res.data.success) {
        setSelectedTransaction(res.data.data);
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
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 fade-in relative w-full">
      <h1 className="text-2xl font-bold mb-6">My Transactions</h1>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="grid gap-5 fade-in-stagger transaction-list">
          {transactions.map((tx) => (
            <div
              key={tx._id}
              onClick={() => handleOpenTransaction(tx._id)}
              className="bg-white border rounded-2xl p-5 shadow-sm card-hover cursor-pointer"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {tx.bookingId?.bookingServiceCategory || "Service"}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xl font-bold text-gray-900">
                  <IndianRupee size={18} />
                  {new Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 0,
                  }).format(tx.totalAmount)}
                </div>
              </div>

              {/* Bottom */}
              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    tx.paymentStatus === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {tx.paymentStatus.toUpperCase()}
                </span>

                <Eye size={18} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {selectedTransaction && (
        <div className="fixed inset-0  z-50  fade-in">
          <div className="min-h-screen flex justify-center items-start px-4 py-10">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl fade-slide-up">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BadgeCheck className="text-blue-600" size={20} />
                  Transaction Summary
                </h3>

                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-500 hover:text-red-500 transition"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Transaction Info */}
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Transaction ID:</strong> {selectedTransaction._id}
                </p>

                <p>
                  <strong>Total Amount:</strong> ₹
                  {new Intl.NumberFormat("en-IN", {
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
              </div>

              <hr className="my-5" />

              {/* User Info */}
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-gray-700">User Details</h4>

                <p>
                  {selectedTransaction.userId?.firstName}{" "}
                  {selectedTransaction.userId?.lastName}
                </p>

                <p>{selectedTransaction.userId?.email}</p>
              </div>

              <hr className="my-5" />

              {/* Caregiver Info */}
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-gray-700">
                  Caregiver Details
                </h4>

                <p>
                  {selectedTransaction.caregiverId?.firstName}{" "}
                  {selectedTransaction.caregiverId?.lastName}
                </p>
              </div>

              <hr className="my-5" />

              {/* Earnings */}
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-gray-700">
                  Earnings Breakdown
                </h4>

                <p>
                  Caregiver Earning: ₹
                  {new Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 0,
                  }).format(selectedTransaction.caregiverEarning)}
                </p>

                <p>
                  Platform Commission: ₹
                  {new Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 0,
                  }).format(selectedTransaction.platformCommission)}
                </p>
              </div>

              <div className="mt-8 text-right">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-black transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
