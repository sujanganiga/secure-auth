"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
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

    const router = useRouter();

    const handleSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        // Clear previous messages
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setRegisterError("");
        setSuccessMessage("");

        // Zod validation
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

            // Backend expects username + password
            const response = await register(
                email,
                password
            );

            console.log(
                "Registration successful:",
                response
            );

            // Use backend response message
            setSuccessMessage(
                response?.message ||
                    "Registration successful."
            );

            // Redirect to login
            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (error: unknown) {
            console.error(
                "Registration error:",
                error
            );

            let message =
                "Registration failed. Please try again.";

            if (
                typeof error === "object" &&
                error !== null &&
                "response" in error
            ) {
                const response = (
                    error as {
                        response?: {
                            status?: number;
                            data?: {
                                message?: string;
                            };
                        };
                    }
                ).response;

                // Backend error message
                if (response?.data?.message) {
                    message =
                        response.data.message;
                }

                // Duplicate account
                if (response?.status === 409) {
                    message =
                        "An account with this email already exists.";
                }
            }

            setRegisterError(message);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicRoute>
            <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">

                <div className="w-full max-w-md">

                    {/* HDFC Life */}
                    {/* <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3">

                            <div className="w-11 h-11 rounded-lg bg-[#d71920] flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border-4 border-white" />
                            </div>

                            <h1 className="text-2xl font-bold text-[#0b1f3a]">
                                HDFC Life
                            </h1>

                        </div>
                    </div> */}

                    {/* Register Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-7 py-8 sm:px-9">

                        {/* Heading */}
                        <div className="text-center mb-7">

                            <h2 className="text-2xl font-bold text-[#0b1f3a]">
                                Create account
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Create your account to access the portal
                            </p>

                        </div>

                        {/* Backend error */}
                        {registerError && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">
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

                                <div className="relative">

                                    <Mail
                                        size={19}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(
                                                e.target.value
                                            );
                                            setEmailError("");
                                            setRegisterError("");
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition ${
                                            emailError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 focus:border-[#d71920] focus:ring-2 focus:ring-red-100"
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
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                                        onChange={(e) => {
                                            setPassword(
                                                e.target.value
                                            );
                                            setPasswordError("");
                                            setRegisterError("");
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition ${
                                            passwordError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 focus:border-[#d71920] focus:ring-2 focus:ring-red-100"
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
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

                                <div className="relative">

                                    <LockKeyhole
                                        size={19}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="confirmPassword"
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(
                                                e.target.value
                                            );
                                            setConfirmPasswordError("");
                                            setRegisterError("");
                                        }}
                                        className={`w-full rounded-lg border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition ${
                                            confirmPasswordError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 focus:border-[#d71920] focus:ring-2 focus:ring-red-100"
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>

                                </div>

                                {confirmPasswordError && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {confirmPasswordError}
                                    </p>
                                )}

                            </div>

                            {/* Create Account */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-lg bg-[#d71920] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-300"
                            >
                                {isLoading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>

                        </form>

                        {/* Login */}
                        <div className="mt-7 pt-6 border-t border-slate-200 text-center">

                            <p className="text-sm text-slate-500">
                                Already have an account?
                            </p>

                            <Link
                                href="/login"
                                className="inline-block mt-2 text-sm font-semibold text-[#0b1f3a] hover:text-[#d71920] hover:underline"
                            >
                                Sign in
                            </Link>

                        </div>

                    </div>

                </div>

            </main>
        </PublicRoute>
    );
}