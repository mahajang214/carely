import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import { LockIcon, Eye, UserCheck, UserX2, KeyRound } from "lucide-react";

function ManageCaregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openDocsId, setOpenDocsId] = useState(null);

  const { showToast } = useToast();

  const fetchCaregivers = async (filterType = "all") => {
    setLoading(true);
    try {
      let res;
      switch (filterType) {
        case "verified":
          res = await adminAPI.getAllVerifiedCaregivers();
          break;
        case "unverified":
          res = await adminAPI.getAllUnverifiedCaregivers();
          break;
        case "blocked":
          res = await adminAPI.getAllBlockedCaregivers();
          break;
        default:
          res = await adminAPI.getAllCaregivers();
      }

      const mappedCaregivers = (res.data?.data || []).map((c) => ({
        ...c,
        _id: c._id?.$oid || c._id,
      }));

      setCaregivers(mappedCaregivers);
    } catch (error) {
      console.error("Error fetching caregivers:", error);
      showToast("Error fetching caregivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregivers(filter);
  }, [filter]);

  const handleBlock = async (id) => {
    if (!id) return showToast("Invalid caregiver ID");
    try {
      await adminAPI.blockCaregiver(id, {});
      fetchCaregivers(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnblock = async (id) => {
    try {
      await adminAPI.unblockCaregiver(id, {});
      fetchCaregivers(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminAPI.verifyCaregiver(id, {});
      fetchCaregivers(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectCaregiverVerification(id, {});
      fetchCaregivers(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const viewVerificationDocuments = (id) => {
    setOpenDocsId(openDocsId === id ? null : id);
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
        Manage Caregivers
      </h1>

      {/* ===== Filters ===== */}
      <div className="flex flex-wrap gap-3">
        {["all", "verified", "unverified", "blocked"].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base transition ${
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
        <div className="text-center text-gray-500 py-10">
          Loading caregivers...
        </div>
      ) : caregivers.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No caregivers found
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Profile</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {caregivers.map((c, index) => (
                  <React.Fragment key={c._id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">{index + 1}</td>

                      <td className="px-4 py-3 text-center">
                        {c.profilePicture ? (
                          <img
                            src={c.profilePicture}
                            alt="profile"
                            className="w-10 h-10 rounded-full mx-auto"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {c.firstName} {c.lastName}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {c.mobileNumber || "-"}
                      </td>

                      <td className="px-4 py-3">{c.address?.city || "-"}</td>

                      <td className="px-4 py-3">{c.address?.state || "-"}</td>

                      <td className="px-4 py-3 text-center">
                        {c.ratings.average?.toFixed(1) || 0} (
                        {c.ratings.totalReviews || 0})
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            c.blocked
                              ? "bg-red-100 text-red-600"
                              : c.verified
                                ? "bg-green-100 text-green-600"
                                : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {c.blocked
                            ? "Blocked"
                            : c.verified
                              ? "Verified"
                              : "Unverified"}
                        </span>
                      </td>

                      <td className="px-4 py-3 flex flex-wrap gap-2 justify-center">
                        {!c.blocked ? (
                          <button
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                            onClick={() => handleBlock(c._id)}
                          >
                            <LockIcon size={14} /> Block
                          </button>
                        ) : (
                          <button
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                            onClick={() => handleUnblock(c._id)}
                          >
                            <KeyRound size={14} /> Unblock
                          </button>
                        )}

                        {!c.verified && !c.blocked && (
                          <>
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                              onClick={() => handleVerify(c._id)}
                            >
                              <UserCheck size={14} /> Verify
                            </button>

                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs"
                              onClick={() => handleReject(c._id)}
                            >
                              <UserX2 size={14} /> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="lg:hidden space-y-4">
            {caregivers.map((c, index) => (
              <div
                key={c._id}
                className="bg-white rounded-xl shadow border p-4 space-y-3"
              >
                {/* Top */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {c.profilePicture ? (
                      <img
                        src={c.profilePicture}
                        alt="profile"
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.address?.city || "-"}, {c.address?.state || "-"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      c.blocked
                        ? "bg-red-100 text-red-600"
                        : c.verified
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {c.blocked
                      ? "Blocked"
                      : c.verified
                        ? "Verified"
                        : "Pending"}
                  </span>
                </div>

                {/* Info */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Mobile: {c.mobileNumber || "-"}</p>
                  <p>
                      {c.ratings.average?.toFixed(1) || 0} (
                        {c.ratings.totalReviews || 0})
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {!c.blocked ? (
                    <button
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded text-sm"
                      onClick={() => handleBlock(c._id)}
                    >
                      <LockIcon size={14} /> Block
                    </button>
                  ) : (
                    <button
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded text-sm"
                      onClick={() => handleUnblock(c._id)}
                    >
                      <KeyRound size={14} /> Unblock
                    </button>
                  )}

                  {!c.verified && !c.blocked && (
                    <>
                      <button
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded text-sm"
                        onClick={() => handleVerify(c._id)}
                      >
                        <UserCheck size={14} /> Verify
                      </button>

                      <button
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 text-white rounded text-sm"
                        onClick={() => handleReject(c._id)}
                      >
                        <UserX2 size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default ManageCaregivers;
