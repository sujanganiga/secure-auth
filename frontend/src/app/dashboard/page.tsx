"use client";

import React from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

import { checkAuth } from "@/services/authService";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import { RootState } from "@/store/store";

import { useRouter } from "next/navigation";

const DashboardPage = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const token = useSelector(
        (state: RootState) => state.auth.token
    );

    const dispatch = useDispatch();
    const router = useRouter();

    const handleCheckAuth = async () => {
        if (!token) {
            console.error("No token found");
            return;
        }

        try {
            const response = await checkAuth(token);

            console.log("Auth response:", response);
        } catch (error: unknown) {
            const status =
                typeof error === "object" &&
                error !== null &&
                "response" in error
                    ? (error as {
                          response?: {
                              status?: number;
                          };
                      }).response?.status
                    : undefined;

            // 401 - Token invalid or expired
            if (status === 401) {
                console.error("Token is invalid or expired");

                dispatch(logout());
                router.replace("/login");

                return;
            }

            // 403 - No permission
            if (status === 403) {
                console.error(
                    "You do not have permission to access this resource"
                );

                return;
            }

            console.error("Auth check failed:", error);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">

                {/* Navbar */}
                <Navbar
                    onMenuClick={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                />

                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() =>
                        setSidebarOpen(false)
                    }
                />

                {/* Main content */}
                <main className="p-8">

                    {/* Dashboard heading */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Compliance Dashboard
                            </h1>

                            <p className="text-gray-600 mt-1">
                                Monitor your compliance health
                            </p>
                        </div>

                    </div>

                    {/* Temporary authentication button */}
                    <button
                        onClick={handleCheckAuth}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Check Authentication
                    </button>

                </main>
            </div>
        </ProtectedRoute>
    );
};

export default DashboardPage;