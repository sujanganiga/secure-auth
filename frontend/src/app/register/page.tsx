"use client";

import React from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
    ArrowRight,
} from "lucide-react";

import { registerSchema } from "@/schemas/authSchema";
import { register } from "@/services/authService";
import PublicRoute from "@/components/PublicRoute";

export default function RegisterPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] =
        React.useState("");

    const [showPassword, setShowPassword] =
        React.useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        React.useState(false);

    const [isLoading, setIsLoading] =
        React.useState(false);

    const [emailError, setEmailError] =
        React.useState("");

    const [passwordError, setPasswordError] =
        React.useState("");

    const [confirmPasswordError, setConfirmPasswordError] =
        React.useState("");

    const [registerError, setRegisterError] =
        React.useState("");

    const [successMessage, setSuccessMessage] =
        React.useState("");

    const redirectTimerRef =
        React.useRef<ReturnType<typeof setTimeout> | null>(
            null
        );

    const router = useRouter();

    React.useEffect(() => {
        return () => {
            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
        };
    }, []);

    const handleSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        // Prevent duplicate registration requests
        if (isLoading) {
            return;
        }

        // Clear previous messages
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setRegisterError("");
        setSuccessMessage("");

        const validationResult =
            registerSchema.safeParse({
                email,
                password,
                confirmPassword,
            });

        if (!validationResult.success) {
            validationResult.error.issues.forEach(
                (issue) => {
                    if (issue.path[0] === "email") {
                        setEmailError(issue.message);
                    }

                    if (issue.path[0] === "password") {
                        setPasswordError(issue.message);
                    }

                    if (
                        issue.path[0] ===
                        "confirmPassword"
                    ) {
                        setConfirmPasswordError(
                            issue.message
                        );
                    }
                }
            );

            return;
        }

        try {
            setIsLoading(true);

            const response = await register(
                email,
                password
            );

            console.log(
                "Registration successful:",
                response
            );

            setSuccessMessage(
                response?.message ||
                    "Registration successful."
            );

            redirectTimerRef.current =
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
        } catch (error: unknown) {
            let message =
                "Registration failed. Please try again.";

            if (axios.isAxiosError(error)) {
                const status =
                    error.response?.status;

                const backendMessage =
                    error.response?.data?.message;

                /*
                 * 400 - Bad request
                 */
                if (status === 400) {
                    message =
                        backendMessage ||
                        "Please check the information you entered and try again.";
                }

                /*
                 * 401 - Unauthorized
                 */
                else if (status === 401) {
                    message =
                        backendMessage ||
                        "Registration could not be completed. Please try again.";
                }

                /*
                 * 409 - Username/email already exists
                 */
                else if (status === 409) {
                    message =
                        backendMessage ||
                        "An account with this email already exists.";
                }

                /*
                 * 429 - Too many requests
                 */
                else if (status === 429) {
                    message =
                        backendMessage ||
                        "Too many registration attempts. Please try again later.";
                }

                /*
                 * 500 - Internal server error
                 */
                else if (status === 500) {
                    message =
                        "Something went wrong on the server. Please try again later.";
                }

                /*
                 * 503 - Service unavailable
                 */
                else if (status === 503) {
                    message =
                        backendMessage ||
                        "Registration service is temporarily unavailable. Please try again shortly.";
                }

                /*
                 * No response - network/server unavailable
                 */
                else if (!error.response) {
                    message =
                        "Unable to connect to the registration service. Please check your connection and try again.";
                }

                /*
                 * Other HTTP errors
                 */
                else if (backendMessage) {
                    message = backendMessage;
                }
            } else {
                console.error(
                    "Unexpected registration error:",
                    error
                );
            }

            setRegisterError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicRoute>
            <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8 sm:py-10">
                <div className="w-full max-w-md">

                    {/* Register Card */}
                    <div
                        className={`bg-white rounded-2xl shadow-lg border border-slate-200 px-5 py-7 sm:px-9 sm:py-8 transition-all duration-300 ease-out ${
                            isLoading
                                ? "opacity-95"
                                : "hover:-translate-y-1 hover:shadow-2xl"
                        }`}
                    >

                        {/* HDFC Life Logo */}
                        <div className="mb-2">
                            <div className="flex justify-center mb-0">
                                <Image
                                    src="/images/HDFC_LOGO.jpeg"
                                    alt="HDFC Life"
                                    width={340}
                                    height={130}
                                    priority
                                    className="h-28 sm:h-32 w-auto object-contain transition-transform duration-300 hover:scale-105"
                                />
                            </div>

                            {/* Heading */}
                            <div className="text-center">
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#004C8C]">
                                    Create account
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    Create your account to access the portal
                                </p>
                            </div>
                        </div>

                        {/* Backend Error */}
                        {registerError && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm leading-5 text-red-600">
                                    {registerError}
                                </p>
                            </div>
                        )}

                        {/* Success */}
                        {successMessage && (
                            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                <p className="text-sm text-green-600">
                                    {successMessage}
                                </p>

                                <p className="text-xs text-green-600 mt-1">
                                    Redirecting to login...
                                </p>
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

                                <div className="relative group">
                                    <Mail
                                        size={19}
                                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                                            isLoading
                                                ? "text-slate-300"
                                                : "text-slate-400 group-hover:text-[#d71920] group-focus-within:text-[#d71920]"
                                        }`}
                                    />

                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        disabled={isLoading}
                                        onChange={(e) => {
                                            setEmail(
                                                e.target.value
                                            );
                                            setEmailError("");
                                            setRegisterError("");
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 ${
                                            emailError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 hover:border-slate-400 hover:shadow-sm focus:border-[#d71920] focus:ring-2 focus:ring-red-100 focus:shadow-md"
                                        } ${
                                            isLoading
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

                                <div className="relative group">
                                    <LockKeyhole
                                        size={19}
                                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                                            isLoading
                                                ? "text-slate-300"
                                                : "text-slate-400 group-hover:text-[#d71920] group-focus-within:text-[#d71920] group-focus-within:scale-110"
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
                                        disabled={isLoading}
                                        onChange={(e) => {
                                            setPassword(
                                                e.target.value
                                            );
                                            setPasswordError("");
                                            setRegisterError("");
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 ${
                                            passwordError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 hover:border-slate-400 hover:shadow-sm focus:border-[#d71920] focus:ring-2 focus:ring-red-100 focus:shadow-md"
                                        } ${
                                            isLoading
                                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                                : ""
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {passwordError && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Confirm password
                                </label>

                                <div className="relative group">
                                    <LockKeyhole
                                        size={19}
                                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                                            isLoading
                                                ? "text-slate-300"
                                                : "text-slate-400 group-hover:text-[#d71920] group-focus-within:text-[#d71920] group-focus-within:scale-110"
                                        }`}
                                    />

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="confirmPassword"
                                        placeholder="Re-enter your password"
                                        value={
                                            confirmPassword
                                        }
                                        disabled={isLoading}
                                        onChange={(e) => {
                                            setConfirmPassword(
                                                e.target.value
                                            );
                                            setConfirmPasswordError(
                                                ""
                                            );
                                            setRegisterError("");
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 ${
                                            confirmPasswordError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 hover:border-slate-400 hover:shadow-sm focus:border-[#d71920] focus:ring-2 focus:ring-red-100 focus:shadow-md"
                                        } ${
                                            isLoading
                                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                                : ""
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300"
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {confirmPasswordError && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {
                                            confirmPasswordError
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Create Account Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`group w-full rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 ${
                                    isLoading
                                        ? "cursor-not-allowed bg-red-300"
                                        : "bg-[#d71920] hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                                }`}
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    {isLoading
                                        ? "Creating account..."
                                        : "Create account"}

                                    {!isLoading && (
                                        <ArrowRight
                                            size={17}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Sign In */}
                        <div className="mt-7 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account?
                            </p>

                            <Link
                                href="/login"
                                className="group inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[#0b1f3a] transition-all duration-200 hover:text-[#d71920]"
                            >
                                Sign in

                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>

                    </div>
                </div>
            </main>
        </PublicRoute>
    );
}