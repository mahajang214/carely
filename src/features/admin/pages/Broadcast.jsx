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
      className="p-8 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border">
        <h2 className="text-2xl font-bold text-gray-800">
          📢 Broadcast Notification
        </h2>

        {/* Audience Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Send To
          </label>
          <select
            name="audience"
            value={form.audience}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="users">Users</option>
            <option value="caregivers">Caregivers</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Notification Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Notification Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
          >
            {notificationTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
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
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Message */}
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
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Sending..." : "Send Broadcast"}
        </button>
      </div>
    </motion.div>
  );
}

export default Broadcast;
