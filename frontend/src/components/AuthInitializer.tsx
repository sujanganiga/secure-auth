"use client";

import React from "react";
import { useDispatch } from "react-redux";

import {
    restoreAuth,
    initializeAuth,
    logout,
} from "@/store/authSlice";

import { checkAuth } from "@/services/authService";

export default function AuthInitializer() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        const initialize = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                dispatch(initializeAuth());
                return;
            }

            try {
                const response = await checkAuth(token);

                console.log("Auth check successful:", response);

                dispatch(
                    restoreAuth({
                        token,
                        username: response.username,
                    })
                );
            } catch (error) {
                console.error("Auth check failed:", error);

                dispatch(logout());
            } finally {
                dispatch(initializeAuth());
            }
        };

        initialize();
    }, [dispatch]);

    return null;
}