"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft } from "lucide-react";

import PublicRoute from "@/components/PublicRoute";

export default function ResetPasswordPage() {
    const [email, setEmail] = React.useState("");

    return (
        <PublicRoute>
            <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8 sm:py-10">
                <div className="w-full max-w-md">

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-5 py-7 sm:px-9 sm:py-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl">

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
                                    Forgot password?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Enter your email address to reset your password.
                                </p>
                            </div>
                        </div>

                        {/* Feature Unavailable Message */}
                        {/* <div className="mt-6 mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-sm leading-5 text-amber-700">
                                Password reset is currently unavailable.
                                Please contact the administrator for assistance.
                            </p>
                        </div> */}

                        {/* Email Form */}
                        <form
                            onSubmit={(e) => e.preventDefault()}
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
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-200 group-focus-within:text-[#d71920]"
                                    />

                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 hover:border-slate-400 hover:shadow-sm focus:border-[#d71920] focus:ring-2 focus:ring-red-100 focus:shadow-md"
                                    />
                                </div>
                            </div>

                            {/* Disabled Reset Button */}
                            <button
                                type="submit"
                                disabled
                                className="w-full rounded-lg bg-red-300 py-3 text-sm font-semibold text-white shadow-sm cursor-not-allowed"
                            >
                                Reset password
                            </button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-7 pt-6 border-t border-slate-200">
                            <Link
                                href="/login"
                                className="group flex items-center justify-center gap-2 text-sm font-semibold text-[#0b1f3a] transition-all duration-200 hover:text-[#d71920]"
                            >
                                <ArrowLeft
                                    size={16}
                                    className="transition-transform duration-200 group-hover:-translate-x-1"
                                />

                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </PublicRoute>
    );
}