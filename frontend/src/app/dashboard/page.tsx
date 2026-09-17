"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { checkAuth } from "@/services/authService";//why we need checkauth



const DashboardPage = () => {
    const handleCheckAuth = async () => {
        try {
            const response = await checkAuth();

            console.log("Auth response:", response);
        } catch (error) {
            console.error("Auth check failed:", error);
        }
    };
    return (
        <ProtectedRoute>
            <div>
                <h1>Dashboard</h1>
                <p>Welcome to your dashboard!</p>
                <LogoutButton />

                <button
                        onClick={handleCheckAuth}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4"
                    >
                        Check Authentication
                </button>
            </div>
        </ProtectedRoute>
    );
};

export default DashboardPage;
