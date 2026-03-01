import axiosInstance from "../../services/axiosInstance.js";


export const authAPI = {
    // LOGIN 
    // role!=patient 
    googleLogin: ({ token, role }) =>
        axiosInstance.post("/api/auth/google", { token, role }),
    // admin login
    adminLogin: ({ token, role }) => axiosInstance.post("/api/auth/google", { token, role }),
    // patient login
    patientLogin: ({ username, password }) =>
        axiosInstance.post("/api/auth/patient-login", { username, password }),
    // Patient
    forgotPassword: ({ username, password }) =>
        axiosInstance.post("/api/auth/forgot-password", { username, password }),
    // is patient username exists
    checkUsername: (username) =>
        axiosInstance.get(`/api/auth/check-username/${username}`),


    // REGISTER
    // user, family, caregiver registration
    register: (payload) =>
        axiosInstance.post("/api/auth/register", payload),
    // patient registration
    registerPatient: (payload) =>
        axiosInstance.post("/api/auth/register/patient", payload),
    // caregiver document upload 
    deleteDocuments: (publicIds) =>
        axiosInstance.post("/api/auth/delete-documents", { publicIds }),
    // OTP
    verifyOtp: ({ id, otp }) =>
        axiosInstance.post(`/api/auth/check/otp/${id}`, { otp }),
    // send otp for patient access
    sendOtp: ({ id, name, relationship }) =>
        axiosInstance.post(`/api/auth/send/otp`, { id, name, relationship }),
    // send otp for forgot password
    sendForgetOTP: ({ id, condition = "forgot-password", name }) =>
        axiosInstance.post("/api/auth/send/otp", { id, condition, name }),
    // search user for patient access
    searchUser: (data) =>
        axiosInstance.get(`/api/auth/search/${data}`),


    // LOGOUT
    logout: () => axiosInstance.post("/api/auth/logout")
};  
