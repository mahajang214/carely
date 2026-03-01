import axiosInstance from "../../services/axiosInstance.js";


export const userAPI = {
    // SERVICES
    // filter services
    getFilteredServices: (params) =>
        axiosInstance.get("/api/user/services/filter", { params }),

    // BOOK SERVICE
    bookService: (payload) => axiosInstance.post(`/api/user/services/book`, payload),

    // MY BOOKINGS
    getMyBookedAcceptedServicesBooking: () => axiosInstance.get("/api/user/bookings/accepted/services"),
    getMyBookedPendingServicesBooking: () => axiosInstance.get("/api/user/bookings/pending/services"),
    getMyBookedCompletedServicesBooking: () => axiosInstance.get("/api/user/bookings/completed/services"),
    getMyBookedCancelledServicesBooking: () => axiosInstance.get("/api/user/bookings/cancelled/services"),
    getMyBookedInProgressServicesBooking: () => axiosInstance.get("/api/user/bookings/in-progress/services"),
    getMyAllBookings: () => axiosInstance.get("/api/user/bookings/all"),
    cancleBooking: (id) => axiosInstance.patch(`/api/user/bookings/${id}/cancel`),
    //  NOTIFICATIONS
    broadcastRequest: (id, params) => axiosInstance.get(`/api/user/notifications-request/${id}`, { params }),

    // PROFILE 
    getMyProfile: () => axiosInstance.get('/api/user/profile'),
    updateMyProfile: (payload) => axiosInstance.patch('/api/user/profile', payload),
    deleteMyProfile: () => axiosInstance.delete('/api/user/profile'),

    // MY LINKED PATIENTS
    getMyLinkedPatients: () => axiosInstance.get('/api/user/patients'),

    // TRANSACTIONS
    getMyTransactions: () => axiosInstance.get("/api/user/transaction/my"),
    createTransaction: (payload) => axiosInstance.post("/api/user/transaction/create", payload),
    getTransaction: (id) => axiosInstance.get(`/api/user/transaction/${id}`)

}