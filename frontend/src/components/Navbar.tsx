// "use client";

// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter } from "next/navigation";
// import { Menu, User, LogOut, Settings, UserCircle } from "lucide-react";

// import { RootState } from "@/store/store";
// import { logout } from "@/store/authSlice";

// interface NavbarProps {
//     onMenuClick: () => void;
// }

// export default function Navbar({ onMenuClick }: NavbarProps) {
//     const [profileOpen, setProfileOpen] = React.useState(false);

//     const user = useSelector(
//         (state: RootState) => state.auth.user
//     );

//     const dispatch = useDispatch();
//     const router = useRouter();

//     const handleLogout = () => {
//         dispatch(logout());
//         router.replace("/login");
//     };

//     return (
//         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

//             {/* Left side */}
//             <div className="flex items-center gap-4">

//                 {/* Menu button */}
//                 <button
//                     type="button"
//                     onClick={onMenuClick}
//                     className="p-2 rounded-md hover:bg-gray-100"
//                     aria-label="Open menu"
//                 >
//                     <Menu
//                         size={24}
//                         className="text-gray-800"
//                     />
//                 </button>

//                 {/* HDFC Life */}
//                 <div>
//                     <span className="text-xl font-bold text-red-600">
//                         HDFC Life
//                     </span>
//                 </div>

//             </div>

//             {/* Right side */}
//             <div className="relative">

//                 {/* Profile button */}
//                 <button
//                     type="button"
//                     onClick={() =>
//                         setProfileOpen(!profileOpen)
//                     }
//                     className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100"
//                 >
//                     <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
//                         <User
//                             size={20}
//                             className="text-gray-700"
//                         />
//                     </div>

//                     <span className="text-sm font-medium text-gray-800">
//                         {user?.username || "User"}
//                     </span>
//                 </button>

//                 {/* Profile dropdown */}
//                 {profileOpen && (
//                     <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">

//                         {/* User information */}
//                         <div className="px-4 py-4 border-b border-gray-200">
//                             <div className="flex items-center gap-3">

//                                 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
//                                     <User
//                                         size={21}
//                                         className="text-gray-700"
//                                     />
//                                 </div>

//                                 <div className="min-w-0">
//                                     <p className="text-sm font-semibold text-gray-900">
//                                         {user?.username || "User"}
//                                     </p>

//                                     <p className="text-xs text-gray-500">
//                                         Logged in
//                                     </p>
//                                 </div>

//                             </div>
//                         </div>

//                         {/* Profile */}
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setProfileOpen(false);
//                                 router.push("/profile");
//                             }}
//                             className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                             <UserCircle size={18} />
//                             Profile
//                         </button>

//                         {/* Settings */}
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setProfileOpen(false);
//                                 router.push("/settings");
//                             }}
//                             className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                             <Settings size={18} />
//                             Settings
//                         </button>

//                         {/* Logout */}
//                         <button
//                             type="button"
//                             onClick={handleLogout}
//                             className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-200"
//                         >
//                             <LogOut size={18} />
//                             Logout
//                         </button>

//                     </div>
//                 )}

//             </div>

//         </header>
//     );
// }

"use client";

import React from "react";
import axios from "axios";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import {
    Menu,
    User,
    LogOut,
    Settings,
    UserCircle,
} from "lucide-react";

import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";

import { logoutApi } from "@/services/authService";

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({
    onMenuClick,
}: NavbarProps) {
    const [profileOpen, setProfileOpen] =
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

    const [isLoggingOut, setIsLoggingOut] =
        React.useState(false);

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

        if (currentToken && currentRefreshToken) {
            await logoutApi(
                currentToken,
                currentRefreshToken
            );

            console.log(
                "Backend logout successful"
            );
        }
    } catch (error: unknown) {
        // Logout should still complete on the frontend.
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

            {/* Left side */}
            <div className="flex items-center gap-4">

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="p-2 rounded-md hover:bg-gray-100"
                    aria-label="Open menu"
                >
                    <Menu
                        size={24}
                        className="text-gray-800"
                    />
                </button>

                <div>
                    <span className="text-xl font-bold text-red-600">
                        HDFC Life
                    </span>
                </div>

            </div>

            {/* Right side */}
            <div className="relative">

                {/* Profile button */}
                <button
                    type="button"
                    onClick={() =>
                        setProfileOpen(!profileOpen)
                    }
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 disabled:opacity-60"
                >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <User
                            size={20}
                            className="text-gray-700"
                        />
                    </div>

                    <span className="text-sm font-medium text-gray-800">
                        {user?.username || "User"}
                    </span>
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                    <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">

                        {/* User information */}
                        <div className="px-4 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User
                                        size={21}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user?.username || "User"}
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
                                setProfileOpen(false);
                                router.push("/profile");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <UserCircle size={18} />
                            Profile
                        </button>

                        {/* Settings */}
                        <button
                            type="button"
                            onClick={() => {
                                setProfileOpen(false);
                                router.push("/settings");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <Settings size={18} />
                            Settings
                        </button>

                        {/* Logout */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-200 disabled:opacity-60"
                        >
                            <LogOut size={18} />

                            {isLoggingOut
                                ? "Logging out..."
                                : "Logout"}
                        </button>

                    </div>
                )}

            </div>

        </header>
    );
}