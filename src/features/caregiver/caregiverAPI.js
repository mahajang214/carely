import axiosInstance from "../../services/axiosInstance";

export const caregiverAPI = {
    // Bookings
    acceptServiceRequest: (id) => axiosInstance.patch(`/api/caregiver/bookings/${id}/accept`),
    cancleBookingRequest: (id) => axiosInstance.patch(`/api/caregiver/bookings/${id}/cancle`),
    updateBookingRequest: (id, payload) => axiosInstance.patch(`/api/caregiver/bookings/${id}/status`, payload),
    allBookingRequest: () => axiosInstance.get(`/api/caregiver/bookings`),

    // Carenote
    addCareNote: (id, payload) => axiosInstance.post(`/api/caregiver/bookings/${id}/care-notes`, payload),

    // Profile
    getMyProfile: () => axiosInstance.get(`/api/caregiver/me`),
    updateMyProfile: (payload) => axiosInstance.patch(`/api/caregiver/me`, payload),
    updateAvailibility: (payload) => axiosInstance.patch(`/api/caregiver/availability`, payload),

    // Earnings
    getMyEarnings: () => axiosInstance.get(`/api/caregiver/earnings`),


}