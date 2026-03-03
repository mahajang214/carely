import React, { useEffect, useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import { KeyRound, LockKeyholeIcon } from "lucide-react";

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
      className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ===== Header ===== */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        Manage Users
      </h1>

      {/* ===== Filters ===== */}
      <div className="flex flex-wrap gap-3">
        {["all", "blocked"].map((f) => (
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
        <div className="text-gray-500 text-center py-10">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-500 text-center py-10">No users found</div>
      ) : (
        <>
          {/* ===== Desktop Table ===== */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.mobileNumber || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.blocked
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {u.blocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex justify-center">
                      {!u.blocked ? (
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs"
                          onClick={() => handleBlock(u._id)}
                        >
                          <LockKeyholeIcon size={14} /> Block
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs"
                          onClick={() => handleUnblock(u._id)}
                        >
                          <KeyRound size={14} /> Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Mobile Cards ===== */}
          <div className="md:hidden space-y-4">
            {users.map((u, index) => (
              <div
                key={u._id}
                className="bg-white rounded-xl shadow border p-4 space-y-2"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {u.firstName} {u.lastName}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      u.blocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {u.blocked ? "Blocked" : "Active"}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Email: {u.email}</p>
                  <p>Mobile: {u.mobileNumber || "-"}</p>
                </div>

                <div>
                  {!u.blocked ? (
                    <button
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                      onClick={() => handleBlock(u._id)}
                    >
                      <LockKeyholeIcon size={14} /> Block User
                    </button>
                  ) : (
                    <button
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                      onClick={() => handleUnblock(u._id)}
                    >
                      <KeyRound size={14} /> Unblock User
                    </button>
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

export default ManageUsers;
