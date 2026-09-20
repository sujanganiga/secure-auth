"use client";

import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";

import {
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
} from "lucide-react";

import { login } from "@/services/authService";
import { loginSchema } from "@/schemas/authSchema";
import PublicRoute from "@/components/PublicRoute";
import { login as loginAction } from "@/store/authSlice";

type BlockReason =
    | "rateLimit"
    | "serviceUnavailable"
    | null;

export default function LoginPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [emailError, setEmailError] = React.useState("");
    const [passwordError, setPasswordError] = React.useState("");
    const [loginError, setLoginError] = React.useState("");

    const [blockReason, setBlockReason] =
        React.useState<BlockReason>(null);

    const [retrySeconds, setRetrySeconds] =
        React.useState(0);

    const dispatch = useDispatch();
    const router = useRouter();

    /*
     * Countdown timer
     */
    React.useEffect(() => {
        if (!blockReason || retrySeconds <= 0) {
            if (retrySeconds <= 0 && blockReason) {
                setBlockReason(null);
            }

            return;
        }

        const timer = setInterval(() => {
            setRetrySeconds((seconds) => {
                if (seconds <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return seconds - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [blockReason, retrySeconds]);

    const handleSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        // Prevent submitting while blocked or loading
        if (isLoading || blockReason) {
            return;
        }

        const validationResult = loginSchema.safeParse({
            email,
            password,
        });

        if (!validationResult.success) {
            setEmailError("");
            setPasswordError("");

            validationResult.error.issues.forEach((issue) => {
                if (issue.path[0] === "email") {
                    setEmailError(issue.message);
                }

                if (issue.path[0] === "password") {
                    setPasswordError(issue.message);
                }
            });

            return;
        }

        setEmailError("");
        setPasswordError("");
        setLoginError("");

        try {
            setIsLoading(true);

            const response = await login(
                email,
                password
            );

            console.log(
                "Login successful:",
                response
            );

            dispatch(
                loginAction({
                    token: response.token,
                    refreshToken:
                        response.refreshToken,
                    username:
                        response.username,
                })
            );

            router.push("/dashboard");
        } catch (error: unknown) {
            /*
             * Get HTTP status from Axios
             */
            const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;

            /*
             * 401 - Invalid credentials
             */
            if (status === 401) {
                setLoginError(
                    "Invalid email or password. Please check your credentials and try again."
                );

                return;
            }

            /*
             * 429 - Rate limit exceeded
             */
            if (status === 429) {
                let seconds = 30;

                if (axios.isAxiosError(error)) {
                    const retryAfter =
                        error.response?.headers?.[
                            "retry-after"
                        ];

                    if (retryAfter) {
                        const parsedSeconds =
                            Number(retryAfter);

                        if (
                            !Number.isNaN(
                                parsedSeconds
                            ) &&
                            parsedSeconds > 0
                        ) {
                            seconds =
                                Math.ceil(
                                    parsedSeconds
                                );
                        }
                    }
                }

                setLoginError(
                    "Too many login attempts. Please wait before trying again."
                );

                setBlockReason("rateLimit");
                setRetrySeconds(seconds);

                return;
            }

            /*
             * 503 - Circuit breaker / login service unavailable
             */
            if (status === 503) {
                setLoginError(
                    "Login service is temporarily unavailable. Please try again shortly."
                );

                setBlockReason(
                    "serviceUnavailable"
                );

                setRetrySeconds(10);

                return;
            }

            /*
             * Network error
             */
            if (
                axios.isAxiosError(error) &&
                !error.response
            ) {
                setLoginError(
                    "Unable to connect to the login service. Please check your connection and try again."
                );

                return;
            }

            /*
             * Other unexpected errors
             */
            setLoginError(
                "Something went wrong. Please try again later."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isFormDisabled =
        isLoading || blockReason !== null;

    return (
        <PublicRoute>
            <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8 sm:py-10">
                <div className="w-full max-w-md">

                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-5 py-7 sm:px-9 sm:py-8">

                        {/* Heading */}
                        <div className="text-center mb-7">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1f3a]">
                                Sign in
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Sign in to access your account
                            </p>
                        </div>

                        {/* Login Error */}
                        {loginError && (
                            <div
                                className={`mb-5 rounded-lg border px-4 py-3 ${
                                    blockReason
                                        ? "border-amber-200 bg-amber-50"
                                        : "border-red-200 bg-red-50"
                                }`}
                            >
                                <p
                                    className={`text-sm leading-5 ${
                                        blockReason
                                            ? "text-amber-700"
                                            : "text-red-600"
                                    }`}
                                >
                                    {loginError}
                                </p>

                                {/* Countdown */}
                                {blockReason &&
                                    retrySeconds >
                                        0 && (
                                        <div className="mt-2">
                                            <p className="text-xs font-medium text-slate-600">
                                                Try again in{" "}
                                                <span className="font-bold">
                                                    {
                                                        retrySeconds
                                                    }
                                                </span>
                                                s
                                            </p>
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={19}
                                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                                            isFormDisabled
                                                ? "text-slate-300"
                                                : "text-slate-400"
                                        }`}
                                    />

                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        disabled={
                                            isFormDisabled
                                        }
                                        onChange={(e) => {
                                            setEmail(
                                                e.target.value
                                            );
                                            setEmailError(
                                                ""
                                            );
                                            setLoginError(
                                                ""
                                            );
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition ${
                                            emailError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 focus:border-[#d71920] focus:ring-2 focus:ring-red-100"
                                        } ${
                                            isFormDisabled
                                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                                : ""
                                        }`}
                                    />
                                </div>

                                {emailError && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={19}
                                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                                            isFormDisabled
                                                ? "text-slate-300"
                                                : "text-slate-400"
                                        }`}
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        disabled={
                                            isFormDisabled
                                        }
                                        onChange={(e) => {
                                            setPassword(
                                                e.target.value
                                            );
                                            setPasswordError(
                                                ""
                                            );
                                            setLoginError(
                                                ""
                                            );
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition ${
                                            passwordError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 focus:border-[#d71920] focus:ring-2 focus:ring-red-100"
                                        } ${
                                            isFormDisabled
                                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                                : ""
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        disabled={
                                            isFormDisabled
                                        }
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-300"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                size={19}
                                            />
                                        ) : (
                                            <Eye
                                                size={19}
                                            />
                                        )}
                                    </button>
                                </div>

                                {passwordError && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {
                                            passwordError
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <Link
                                    href="/reset-password"
                                    className={`text-sm font-medium ${
                                        isFormDisabled
                                            ? "pointer-events-none text-slate-300"
                                            : "text-[#d71920] hover:text-red-700 hover:underline"
                                    }`}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isFormDisabled}
                                className={`w-full rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 ${
                                    isFormDisabled
                                        ? "cursor-not-allowed bg-red-300"
                                        : "bg-[#d71920] hover:bg-red-700"
                                }`}
                            >
                                {isLoading
                                    ? "Signing in..."
                                    : blockReason ===
                                      "rateLimit"
                                    ? `Try again in ${retrySeconds}s`
                                    : blockReason ===
                                      "serviceUnavailable"
                                    ? `Try again in ${retrySeconds}s`
                                    : "Sign in"}
                            </button>
                        </form>

                        {/* Register */}
                        <div className="mt-7 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-500">
                                Don&apos;t have an account?
                            </p>

                            <Link
                                href="/register"
                                className={`inline-block mt-2 text-sm font-semibold ${
                                    isFormDisabled
                                        ? "pointer-events-none text-slate-300"
                                        : "text-[#0b1f3a] hover:text-[#d71920] hover:underline"
                                }`}
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </PublicRoute>
    );
}