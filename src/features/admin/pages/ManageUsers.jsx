import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { useToast } from "../../../components/ui/ToastProvider.jsx";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all or blocked

  const { showToast } = useToast();

  const fetchUsers = async (filterType = "all") => {
    setLoading(true);
    try {
      let res;
      switch (filterType) {
        case "blocked":
          res = await adminAPI.getAllBlockedUsers();
          break;
        default:
          res = await adminAPI.getAllUsers();
      }

      const mappedUsers = (res.data?.data || []).map((u) => ({
        ...u,
        _id: u._id?.$oid || u._id,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(filter);
  }, [filter]);

  const handleBlock = async (id) => {
    if (!id) return showToast("Invalid user ID");
    try {
      await adminAPI.blockUser(id);
      fetchUsers(filter);
      showToast("User blocked successfully");
    } catch (error) {
      console.error(error);
      showToast("Failed to block user");
    }
  };

  const handleUnblock = async (id) => {
    if (!id) return showToast("Invalid user ID");
    try {
      await adminAPI.unBlockUsers(id);
      fetchUsers(filter);
      showToast("User unblocked successfully");
    } catch (error) {
      console.error(error);
      showToast("Failed to unblock user");
    }
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
        {["all", "blocked"].map((f) => (
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
        <div className="text-gray-500 text-center">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-2">#</th>
                <th className="border px-2 py-2">Name</th>
                <th className="border px-2 py-2">Email</th>
                <th className="border px-2 py-2">Mobile</th>
                <th className="border px-2 py-2">Status</th>
                <th className="border px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u, index) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="border px-2 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-2 py-2">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="border px-2 py-2">{u.email}</td>
                    <td className="border px-2 py-2">
                      {u.mobileNumber || "-"}
                    </td>
                    <td className="border px-2 py-2 text-center">
                      {u.blocked ? "Blocked" : "Active"}
                    </td>
                    <td className="border px-2 py-2 flex justify-center gap-2">
                      {!u.blocked ? (
                        <button
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                          onClick={() => handleBlock(u._id)}
                        >
                          <Lock size={14} /> Block
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                          onClick={() => handleUnblock(u._id)}
                        >
                          <Unlock size={14} /> Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export default ManageUsers;
