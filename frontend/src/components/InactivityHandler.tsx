"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/store/authSlice";

const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutes
// const INACTIVITY_TIME = 10 * 1000; // 10 sec

export default function InactivityHandler() {
    const dispatch = useDispatch();
    const router = useRouter();

    React.useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(timer);

            timer = setTimeout(() => {
                console.log("User inactive. Logging out.");

                dispatch(logout());
                router.replace("/login");
            }, INACTIVITY_TIME);
        };

        const events = [
            "mousemove",
            "keydown",
            "click",
            "scroll",
        ];

        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            clearTimeout(timer);

            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [dispatch, router]);

    return null;
}