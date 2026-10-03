"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { createPatientForUser } from "@/actions/patient";
import { User, Shield, ArrowRight } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data: signUpData, error: signUpError } = await authClient.signUp.email({
                name,
                email,
                password,
            });
            if (signUpError) {
                setError(signUpError.message ?? "Sign up failed. Please try again.");
                setLoading(false);
                return;
            }

            if (signUpData?.user?.id) {
                await createPatientForUser(signUpData.user.id, name, email);
            }

            router.push("/user");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="font-sora">
            {/* Clinician link header */}
            <div className="mb-5 p-3 rounded-xl bg-adm-accent/10 border border-adm-accent/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-adm-muted">
                    <Shield size={14} className="text-adm-accent" />
                    <span>Hospital Staff or Doctor?</span>
                </div>
                <Link
                    href="/login?portal=admin"
                    className="text-11 font-bold text-adm-accent hover:underline flex items-center gap-1"
                >
                    <span>Admin Portal</span>
                    <ArrowRight size={11} />
                </Link>
            </div>

            <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-10 font-bold bg-pat-blue-soft text-pat-blue border border-pat-blue/20 mb-2 uppercase tracking-wide">
                    <User size={12} /> Patient Registration
                </div>
                <h2 className="text-xl font-bold text-adm-text">Create Patient Account</h2>
                <p className="text-xs text-adm-muted mt-1">
                    Sign up to begin your personalized neurological rehabilitation journey.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="auth-name" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Full Name
                    </label>
                    <input
                        id="auth-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full px-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="auth-email" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Email Address
                    </label>
                    <input
                        id="auth-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
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
                    className="w-full py-3 rounded-xl bg-pat-navy text-white font-semibold text-sm hover:bg-[#152a45] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pat-navy/25 mt-2"
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <>
                            <span>Register & Enter Portal</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-xs text-adm-muted mt-5">
                Already have an account?{" "}
                <Link href="/login?portal=patient" className="text-pat-blue font-bold hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
}
