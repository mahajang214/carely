import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import { LockKeyhole, EyeIcon, UnlockIcon } from "lucide-react";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openDetailsId, setOpenDetailsId] = useState(null);
  const [patientDetails, setPatientDetails] = useState({}); // store details by id

  const { showToast } = useToast();

  // Fetch list of patients
  const fetchPatients = async (filterType = "all") => {
    setLoading(true);
    try {
      let res;
      if (filterType === "blocked") {
        res = await adminAPI.getAllBlockedPatients();
      } else {
        res = await adminAPI.getAllPatients();
      }

      const mappedPatients = (res.data?.data || []).map((p) => ({
        ...p,
        _id: p._id?.$oid || p._id,
      }));
      setPatients(mappedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      showToast("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  // Fetch details of a single patient
  const fetchPatientDetails = async (id) => {
    if (!id || patientDetails[id]) return; // already fetched
    try {
      const res = await adminAPI.getPatientDetails(id);
      //   console.log("RESPOSNE : ", res.data);
      setPatientDetails((prev) => ({ ...prev, [id]: res.data?.data }));
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch patient details");
    }
  };

  useEffect(() => {
    fetchPatients(filter);
  }, [filter]);

  const handleBlock = async (id) => {
    if (!id) return showToast("Invalid patient ID");
    try {
      const res = await adminAPI.blockPatient(id);
      fetchPatients(filter);
      showToast("Patient blocked successfully");
    } catch (err) {
      console.log("ERROR : ", err.message);
      showToast("Failed to block patient");
    }
  };

  const handleUnblock = async (id) => {
    if (!id) return showToast("Invalid patient ID");
    try {
      await adminAPI.unblockPatient(id);
      fetchPatients(filter);
      showToast("Patient unblocked successfully");
    } catch {
      showToast("Failed to unblock patient");
    }
  };

  const toggleDetails = (id) => {
    if (openDetailsId === id) setOpenDetailsId(null);
    else {
      setOpenDetailsId(id);
      fetchPatientDetails(id);
    }
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "0";
    if (typeof value === "object" && value !== null)
      return JSON.stringify(value);
    return value || "-";
  };

  return (
    <motion.div
      className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ===== Header ===== */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        Manage Patients
      </h1>

      {/* ===== Filters ===== */}
      <div className="flex flex-wrap gap-3">
        {["all", "blocked"].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
              filter === f
                ? "bg-[#003A9E] text-white shadow"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== Content ===== */}
      {loading ? (
        <div className="text-gray-500 text-center py-10">
          Loading patients...
        </div>
      ) : patients.length === 0 ? (
        <div className="text-gray-500 text-center py-10">No patients found</div>
      ) : (
        <div className="space-y-4">
          {patients.map((p, index) => (
            <motion.div
              key={p._id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white shadow-sm rounded-xl border"
            >
              {/* ===== Card Header ===== */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-base sm:text-lg">
                    {index + 1}. {p.firstName} {p.lastName}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-1 rounded-full font-medium ${
                      p.blocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {p.blocked ? "Blocked" : "Active"}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2">
                  {!p.blocked ? (
                    <button
                      className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                      onClick={() => handleBlock(p._id)}
                    >
                      <LockKeyhole size={16} /> Block
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                      onClick={() => handleUnblock(p._id)}
                    >
                      <UnlockIcon size={16} /> Unblock
                    </button>
                  )}

                  <button
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm"
                    onClick={() => toggleDetails(p._id)}
                  >
                    <EyeIcon size={16} /> Details
                  </button>
                </div>
              </div>

              {/* ===== Expandable Details ===== */}
              <AnimatePresence>
                {openDetailsId === p._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t bg-gray-50 p-4 space-y-5"
                  >
                    {patientDetails[p._id] && (
                      <>
                        {/* Address */}
                        {patientDetails[p._id].address && (
                          <div>
                            <p className="font-semibold mb-1">Address</p>
                            <p className="text-gray-700 text-sm">
                              {patientDetails[p._id].address.fullAddress},{" "}
                              {patientDetails[p._id].address.city},{" "}
                              {patientDetails[p._id].address.state} -{" "}
                              {patientDetails[p._id].address.pincode}
                            </p>
                          </div>
                        )}

                        {/* Emergency Contacts */}
                        {patientDetails[p._id].emergencyContact &&
                        Object.keys(patientDetails[p._id].emergencyContact)
                          .length > 0 ? (
                          <div>
                            <p className="font-semibold mb-2">
                              Emergency Contacts
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(
                                patientDetails[p._id].emergencyContact,
                              ).map(([key, ec], idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs font-medium"
                                >
                                  {key.toUpperCase()} : {ec.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No emergency contacts
                          </p>
                        )}

                        {/* Other Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(patientDetails[p._id]).map(
                            ([key, value]) => {
                              if (
                                [
                                  "_id",
                                  "blocked",
                                  "profilePicture",
                                  "address",
                                  "emergencyContact",
                                  "_v",
                                  "__v",
                                ].includes(key)
                              )
                                return null;

                              return (
                                <div key={key}>
                                  <p className="font-semibold text-sm capitalize">
                                    {key}
                                  </p>
                                  <p className="text-gray-700 text-sm">
                                    {renderValue(value)}
                                  </p>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Patients;
