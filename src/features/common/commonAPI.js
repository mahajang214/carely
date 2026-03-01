import axiosInstance from "../../services/axiosInstance";

export const commonAPI = {
    // CATEGORIES
    getCategories: () =>
        axiosInstance.get("/api/common/categories/all"),

    // SERVICES
    getServices: (params) =>
        axiosInstance.get("/api/common/services/all", { params }),

    getServiceInfo: (id) =>
        axiosInstance.get(`/api/common/services/${id}`),

    // BOOKING
    getBookingDetails: (id) => axiosInstance.get(`/api/common/booking/${id}`),

    // NOTIFICATION
    // get user notifications
    getNotifications: () =>
        axiosInstance.get("/api/common/notifications"),
    // mark notification as read
    markNotificationAsRead: (id) =>
        axiosInstance.patch(`/api/common/notifications/${id}/read`),
    // delete notification
    deleteNotification: (id) =>
        axiosInstance.delete(`/api/common/notifications/${id}`),
    // unread notifications count
    getMyUnreadNotifications: () =>
        axiosInstance.get("/api/common/notifications/unread"),
    // get one notification
    getNotificationDetails: (id) =>
        axiosInstance.get(`/api/common/notifications/${id}`),

    // CARENOTES
    getAllCareNotes: (params) =>
        axiosInstance.get(`/api/common/carenotes`, params),
    getCareNote: (id, params) =>
        axiosInstance.get(`/api/common/carenotes/${id}`, params),
    addCareNote: (payload) =>
        axiosInstance.post(`/api/common/carenotes/add`, payload),

}