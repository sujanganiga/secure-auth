"use client";

import React from "react";
import axios from "axios";
import Image from "next/image";
import {
    Menu,
    User,
    LogOut,
    Settings,
    UserCircle,
    Sun,
    Moon,
    ChevronDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { logoutApi } from "@/services/authService";

interface NavbarProps {
    onMenuClick: () => void;
    isMenuOpen: boolean;
}

export default function Navbar({
    onMenuClick,
    isMenuOpen,
}: NavbarProps) {
    const [profileOpen, setProfileOpen] =
        React.useState(false);

    const [darkMode, setDarkMode] =
        React.useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        React.useState(false);

    const user = useSelector(
        (state: RootState) => state.auth.user
    );

    const token = useSelector(
        (state: RootState) => state.auth.token
    );

    const refreshToken = useSelector(
        (state: RootState) => state.auth.refreshToken
    );

    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        try {
            setIsLoggingOut(true);

            const currentToken =
                token || localStorage.getItem("token");

            const currentRefreshToken =
                refreshToken ||
                localStorage.getItem("refreshToken");

            if (
                currentToken &&
                currentRefreshToken
            ) {
                await logoutApi(
                    currentToken,
                    currentRefreshToken
                );

                console.log(
                    "Backend logout successful"
                );
            }
        } catch (error: unknown) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 401
            ) {
                console.log(
                    "Backend session already expired. Completing logout."
                );
            } else {
                console.error(
                    "Unexpected logout error:",
                    error
                );
            }
        } finally {
            dispatch(logout());
            router.replace("/login");
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="relative z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">

            {/* Left Side */}
            <div className="flex items-center">

                {/* Menu Button */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:scale-105 active:scale-95"
                    aria-label={
                        isMenuOpen
                            ? "Close menu"
                            : "Open menu"
                    }
                >
                    <Menu size={24} />
                </button>

                {/* HDFC Logo - hidden when menu is open */}
                {!isMenuOpen && (
                    <div className="ml-3 flex items-center">
                        <Image
                            src="/images/HDFC_LOGO.jpeg"
                            alt="HDFC Life"
                            width={170}
                            height={100}
                            priority
                            className="h-12 sm:h-15.5 w-auto object-contain transition-transform duration-200 hover:scale-102"
                        />
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className="relative">

                {/* Profile Button */}
                <button
                    type="button"
                    onClick={() =>
                        setProfileOpen(
                            !profileOpen
                        )
                    }
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-200 hover:bg-gray-100 disabled:opacity-60"
                    aria-label="Open profile menu"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition-all duration-200 hover:bg-red-50">
                        <User
                            size={19}
                            className="text-gray-700"
                        />
                    </div>

                    <span className="hidden md:block max-w-32 truncate text-sm font-medium text-gray-800">
                        {user?.username || "User"}
                    </span>

                    <ChevronDown
                        size={16}
                        className={`hidden md:block text-gray-500 transition-transform duration-200 ${
                            profileOpen
                                ? "rotate-180"
                                : ""
                        }`}
                    />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                    <>
                        {/* Small click-away area */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() =>
                                setProfileOpen(false)
                            }
                        />

                        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                            {/* User Info */}
                            <div className="border-b border-gray-200 px-4 py-4">
                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                        <User
                                            size={20}
                                            className="text-gray-700"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {user?.username ||
                                                "User"}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Logged in
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* Profile */}
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen(
                                        false
                                    );
                                    router.push(
                                        "/profile"
                                    );
                                }}
                                className="group flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-red-50 hover:text-[#d71920]"
                            >
                                <UserCircle
                                    size={18}
                                    className="transition-colors group-hover:text-[#d71920]"
                                />
                                Profile
                            </button>

                            {/* Settings */}
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen(
                                        false
                                    );
                                    router.push(
                                        "/settings"
                                    );
                                }}
                                className="group flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-red-50 hover:text-[#d71920]"
                            >
                                <Settings
                                    size={18}
                                    className="transition-colors group-hover:text-[#d71920]"
                                />
                                Settings
                            </button>

                            {/* Theme */}
                            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">

                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    {darkMode ? (
                                        <Moon
                                            size={18}
                                            className="text-[#d71920]"
                                        />
                                    ) : (
                                        <Sun
                                            size={18}
                                            className="text-[#d71920]"
                                        />
                                    )}

                                    {darkMode
                                        ? "Dark mode"
                                        : "Light mode"}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDarkMode(
                                            !darkMode
                                        )
                                    }
                                    className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                                        darkMode
                                            ? "bg-[#d71920]"
                                            : "bg-gray-300"
                                    }`}
                                    aria-label="Toggle theme"
                                >
                                    <span
                                        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                            darkMode
                                                ? "translate-x-5"
                                                : "translate-x-0"
                                        }`}
                                    />
                                </button>

                            </div>

                            {/* Logout */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="group flex w-full items-center gap-3 border-t border-gray-200 px-4 py-3 text-sm text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:opacity-60"
                            >
                                <LogOut
                                    size={18}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />

                                {isLoggingOut
                                    ? "Logging out..."
                                    : "Logout"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}