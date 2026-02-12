import axios from "axios";

// API_URL is relative to the domain now, handled by Middleware proxy
const API_URL = "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        // Redirect to login
        // Optional: clear any stale local state if needed
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
