"use client";

import Link from "next/link";
import { X } from "lucide-react";

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
                    fixed top-16 left-0 z-50
                    h-[calc(100vh-4rem)]
                    w-64
                    bg-white
                    border-r border-gray-200
                    shadow-lg
                    transform
                    transition-transform
                    duration-300
                    ${
                        isOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Menu
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-gray-100"
                        aria-label="Close menu"
                    >
                        <X
                            size={22}
                            className="text-gray-700"
                        />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">

                    <Link
                        href="/dashboard"
                        onClick={onClose}
                        className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/policies"
                        onClick={onClose}
                        className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                        Policies
                    </Link>

                    <Link
                        href="/claims"
                        onClick={onClose}
                        className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                        Claims
                    </Link>

                    <Link
                        href="/reports"
                        onClick={onClose}
                        className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                        Reports
                    </Link>

                    <Link
                        href="/ai-insights"
                        onClick={onClose}
                        className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                        AI Insights
                    </Link>

                    <Link
                        href="/settings"
                        onClick={onClose}
                        className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                        Settings
                    </Link>

                </nav>
            </aside>
        </>
    );
}