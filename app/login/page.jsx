"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Utensils } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setError(data.error || "Login failed.");
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Unable to connect. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30 mb-4">
                        <Utensils className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Napocor Street Bites</h1>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Admin Portal</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm dark:shadow-2xl">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sign in to your account</h2>
                        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Use your admin credentials to continue</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Enter username"
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="Enter password"
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl pl-10 pr-12 py-2.5 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-400 dark:text-slate-600 text-xs mt-6">
                    Napocor Street Bites © {new Date().getFullYear()}
                </p>
            </div>
        </main>
    );
}