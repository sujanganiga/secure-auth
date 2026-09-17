"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store/store";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const { isAuthenticated, isInitialized } = useSelector(
        (state: RootState) => state.auth
    );

    React.useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isInitialized, router]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}