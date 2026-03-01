import axiosInstance from "../../services/axiosInstance"


export const adminAPI = {

    // BROADCAST 
    broadcastUsers: (payload) =>
        axiosInstance.post("/api/admin/broadcast/users", payload),
    broadcastCaregivers: (payload) =>
        axiosInstance.post("/api/admin/broadcast/caregivers", payload),
    broadcast: (payload) =>
        axiosInstance.post("/api/admin/broadcast/all", payload),

    // SERVICES
    createService: (payload) =>
        axiosInstance.post("/api/admin/services", payload),
    updateService: (id, payload) => axiosInstance.put(`/api/admin/services/${id}`, payload),
    deleteService: (id) => axiosInstance.delete(`/api/admin/services/${id}`),

    // BOOKINGS
    getAllBookings: () => axiosInstance.get("/api/admin/bookings"),
    getBookingDetails: (id) => axiosInstance.get(`/api/admin/bookings/${id}`),
    getAllPendingBookings: () => axiosInstance.get("/api/admin/bookings/pending"),
    getAllCompletedBookings: () => axiosInstance.get("/api/admin/bookings/completed"),
    getAllRejectedBookings: () => axiosInstance.get("/api/admin/bookings/rejected"),


    // ANALYTICS 
    getMonthlyRevenue: () => axiosInstance.get("/api/admin/analytics/monthly-revenue"),
    getMostActiveCities: () => axiosInstance.get("/api/admin/analytics/most-active-cities"),
    getLocationWithCareGiversAndUsers: () => axiosInstance.get("/api/admin/analytics/location-overview"),
    getPlatformRevenue: () => axiosInstance.get("/api/admin/analytics/platform-revenue"),

    // USERS
    // booking history: () => axiosInstance.get(`/api/admin/users`),
    getAllUsers: () => axiosInstance.get(`/api/admin/users`),
    getAllBlockedUsers: () => axiosInstance.get(`/api/admin/users/blocked`),
    blockUser: (id) => axiosInstance.patch(`/api/admin/users/${id}/block`),
    unBlockUsers: (id) => axiosInstance.patch(`/api/admin/users/${id}/unblock`),

    // PATIENTS
    getAllPatients: () => axiosInstance.get(`/api/admin/patients`),
    getPatientDetails: (id) => axiosInstance.get(`/api/admin/patient/${id}`),
    getAllBlockedPatients: () => axiosInstance.get(`/api/admin/patients/blocked`),
    blockPatient: (id) => axiosInstance.patch(`/api/admin/patients/${id}/block`),
    unblockPatient: (id) => axiosInstance.patch(`/api/admin/patients/${id}/unblock`),

    // CAREGIVERS  
    getAllCaregivers: () => axiosInstance.get("/api/admin/caregivers"),
    getAllBlockedCaregivers: () => axiosInstance.get("/api/admin/caregivers/blocked"),
    getAllVerifiedCaregivers: () => axiosInstance.get("/api/admin/caregivers/verified"),
    getAllUnverifiedCaregivers: () => axiosInstance.get("/api/admin/caregivers/unverified"),
    blockCaregiver: (id, params) => axiosInstance.patch(`/api/admin/caregivers/${id}/block`, params),
    unblockCaregiver: (id, params) => axiosInstance.patch(`/api/admin/caregivers/${id}/unblock`, params),
    verifyCaregiver: (id, params) => axiosInstance.patch(`/api/admin/caregivers/${id}/verify`, params),
    rejectCaregiverVerification: (id, params) => axiosInstance.patch(`/api/admin/caregivers/${id}/reject-verification`, params),
    getTopRatedCaregivers: () => axiosInstance.get("/api/admin/caregivers/top-rated"),
    getLowestRatedCaregivers: () => axiosInstance.get("/api/admin/caregivers/lowest-rated"),
}