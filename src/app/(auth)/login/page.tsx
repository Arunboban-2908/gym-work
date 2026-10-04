"use client";

import { useState, useEffect, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Shield, User, Key, Sparkles, Check, ArrowRight } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialPortal = searchParams.get("portal") === "admin" ? "admin" : "patient";

    const [portal, setPortal] = useState<"patient" | "admin">(initialPortal);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Sync portal if query param changes
    useEffect(() => {
        const p = searchParams.get("portal");
        if (p === "admin" || p === "patient") {
            setPortal(p);
        }
    }, [searchParams]);

    // When switching to admin, automatically pre-fill admin credentials
    useEffect(() => {
        if (portal === "admin") {
            setEmail("admin@neuropath.com");
            setPassword("admin123");
            setError("");
        } else {
            // Patient portal: clear credentials or keep empty
            if (email === "admin@neuropath.com") {
                setEmail("");
                setPassword("");
            }
            setError("");
        }
    }, [portal]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error: signInError } = await authClient.signIn.email({
                email,
                password,
            });
            if (signInError) {
                setError(signInError.message ?? "Invalid email or password.");
                setLoading(false);
                return;
            }

            // Check role to route properly
            const { data: sessionData } = await authClient.getSession();
            const userRole = sessionData?.user?.role;

            if (portal === "admin" || userRole === "admin") {
                router.push("/admin");
            } else {
                router.push("/user");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // 1-Click quick login helper
    async function handleQuickLogin(targetEmail: string, targetPass: string, targetRoute: string) {
        setEmail(targetEmail);
        setPassword(targetPass);
        setError("");
        setLoading(true);

        try {
            const { error: signInError } = await authClient.signIn.email({
                email: targetEmail,
                password: targetPass,
            });
            if (signInError) {
                setError(signInError.message ?? "Quick login failed.");
                setLoading(false);
                return;
            }
            router.push(targetRoute);
        } catch {
            setError("Quick login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="font-sora">
            {/* Portal Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-adm-bg/80 border border-adm-border rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => setPortal("patient")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        portal === "patient"
                            ? "bg-pat-navy text-white shadow-md shadow-pat-navy/30"
                            : "text-adm-muted hover:text-adm-text"
                    }`}
                >
                    <User size={14} />
                    <span>Patient Portal</span>
                </button>
                <button
                    type="button"
                    onClick={() => setPortal("admin")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        portal === "admin"
                            ? "bg-adm-accent text-white shadow-md shadow-adm-accent/30"
                            : "text-adm-muted hover:text-adm-text"
                    }`}
                >
                    <Shield size={14} />
                    <span>Admin & Doctor</span>
                </button>
            </div>

            {/* Portal Header */}
            {portal === "admin" ? (
                <div className="mb-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-10 font-bold bg-adm-accent/15 text-adm-accent border border-adm-accent/30 mb-2 uppercase tracking-wide">
                        <Shield size={12} /> Clinician Workspace
                    </div>
                    <h2 className="text-xl font-bold text-adm-text">Admin Sign In</h2>
                    <p className="text-xs text-adm-muted mt-1">
                        Use the dedicated Admin ID & Password to access clinical controls.
                    </p>

                    {/* Admin Credentials Helper Callout */}
                    <div className="mt-3 p-3 bg-adm-accent/10 border border-adm-accent/25 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-semibold text-adm-accent mb-1.5">
                            <span className="flex items-center gap-1">
                                <Key size={13} /> Preset Admin Credentials:
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail("admin@neuropath.com");
                                    setPassword("admin123");
                                }}
                                className="text-10 uppercase tracking-widest bg-adm-accent hover:brightness-110 text-white px-2 py-0.5 rounded cursor-pointer transition-colors font-mono font-bold"
                            >
                                Auto-Fill
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-11 font-mono text-adm-text">
                            <div className="bg-adm-bg/60 p-2 rounded-lg border border-adm-border/50">
                                <span className="text-9 text-adm-muted block font-sans">ADMIN ID:</span>
                                <span className="text-adm-accent font-bold break-all">admin@neuropath.com</span>
                            </div>
                            <div className="bg-adm-bg/60 p-2 rounded-lg border border-adm-border/50">
                                <span className="text-9 text-adm-muted block font-sans">PASSWORD:</span>
                                <span className="text-adm-accent font-bold">admin123</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-10 font-bold bg-pat-blue-soft text-pat-blue border border-pat-blue/20 mb-2 uppercase tracking-wide">
                        <User size={12} /> Patient Portal
                    </div>
                    <h2 className="text-xl font-bold text-adm-text">Patient Sign In</h2>
                    <p className="text-xs text-adm-muted mt-1">
                        Normal authentication for patients to access personalized recovery & exercises.
                    </p>

                    {/* Patient Credentials Helper Callout */}
                    <div className="mt-3 p-3 bg-pat-blue-soft/50 border border-pat-blue/20 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-semibold text-pat-blue mb-1.5">
                            <span className="flex items-center gap-1">
                                <Key size={13} /> Preset Patient Credentials:
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail("patient@neuropath.com");
                                    setPassword("patient123");
                                }}
                                className="text-10 uppercase tracking-widest bg-pat-navy hover:bg-[#152a45] text-white px-2 py-0.5 rounded cursor-pointer transition-colors font-mono font-bold"
                            >
                                Auto-Fill
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-11 font-mono text-adm-text">
                            <div className="bg-adm-bg/60 p-2 rounded-lg border border-adm-border/50">
                                <span className="text-9 text-adm-muted block font-sans">PATIENT EMAIL:</span>
                                <span className="text-pat-blue font-bold break-all">patient@neuropath.com</span>
                            </div>
                            <div className="bg-adm-bg/60 p-2 rounded-lg border border-adm-border/50">
                                <span className="text-9 text-adm-muted block font-sans">PASSWORD:</span>
                                <span className="text-pat-blue font-bold">patient123</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="auth-email" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        {portal === "admin" ? "Admin ID / Email" : "Email Address"}
                    </label>
                    <input
                        id="auth-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={portal === "admin" ? "admin@neuropath.com" : "you@example.com"}
                        className="w-full px-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="auth-password" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Password
                    </label>
                    <input
                        id="auth-password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                    />
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-adm-danger/10 border border-adm-danger/20 px-3.5 py-2.5 text-xs text-adm-danger">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                        portal === "admin"
                            ? "bg-adm-accent hover:brightness-110 shadow-adm-accent/25"
                            : "bg-pat-navy hover:bg-[#152a45] shadow-pat-navy/25"
                    }`}
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <>
                            <span>{portal === "admin" ? "Sign In to Admin Panel" : "Sign In to Patient Portal"}</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            {/* Quick Demo Access Button */}
            <div className="mt-4 pt-4 border-t border-adm-border/60">
                {portal === "admin" ? (
                    <button
                        type="button"
                        onClick={() => handleQuickLogin("admin@neuropath.com", "admin123", "/admin")}
                        disabled={loading}
                        className="w-full py-2.5 px-3 rounded-xl bg-adm-accent/10 border border-adm-accent/30 text-adm-accent hover:bg-adm-accent/20 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Sparkles size={14} />
                        <span>⚡ 1-Click Sign In as Admin</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => handleQuickLogin("patient@neuropath.com", "patient123", "/user")}
                        disabled={loading}
                        className="w-full py-2.5 px-3 rounded-xl bg-pat-blue-soft border border-pat-blue/20 text-pat-blue hover:bg-pat-blue/20 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Sparkles size={14} />
                        <span>⚡ 1-Click Patient Demo (James Mitchell)</span>
                    </button>
                )}
            </div>

            {/* Patient Sign Up Link */}
            {portal === "patient" && (
                <p className="text-center text-xs text-adm-muted mt-5">
                    Don&apos;t have a patient account?{" "}
                    <Link href="/signup" className="text-pat-blue font-bold hover:underline">
                        Register as Patient
                    </Link>
                </p>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-adm-muted text-sm font-sora">Loading portal...</div>}>
            <LoginForm />
        </Suspense>
    );
}
