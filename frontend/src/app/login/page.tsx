"use client";

import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";

import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

import { login } from "@/services/authService";
import { loginSchema } from "@/schemas/authSchema";
import PublicRoute from "@/components/PublicRoute";
import { login as loginAction } from "@/store/authSlice";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [showPassword, setShowPassword] =
    React.useState(false);

  const [isLoading, setIsLoading] =
    React.useState(false);

  const [emailError, setEmailError] =
    React.useState("");

  const [passwordError, setPasswordError] =
    React.useState("");

  const [loginError, setLoginError] =
    React.useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Prevent submitting while loading
    if (isLoading) {
      return;
    }

    const validationResult =
      loginSchema.safeParse({
        email,
        password,
      });

    if (!validationResult.success) {
      setEmailError("");
      setPasswordError("");

      validationResult.error.issues.forEach(
        (issue) => {
          if (issue.path[0] === "email") {
            setEmailError(issue.message);
          }

          if (issue.path[0] === "password") {
            setPasswordError(issue.message);
          }
        }
      );

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

      // console.log(
      //   "Login successful:",
      //   response
      // );

      dispatch(
        loginAction({
          token: response.token,
          refreshToken:
            response.refreshToken,
          username: response.username,
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
        setLoginError(
          "Too many login attempts. Please try again later."
        );

        return;
      }

      /*
       * 503 - Login service unavailable
       */
      if (status === 503) {
        setLoginError(
          "Login service is temporarily unavailable. Please try again shortly."
        );

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

  const isFormDisabled = isLoading;

  return (
    <PublicRoute>
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-5 py-7 sm:px-9 sm:py-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl">

            {/* Heading */}
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

              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#004C8C]">
                  Sign in
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access your account
                </p>
              </div>
            </div>

            {/* Login Error */}
            {loginError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm leading-5 text-red-600">
                  {loginError}
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
                      isFormDisabled
                        ? "text-slate-300"
                        : "text-slate-400 group-hover:text-[#d71920] group-focus-within:text-[#d71920]"
                    }`}
                  />

                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    disabled={isFormDisabled}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                      setLoginError("");
                    }}
                    className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 ${
                      emailError
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-300 hover:border-slate-400 hover:shadow-sm focus:border-[#d71920] focus:ring-2 focus:ring-red-100 focus:shadow-md"
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

                <div className="relative group">
                  <LockKeyhole
                    size={19}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                      isFormDisabled
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
                    disabled={isFormDisabled}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                      setLoginError("");
                    }}
                    className={`w-full rounded-lg border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 ${
                      passwordError
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-300 hover:border-slate-400 hover:shadow-sm focus:border-[#d71920] focus:ring-2 focus:ring-red-100 focus:shadow-md"
                    } ${
                      isFormDisabled
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : ""
                    }`}
                  />

                  <button
                    type="button"
                    disabled={isFormDisabled}
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-[#d71920] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
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

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/reset-password"
                  className={`group inline-flex items-center gap-1 text-sm font-medium transition-all duration-200 ${
                    isFormDisabled
                      ? "pointer-events-none text-slate-300"
                      : "text-[#d71920] hover:text-red-700"
                  }`}
                >
                  <span className="relative">
                    Forgot password?

                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#d71920] transition-all duration-300 group-hover:w-full" />
                  </span>

                  {!isFormDisabled && (
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  )}
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isFormDisabled}
                className={`group w-full rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 ${
                  isFormDisabled
                    ? "cursor-not-allowed bg-red-300"
                    : "bg-[#d71920] hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2 ">
                  {isLoading
                    ? "Signing in..."
                    : "Sign in"}

                  {!isLoading && (
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  )}
                </span>
              </button>
            </form>

            {/* Register */}
            <div className="mt-7 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?
              </p>

              <Link
                href="/register"
                className={`group inline-flex items-center gap-1 mt-2 text-sm font-semibold transition-all duration-200 ${
                  isFormDisabled
                    ? "pointer-events-none text-slate-300"
                    : "text-[#0b1f3a] hover:text-[#d71920]"
                }`}
              >
                Create an account

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