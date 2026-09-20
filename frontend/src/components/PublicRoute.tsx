"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { RootState } from "@/store/store";

export default function PublicRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const { isAuthenticated, isInitialized } = useSelector(
        (state: RootState) => state.auth
    );

    React.useEffect(() => {
        if (isInitialized && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isInitialized, isAuthenticated, router]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}