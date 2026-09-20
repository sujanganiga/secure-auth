"use client";

import React from "react";
import { useDispatch } from "react-redux";

import {
    restoreAuth,
    initializeAuth,
    logout,
} from "@/store/authSlice";

import {
    checkAuth,
    refreshToken as refreshAccessToken,
} from "@/services/authService";

export default function AuthInitializer() {
    const dispatch = useDispatch();

    const initialized = React.useRef(false);

    React.useEffect(() => {
        // Prevent duplicate initialization in development
        if (initialized.current) {
            return;
        }

        initialized.current = true;

        const initialize = async () => {
            const token = localStorage.getItem("token");
            const refreshToken = localStorage.getItem("refreshToken");

            // No access token or refresh token
            if (!token || !refreshToken) {
                dispatch(logout());
                dispatch(initializeAuth());
                return;
            }

            try {
                // Check existing access token
                const response = await checkAuth(token);

                console.log(
                    "Auth check successful:",
                    response
                );

                dispatch(
                    restoreAuth({
                        token,
                        refreshToken,
                        username: response.username,
                    })
                );
            } catch (error: unknown) {
                const status =
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error
                        ? (
                              error as {
                                  response?: {
                                      status?: number;
                                  };
                              }
                          ).response?.status
                        : undefined;

                // Access token expired or invalid
                if (status === 401) {
                    console.log(
                        "Access token expired. Trying refresh token..."
                    );

                    try {
                        // Get a new access token
                        const response =
                            await refreshAccessToken(
                                refreshToken
                            );

                        console.log(
                            "Token refresh successful"
                        );

                        // Save new tokens
                        localStorage.setItem(
                            "token",
                            response.token
                        );

                        localStorage.setItem(
                            "refreshToken",
                            response.refreshToken
                        );

                        localStorage.setItem(
                            "username",
                            response.username
                        );

                        // Restore authentication with new tokens
                        dispatch(
                            restoreAuth({
                                token: response.token,
                                refreshToken:
                                    response.refreshToken,
                                username:
                                    response.username,
                            })
                        );
                    } catch (refreshError: unknown) {
                        console.log(
                            "Refresh token failed. Logging out..."
                        );

                        // Refresh token is also invalid/expired
                        dispatch(logout());
                    }
                } else {
                    // Other authentication errors
                    dispatch(logout());
                }
            } finally {
                dispatch(initializeAuth());
            }
        };

        initialize();
    }, [dispatch]);

    return null;
}