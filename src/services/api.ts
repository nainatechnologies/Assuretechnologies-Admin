import axios from "axios";
import { logoutUser } from "./auth";

export const BASE_URL = "http://localhost:5000";

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'X-Client-Type': 'admin' }
});

API.interceptors.request.use((config) => {
  return config;
});

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config.url?.includes("/auth/")
    ) {
      // Clear local storage user data and redirect to login
      logoutUser();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;



