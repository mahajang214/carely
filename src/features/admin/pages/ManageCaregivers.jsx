import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { UserCheck, UserX, Lock, Unlock, Eye } from "lucide-react";
import { useToast } from "../../../components/ui/ToastProvider.jsx";

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
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        {["all", "verified", "unverified", "blocked"].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded ${
              filter === f ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-500 text-center">Loading caregivers...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-2">#</th>
                <th className="border px-2 py-2">Profile</th>
                <th className="border px-2 py-2">Name</th>
                <th className="border px-2 py-2">Mobile</th> 
                <th className="border px-2 py-2">City</th>
                <th className="border px-2 py-2">State</th>
                <th className="border px-2 py-2">Rating</th>
                <th className="border px-2 py-2">Status</th>
                <th className="border px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {caregivers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    No caregivers found
                  </td>
                </tr>
              ) : (
                caregivers.map((c, index) => (
                  <React.Fragment key={c._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="border px-2 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border px-2 py-2 text-center">
                        {c.profilePicture ? (
                          <img
                            src={c.profilePicture}
                            alt="profile"
                            className="w-10 h-10 rounded-full mx-auto"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full mx-auto"></div>
                        )}
                      </td>
                      <td className="border px-2 py-2 truncate max-w-xs">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="border px-2 py-2 text-center">
                        {c.mobileNumber || "-"}
                      </td>
                      {/* Show Mobile */}
                      <td className="border px-2 py-2 truncate max-w-xs">
                        {c.address?.city || "-"}
                      </td>
                      <td className="border px-2 py-2 truncate max-w-xs">
                        {c.address?.state || "-"}
                      </td>
                      <td className="border px-2 py-2 flex items-center gap-1 justify-center">
                        {c.ratingAverage?.toFixed(1) || 0} (
                        {c.totalReviews || 0})
                      </td>
                      <td className="border px-2 py-2 text-center">
                        {c.verified ? "Verified" : "Unverified"} /
                        {c.blocked ? "Blocked" : "Active"}
                      </td>
                      <td className="border px-2 py-2 flex flex-wrap justify-center gap-1">
                        {!c.blocked ? (
                          <button
                            className="flex items-center gap-1 px-2 py-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded"
                            onClick={() => handleBlock(c._id)}
                          >
                            <Lock size={14} /> Block
                          </button>
                        ) : (
                          <button
                            className="flex items-center gap-1 px-2 py-1 cursor-pointer bg-green-500 hover:bg-green-600 text-white rounded"
                            onClick={() => handleUnblock(c._id)}
                          >
                            <Unlock size={14} /> Unblock
                          </button>
                        )}

                        {!c.verified && (
                          <>
                            <button
                              className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded"
                              onClick={() => handleVerify(c._id)}
                            >
                              <UserCheck size={14} /> Verify
                            </button>
                            <button
                              className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded"
                              onClick={() => handleReject(c._id)}
                            >
                              <UserX size={14} /> Reject
                            </button>
                            <button
                              className="flex items-center gap-1 px-2 py-1 bg-indigo-500 text-white rounded"
                              onClick={() => viewVerificationDocuments(c._id)}
                            >
                              <Eye size={14} /> View Documents
                            </button>
                          </>
                        )}
                      </td>
                    </tr>

                    {/* Verification Documents Row */}
                    {openDocsId === c._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="p-4">
                          {c.verificationDocuments?.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {c.verificationDocuments.map((doc, i) => (
                                <li key={i}>
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                  >
                                    {doc.name || `Document ${i + 1}`}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-center">
                              No verification documents uploaded
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export default ManageCaregivers;
