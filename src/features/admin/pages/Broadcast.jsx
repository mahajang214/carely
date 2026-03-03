import React, { useState } from "react";
import { adminAPI } from "../adminAPI";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider";

function Broadcast() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "users",
    type: "general",
  });

  const [loading, setLoading] = useState(false);

  const notificationTypes = [
    "booking",
    "complaint",
    "payment",
    "service",
    "system",
    "emergency",
    "relationship_request",
    "relationship_response",
    "general",
    "event_notification",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = async () => {
    if (!form.title || !form.message) {
      showToast("Title and message are required");
      return;
    }

    setLoading(true);

    try {
      let res;

      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
      };

      if (form.audience === "users") {
        res = await adminAPI.broadcastUsers(payload);
      } else if (form.audience === "caregivers") {
        res = await adminAPI.broadcastCaregivers(payload);
      } else {
        res = await adminAPI.broadcast(payload);
      }

      showToast("Broadcast sent successfully");
      console.log("RESPONSE : ", res.data);
      setForm({
        title: "",
        message: "",
        audience: "users",
        type: "general",
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl p-5 sm:p-8 space-y-6 border">
        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          📢 Broadcast Notification
        </h2>

        {/* ================= Audience Selection ================= */}
        <div>
          <label
            htmlFor="audience"
            className="block text-sm font-semibold text-gray-600 mb-2"
          >
            Send To
          </label>

          <select
            id="audience"
            name="audience"
            value={form.audience}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="users">Users</option>
            <option value="caregivers">Caregivers</option>
          </select>
        </div>

        {/* ================= Notification Type ================= */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-semibold text-gray-600 mb-2"
          >
            Notification Type
          </label>

          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {notificationTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* ================= Title ================= */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter notification title"
            className="w-full border rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* ================= Message ================= */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            placeholder="Enter notification message"
            className="w-full border rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {/* ================= Send Button ================= */}
        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
          }`}
        >
          {loading ? "Sending..." : "Send Broadcast"}
        </button>
      </div>
    </motion.div>
  );
}

export default Broadcast;
