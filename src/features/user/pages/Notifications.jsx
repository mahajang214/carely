import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui";
import Loader from "../../../components/common/Loader.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import { commonAPI } from "../../common/commonAPI.js";

import { CheckCheck, CheckCircle, XCircle, Bell } from "lucide-react";

function Notifications() {
  const [allMyNotifications, setAllMyNotifications] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    getAllNotifications();
  }, []);

  const getAllNotifications = async () => {
    setLoading(true);
    try {
      const response = await commonAPI.getNotifications();
      const notifications = response?.data?.data?.data || [];
      setAllMyNotifications(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      showToast("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await commonAPI.markNotificationAsRead(notification._id);

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
    <div className="py-8 px-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <Loader className="w-full h-64 flex items-center justify-center" />
      ) : allMyNotifications.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Bell className="mx-auto mb-4 w-10 h-10 text-gray-300" />
          No notifications available
        </div>
      ) : (
        <div className="space-y-4">
          {allMyNotifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => setActiveNotification(notification)}
              className={`p-5 rounded-2xl border cursor-pointer transition hover:shadow-md flex justify-between items-start
                ${
                  notification.isRead
                    ? "bg-white border-gray-200"
                    : "bg-blue-50 border-blue-300"
                }`}
            >
              <div>
                <h2 className="font-semibold text-lg">{notification.title}</h2>

                <p className="text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              {notification.isRead ? (
                <CheckCheck className="text-blue-600 w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {activeNotification && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => setActiveNotification(null)}
              className="absolute top-5 right-5 text-gray-500 hover:text-red-500 transition"
            >
              <XCircle size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {activeNotification.title}
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              {activeNotification.message}
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Created At:{" "}
              {new Date(activeNotification.createdAt).toLocaleString()}
            </p>

            {/* {!activeNotification.isRead && (
              <Button
                onClick={() => handleMarkAsRead(activeNotification)}
                className="flex items-center gap-2"
              >
                Mark as Read
                <CheckCircle size={18} />
              </Button>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
