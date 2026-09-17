"use client";
import React from 'react';
import { login } from "@/services/authService";
import {useRouter} from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema } from "@/schemas/authSchema";

import { useDispatch } from "react-redux";
import { login as loginAction } from "@/store/authSlice";

export default function LoginPage() {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const dispatch = useDispatch();
    const router = useRouter();

    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [loginError, setLoginError] = React.useState('');

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();

            console.log("Email:", email);
            console.log("Password:", password);

            const validationResult = loginSchema.safeParse({
                email,
                password
            });

            if (!validationResult.success) {
                setEmailError('');
                setPasswordError('');

                validationResult.error.issues.forEach((issue) => {
                    if (issue.path[0] === 'email') {
                        setEmailError(issue.message);
                    }

                    if (issue.path[0] === 'password') {
                        setPasswordError(issue.message);
                    }
                });

                return;
            }

            setEmailError('');
            setPasswordError('');

            // setIsLoading(true);//it should be in the try block but for now it is here to show the loading state immediately
            try{
                setIsLoading(true);
                setLoginError('');
                const response = await login(email, password);
                console.log("Login successful:", response);
                console.log("Token received:", response.token);

                dispatch(
                    loginAction({
                        token: response.token,
                        username: response.username,
                    })
                );

                router.push("/dashboard");

                // localStorage.setItem('token', response.token);  
                // dispatch(loginAction(response.token));
               // dispatch(loginAction({ token: response.token, username: response.username }));

            }
            catch (error) {
                console.error("Login error:", error);
                setLoginError('Invalid email or password.');
            } finally {
                setIsLoading(false);
            }
    };


    return (

        <main className="min-h-screen bg-gray-100 flex items-center justify-center-safe">

            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

                <div className='text-center mb-6'>
                    <h1 className="text-3xl font-bold text-gray-900">Login</h1>
                </div>

            
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input 
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email} 
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setEmailError('');
                                }} 
                                className="mt-1 text-gray-900 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />

                            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input 
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={password} 
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setPasswordError('');
                                }} 
                                className="mt-1 text-gray-900 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div>
                        {/* <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 text-gray-900 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <div
                                className="absolute inset-y-0 top-1/3 right-0 pr-3 flex items-center cursor-pointer text-gray-900"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div> */}
                        

                        <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded">
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Forgot your password? <a href="/reset-password" className="text-blue-500 hover:underline">Reset it</a>
                            </p>
                        </div>
                </form>
            </div>

        </main>
    );
}