import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, CircleX } from "lucide-react";
import { Button } from "../../../components/ui";
import Loader from "../../../components/common/Loader.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import { commonAPI } from "../../common/commonAPI.js";

function Notifications() {
  const [allMyNotifications, setAllMyNotifications] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    getAllNotifications();
  }, []);

  // ✅ Fetch all notifications
  const getAllNotifications = async () => {
    setLoading(true);
    try {
      const response = await commonAPI.getNotifications();

      // Your API structure:
      // response.data.data.data
      const notifications = response?.data?.data?.data || [];

      setAllMyNotifications(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      showToast("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark as read (Optimistic Update)
  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await commonAPI.markNotificationAsRead(notification._id);

      // update UI instantly
      setAllMyNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n,
        ),
      );

      setActiveNotification((prev) =>
        prev ? { ...prev, isRead: true } : prev,
      );

      showToast("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      showToast("Unable to mark as read");
    }
  };

  return (
    <div className="py-6 px-4 relative">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {/* Notification List */}
      {loading ? (
        <Loader className="w-full h-64 flex items-center justify-center" />
      ) : (
        <div className="space-y-4">
          {allMyNotifications.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              No notifications available
            </div>
          ) : (
            allMyNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 border rounded-xl cursor-pointer shadow-sm transition flex justify-between items-start
                  ${
                    notification.isRead
                      ? "bg-white"
                      : "bg-blue-50 border-blue-300"
                  }`}
                onClick={() => setActiveNotification(notification)}
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    {notification.title}
                  </h2>

                  <p className="text-gray-600 mt-1">{notification.message}</p>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {notification.isRead ? (
                  <CheckCheck className="text-blue-600" size={22} />
                ) : (
                  <Check size={22} />
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Full Screen Modal */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white w-full h-full p-10 overflow-y-auto"
            >
              {/* Top Actions */}
              <div className="flex justify-end gap-4 mb-6">
                {/* {!activeNotification.isRead  && (
                  <Button
                    onClick={() => handleMarkAsRead(activeNotification)}
                    className="flex items-center gap-2"
                  >
                    Mark as read
                    <Check size={18} />
                  </Button>
                )} */}

                <Button
                  variant="subDanger"
                  onClick={() => setActiveNotification(null)}
                  className="flex items-center gap-2"
                >
                  <CircleX size={18} />
                  Close
                </Button>
              </div>

              {/* Content */}
              <h2 className="text-3xl font-bold mb-6">
                {activeNotification.title}
              </h2>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {activeNotification.message}
              </p>

              <p className="text-sm text-gray-500">
                Created At:{" "}
                {new Date(activeNotification.createdAt).toLocaleString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;
