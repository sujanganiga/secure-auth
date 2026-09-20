"use client";

import React from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const DashboardPage = () => {
    const [sidebarOpen, setSidebarOpen] =
        React.useState(false);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50">

                {/* Navbar */}
                <Navbar
                    onMenuClick={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                    isMenuOpen={sidebarOpen}
                />

                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() =>
                        setSidebarOpen(false)
                    }
                />

                {/* Dashboard Content */}
                <main className="px-6 py-10 sm:px-10 lg:px-12">

                    {/* Header */}
                    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">

                        {/* Decorative background */}
                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-50" />
                        <div className="absolute -bottom-20 right-24 h-32 w-32 rounded-full bg-slate-50" />

                        <div className="relative">

                            {/* Small status line */}
                            <div className="mb-4 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />

                                <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                    Compliance Overview
                                </span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-3xl font-bold tracking-tight text-[#d71920] sm:text-4xl lg:text-5xl">
                                Compliance{" "}
                                <span className="text-[#004C8C]">
                                    Dashboard
                                </span>
                            </h1>

                            {/* Sub Heading */}
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Monitor your compliance health,
                                review important updates, and
                                stay informed about your
                                organization&apos;s compliance status.
                            </p>

                            {/* Decorative line */}
                            <div className="mt-6 flex items-center gap-2">
                                <span className="h-1 w-12 rounded-full bg-[#d71920]" />
                                <span className="h-1 w-3 rounded-full bg-red-200" />
                                <span className="h-1 w-2 rounded-full bg-red-100" />
                            </div>

                        </div>
                    </section>

                </main>
            </div>
        </ProtectedRoute>
    );
};

export default DashboardPage;