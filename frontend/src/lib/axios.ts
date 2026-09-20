// src/lib/axios.ts

import axios from "axios";

import { store } from "@/store/store";
import {
    logout,
    restoreAuth,
} from "@/store/authSlice";

const api = axios.create({
   // Replace with your backend API base URL
//   baseURL: "http://192.168.254.90:8080",
  baseURL: "http://localhost:8080",

  //  // Replace with your backend API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {
        const originalRequest = error.config;

        // No response from backend
        if (!error.response) {
            return Promise.reject(error);
        }

        // Do not try to refresh these requests
        if (
            originalRequest?.url === "/refresh" ||
            originalRequest?.url === "/login" ||
            originalRequest?.url === "/register" ||
            originalRequest?.url === "/logout"
        ) {
            return Promise.reject(error);
        }

        // Only handle 401
        if (
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken =
                store.getState().auth.refreshToken;

            if (!refreshToken) {
                store.dispatch(logout());

                return Promise.reject(error);
            }

            try {
                console.log(
                    "Access token expired. Refreshing token..."
                );

                const response = await api.post(
                    "/refresh",
                    {
                        refreshToken,
                    }
                );

                const newToken = response.data.token;
                const newRefreshToken =
                    response.data.refreshToken;
                const username =
                    response.data.username;

                console.log(
                    "Token refreshed successfully"
                );

                // Update Redux
                store.dispatch(
                    restoreAuth({
                        token: newToken,
                        refreshToken: newRefreshToken,
                        username,
                    })
                );

                // Update localStorage
                localStorage.setItem(
                    "token",
                    newToken
                );

                localStorage.setItem(
                    "refreshToken",
                    newRefreshToken
                );

                localStorage.setItem(
                    "username",
                    username
                );

                // Put new token on original request
                originalRequest.headers.Authorization =
                    `Bearer ${newToken}`;

                // Retry original API request
                return api(originalRequest);

            } catch (refreshError) {
                console.error(
                    "Refresh token failed:",
                    refreshError
                );

                store.dispatch(logout());

                return Promise.reject(
                    refreshError
                );
            }
        }

        return Promise.reject(error);
    }
);

export default api;