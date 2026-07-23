import axios from "axios";
import { AUTH_TOKEN_KEY } from "../features/auth/auth.constants";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
});

http.interceptors.request.use((config) => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== "/login") {
            sessionStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.assign("/login");
        }
        return Promise.reject(error);
    },
);

export default http;
