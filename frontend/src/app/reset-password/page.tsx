"use client";

import React from "react";
import Link from "next/link";

import { Mail, ArrowLeft } from "lucide-react";

import { forgotPasswordSchema } from "@/schemas/authSchema";
import PublicRoute from "@/components/PublicRoute";

export default function ResetPasswordPage() {
    const [email, setEmail] = React.useState("");
    const [emailError, setEmailError] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [successMessage, setSuccessMessage] =
        React.useState("");
    const [resetError, setResetError] = React.useState("");

    const handleSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setEmailError("");
        setSuccessMessage("");
        setResetError("");

        const validationResult =
            forgotPasswordSchema.safeParse({
                email,
            });

        if (!validationResult.success) {
            validationResult.error.issues.forEach((issue) => {
                if (issue.path[0] === "email") {
                    setEmailError(issue.message);
                }
            });

            return;
        }

        try {
            setIsLoading(true);

            /*
             * Password reset API will be connected here.
             */

            console.log(
                "Password reset requested for:",
                email
            );

            setSuccessMessage(
                "If an account exists with this email, you will receive password reset instructions."
            );

        } catch (error) {
            console.error(
                "Password reset error:",
                error
            );

            setResetError(
                "Unable to process your request. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicRoute>
            <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

                <div className="w-full max-w-md">

                    {/* HDFC Life */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3">

                            <div className="w-11 h-11 rounded-lg bg-[#d71920] flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border-4 border-white" />
                            </div>

                            <h1 className="text-2xl font-bold text-[#0b1f3a]">
                                HDFC Life
                            </h1>

                        </div>
                    </div>

                    {/* Reset Password Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-7 py-8 sm:px-9">

                        {/* Heading */}
                        <div className="text-center mb-7">

                            <h2 className="text-2xl font-bold text-[#0b1f3a]">
                                Forgot password?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Enter your email address and we will
                                help you reset your password.
                            </p>

                        </div>

                        {/* Error */}
                        {resetError && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">
                                    {resetError}
                                </p>
                            </div>
                        )}

                        {/* Success */}
                        {successMessage && (
                            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                <p className="text-sm text-green-600">
                                    {successMessage}
                                </p>
                            </div>
                        )}

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
                                            setEmail(e.target.value);
                                            setEmailError("");
                                            setResetError("");
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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-lg bg-[#d71920] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-300"
                            >
                                {isLoading
                                    ? "Sending..."
                                    : "Send reset instructions"}
                            </button>

                        </form>

                        {/* Back to Login */}
                        <div className="mt-7 pt-6 border-t border-slate-200">

                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm font-semibold text-[#0b1f3a] hover:text-[#d71920]"
                            >
                                <ArrowLeft size={16} />
                                Back to sign in
                            </Link>

                        </div>

                    </div>

                </div>

            </main>
        </PublicRoute>
    );
}