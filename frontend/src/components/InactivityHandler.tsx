"use client";

import React from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useRouter } from "next/navigation";

import { logout } from "@/store/authSlice";

import { RootState } from "@/store/store";

import { logoutApi } from "@/services/authService";

// const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutes
const INACTIVITY_TIME = 5 * 1000; // 5 seconds for testing

const WARNING_TIME = 5; // Last 5 seconds

export default function InactivityHandler() {
    const dispatch = useDispatch();

    const router = useRouter();

    const isAuthenticated = useSelector(
        (state: RootState) =>
            state.auth.isAuthenticated
    );

    const [showWarning, setShowWarning] =
        React.useState(false);

    const [secondsLeft, setSecondsLeft] =
        React.useState(WARNING_TIME);

    const inactivityTimerRef =
        React.useRef<
            ReturnType<typeof setTimeout> | null
        >(null);

    const countdownTimerRef =
        React.useRef<
            ReturnType<typeof setInterval> | null
        >(null);

    const isLoggingOut =
        React.useRef(false);

    React.useEffect(() => {
        const clearTimers = () => {
            if (inactivityTimerRef.current) {
                clearTimeout(
                    inactivityTimerRef.current
                );

                inactivityTimerRef.current = null;
            }

            if (countdownTimerRef.current) {
                clearInterval(
                    countdownTimerRef.current
                );

                countdownTimerRef.current = null;
            }
        };

        const logoutUser = async () => {
            /*
             * Prevent duplicate logout requests
             */
            if (isLoggingOut.current) {
                return;
            }

            isLoggingOut.current = true;

            console.log(
                "Session expired due to inactivity."
            );

            sessionStorage.setItem(
                "sessionExpiredMessage",
                "Session expired due to inactivity."
            );

            clearTimers();

            /*
             * Hide warning
             */
            setShowWarning(false);

            /*
             * Get latest tokens
             */
            const token =
                localStorage.getItem("token");

            const refreshToken =
                localStorage.getItem(
                    "refreshToken"
                );

            /*
             * Clear frontend authentication immediately
             */
            dispatch(logout());

            /*
             * Redirect immediately
             */
            router.replace("/login");

            /*
             * Try backend logout separately
             */
            if (
                token &&
                refreshToken
            ) {
                try {
                    await logoutApi(
                        token,
                        refreshToken
                    );

                    console.log(
                        "Backend logout successful"
                    );
                } catch (error: unknown) {
                    /*
                     * Backend logout failure should
                     * not prevent frontend logout.
                     */
                    console.log(
                        "Backend logout could not be completed."
                    );
                }
            }
        };

        const startWarning = () => {
            setShowWarning(true);

            setSecondsLeft(
                WARNING_TIME
            );

            let remainingSeconds =
                WARNING_TIME;

            countdownTimerRef.current =
                setInterval(() => {
                    /*
                     * Do not allow 0 to appear.
                     */
                    if (
                        remainingSeconds <= 1
                    ) {
                        clearTimers();

                        setShowWarning(false);

                        logoutUser();

                        return;
                    }

                    remainingSeconds -= 1;

                    setSecondsLeft(
                        remainingSeconds
                    );
                }, 1000);
        };

        const startInactivityTimer = () => {
            clearTimers();

            inactivityTimerRef.current =
                setTimeout(() => {
                    startWarning();
                }, INACTIVITY_TIME);
        };

        const handleUserActivity = () => {
            /*
             * Ignore activity while logout
             * is already happening.
             */
            if (isLoggingOut.current) {
                return;
            }

            /*
             * User became active again.
             */
            setShowWarning(false);

            setSecondsLeft(
                WARNING_TIME
            );

            startInactivityTimer();
        };

        /*
         * User is logged out.
         *
         * We do NOT call setState here because
         * React warns against synchronous state
         * updates directly inside an effect.
         *
         * shouldShowWarning already uses
         * isAuthenticated, so the popup disappears
         * automatically.
         */
        if (!isAuthenticated) {
            clearTimers();

            isLoggingOut.current = false;

            return () => {
                clearTimers();
            };
        }

        /*
         * New authenticated session.
         *
         * Reset the logout lock so inactivity
         * logout works again after second login.
         */
        isLoggingOut.current = false;

        const events = [
            "mousemove",
            "keydown",
            "click",
            "scroll",
            "touchstart",
        ];

        events.forEach((event) => {
            window.addEventListener(
                event,
                handleUserActivity
            );
        });

        /*
         * Start inactivity timer
         */
        startInactivityTimer();

        return () => {
            clearTimers();

            events.forEach((event) => {
                window.removeEventListener(
                    event,
                    handleUserActivity
                );
            });
        };
    }, [
        isAuthenticated,
        dispatch,
        router,
    ]);

    const shouldShowWarning =
        isAuthenticated &&
        showWarning;

    return (
        <>
            {shouldShowWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">

                        {/* Warning Icon */}
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-[#d71920]">
                            !
                        </div>

                        {/* Heading */}
                        <h2 className="text-xl font-semibold text-[#0b1f3a]">
                            Session Timeout
                        </h2>

                        {/* Message */}
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            You have been inactive
                            for a while. Your session
                            will expire in{" "}
                            <span className="font-semibold text-[#d71920]">
                                {secondsLeft}
                            </span>{" "}
                            seconds.
                        </p>

                        {/* Continue message */}
                        <p className="mt-3 text-xs text-slate-400">
                            Move the mouse, click, or
                            press a key to continue
                            your session.
                        </p>

                    </div>
                </div>
            )}
        </>
    );
}