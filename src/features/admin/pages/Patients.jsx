import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Eye } from "lucide-react";
import { useToast } from "../../../components/ui/ToastProvider.jsx";

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
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {["all", "blocked"].map((f) => (
          <button
            key={f}
            className={`px-5 py-2 rounded-md font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 text-center">Loading patients...</div>
      ) : (
        <div className="space-y-4">
          {patients.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              No patients found
            </div>
          ) : (
            patients.map((p, index) => (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white shadow rounded-lg border border-gray-200"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-4 cursor-pointer">
                  <div>
                    <p className="font-semibold text-lg">
                      {index + 1}. {p.firstName} {p.lastName}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        p.blocked ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {p.blocked ? "Blocked" : "Active"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!p.blocked ? (
                      <button
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                        onClick={() => {
                          console.log("_ID : ", p._id);
                          return handleBlock(p._id);
                        }}
                      >
                        <Lock size={16} /> Block
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                        onClick={() => handleUnblock(p._id)}
                      >
                        <Unlock size={16} /> Unblock
                      </button>
                    )}
                    <button
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
                      onClick={() => toggleDetails(p._id)}
                    >
                      <Eye size={16} /> Details
                    </button>
                  </div>
                </div>

                {/* Details */}
                <AnimatePresence>
                  {openDetailsId === p._id && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="border-t border-gray-200 p-4 bg-gray-50 space-y-4"
                    >
                      {patientDetails[p._id] && (
                        <>
                          {/* Address */}
                          {patientDetails[p._id].address && (
                            <div>
                              <p className="font-semibold">Address</p>
                              <p>
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
                              <p className="font-semibold">
                                Emergency Contacts
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(
                                  patientDetails[p._id].emergencyContact,
                                ).map(([key, ec], idx) => {
                                  //   console.log("EC : ", ec, "KEY : ", key);
                                  return (
                                    <span
                                      key={idx}
                                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium shadow-sm"
                                    >
                                      {key.toUpperCase()} : {ec.toUpperCase()}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <p>No emergency contacts</p>
                          )}

                          {/* Other Details */}
                          <div className="grid grid-cols-2 gap-4">
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
                                    <p className="font-semibold capitalize">
                                      {key}
                                    </p>
                                    <p className="text-gray-700">
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
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}

export default Patients;
