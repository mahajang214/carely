import axios from "axios";

/* -------------------- BASE URL -------------------- */

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_LOCAL_URL,
    withCredentials: true,
});

/* -------------------- REQUEST INTERCEPTOR -------------------- */

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* -------------------- RESPONSE INTERCEPTOR -------------------- */

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Auto logout on unauthorized
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
