"use client";

import Link from "next/link";

import {
    X,
    LayoutDashboard,
    FileText,
    ClipboardList,
    BarChart3,
    Sparkles,
    Settings,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({
    isOpen,
    onClose,
}: SidebarProps) {
    return (
        <>
            {/* Background overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50
                    h-screen
                    w-72
                    bg-white
                    border-r border-gray-200
                    shadow-2xl
                    transform
                    transition-transform
                    duration-300
                    ease-in-out
                    ${
                        isOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200">
                    <div className="flex items-center">
                        <img
                            src="/images/HDFC_LOGO.jpeg"
                            alt="HDFC Life"
                            className="h-10 w-auto object-contain"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:scale-105 active:scale-95"
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">

                    {/* Dashboard - WORKING */}
                    <Link
                        href="/dashboard"
                        onClick={onClose}
                        className="group flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:translate-x-1"
                    >
                        <LayoutDashboard
                            size={20}
                            className="text-gray-500 transition-colors duration-200 group-hover:text-[#d71920]"
                        />

                        <span className="text-sm font-medium">
                            Dashboard
                        </span>
                    </Link>

                    {/* Policies - NOT IMPLEMENTED */}
                    <button
                        type="button"
                        title="Coming soon"
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 text-left transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:translate-x-1"
                    >
                        <FileText
                            size={20}
                            className="text-gray-500 transition-colors duration-200 group-hover:text-[#d71920]"
                        />

                        <span className="text-sm font-medium">
                            Policies
                        </span>
                    </button>

                    {/* Claims - NOT IMPLEMENTED */}
                    <button
                        type="button"
                        title="Coming soon"
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 text-left transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:translate-x-1"
                    >
                        <ClipboardList
                            size={20}
                            className="text-gray-500 transition-colors duration-200 group-hover:text-[#d71920]"
                        />

                        <span className="text-sm font-medium">
                            Claims
                        </span>
                    </button>

                    {/* Reports - NOT IMPLEMENTED */}
                    <button
                        type="button"
                        title="Coming soon"
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 text-left transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:translate-x-1"
                    >
                        <BarChart3
                            size={20}
                            className="text-gray-500 transition-colors duration-200 group-hover:text-[#d71920]"
                        />

                        <span className="text-sm font-medium">
                            Reports
                        </span>
                    </button>

                    {/* AI Insights - NOT IMPLEMENTED */}
                    <button
                        type="button"
                        title="Coming soon"
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 text-left transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:translate-x-1"
                    >
                        <Sparkles
                            size={20}
                            className="text-gray-500 transition-colors duration-200 group-hover:text-[#d71920]"
                        />

                        <span className="text-sm font-medium">
                            AI Insights
                        </span>
                    </button>

                    {/* Settings - NOT IMPLEMENTED */}
                    <button
                        type="button"
                        title="Coming soon"
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 text-left transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:translate-x-1"
                    >
                        <Settings
                            size={20}
                            className="text-gray-500 transition-colors duration-200 group-hover:text-[#d71920]"
                        />

                        <span className="text-sm font-medium">
                            Settings
                        </span>
                    </button>

                </nav>
            </aside>
        </>
    );
}