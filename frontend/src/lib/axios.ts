// src/lib/axios.ts

import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.254.101:8080", // Replace with your backend API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;