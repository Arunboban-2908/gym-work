"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { createPatientForUser } from "@/actions/patient";
import { User, Shield, ArrowRight, Phone, Lock, Mail } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        // Validation
        if (!name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!email.trim() || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        const cleanPhone = phone.trim();
        if (!cleanPhone || cleanPhone.length < 7) {
            setError("Please enter a valid phone number (at least 7 digits).");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please verify and re-enter.");
            return;
        }

        setLoading(true);

        try {
            const { data: signUpData, error: signUpError } = await authClient.signUp.email({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            if (signUpError) {
                setError(signUpError.message ?? "Sign up failed. Please try again.");
                setLoading(false);
                return;
            }

            if (signUpData?.user?.id) {
                // Link patient with real phone and no fake clinical data
                await createPatientForUser(signUpData.user.id, name.trim(), email.trim(), cleanPhone);
            }

            // Route immediately to patient onboarding
            router.push("/onboarding");
        } catch {
            setError("Something went wrong during registration. Please try again.");
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                    <label htmlFor="auth-name" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Full Name
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-muted/70" />
                        <input
                            id="auth-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sarah Connor"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="auth-email" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-muted/70" />
                        <input
                            id="auth-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="auth-phone" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Phone Number
                    </label>
                    <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-muted/70" />
                        <input
                            id="auth-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="auth-password" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-muted/70" />
                        <input
                            id="auth-password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="auth-confirm-password" className="block text-xs font-medium text-adm-muted mb-1.5 uppercase tracking-wider">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-muted/70" />
                        <input
                            id="auth-confirm-password"
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-adm-bg/80 border border-adm-border text-adm-text placeholder-adm-muted/50 text-sm focus:outline-none focus:border-adm-accent focus:ring-1 focus:ring-adm-accent/40 transition-colors"
                        />
                    </div>
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
                            <span>Register & Start Health Onboarding</span>
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
