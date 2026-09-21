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

            const token =
                localStorage.getItem("token");

            const refreshToken =
                localStorage.getItem("refreshToken");

            // No tokens

            if (!token || !refreshToken) {

                dispatch(logout());

                dispatch(initializeAuth());

                return;
            }

            try {

                // Check current access token

                const response =
                    await checkAuth(token);

                console.log(
                    "Auth check successful:",
                    response
                );

                // Access token is valid

                dispatch(
                    restoreAuth({
                        token,
                        refreshToken,
                        username:
                            response.username,
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

                // Access token expired/invalid

                if (status === 401) {

                    console.log(
                        "Access token expired. Trying refresh token..."
                    );

                    try {

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

                        // Restore authentication

                        dispatch(
                            restoreAuth({
                                token:
                                    response.token,
                                refreshToken:
                                    response.refreshToken,
                                username:
                                    response.username,
                            })
                        );

                    } catch (refreshError: unknown) {

                        /*
                         * Refresh token is expired,
                         * invalid, or no longer exists.
                         */

                        const refreshStatus =
                            typeof refreshError ===
                                "object" &&
                            refreshError !== null &&
                            "response" in
                                refreshError
                                ? (
                                      refreshError as {
                                          response?: {
                                              status?: number;
                                          };
                                      }
                                  ).response?.status
                                : undefined;

                        if (
                            refreshStatus === 401
                        ) {

                            console.log(
                                "Session expired. Please login again."
                            );

                        } else {

                            console.log(
                                "Unable to restore session. Please login again."
                            );
                        }

                        // Clear authentication

                        dispatch(logout());
                    }

                } else {

                    // Other errors

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