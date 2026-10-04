'use client';

import React from 'react';
import { ShieldCheck, Target, Activity, Clock, Heart, Edit3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HealthBaselineCardProps {
    patient: any;
}

export function HealthBaselineCard({ patient }: HealthBaselineCardProps) {
    const profile = patient.healthProfile;
    const goals = patient.fitnessGoals || [];
    const conditions = patient.medicalConditions || [];
    const pains = patient.painLocations || [];
    const lifestyle = patient.lifestyle;

    if (!profile && goals.length === 0 && conditions.length === 0) {
        return null;
    }

    return (
        <div className="bg-pat-card border border-pat-border rounded-2xl p-5 mb-5 shadow-sm font-sora">
            <div className="flex items-center justify-between pb-3 border-b border-pat-border mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-pat-navy">Baseline Health Profile</h3>
                        <p className="text-11 text-pat-muted">Model 1 clinical intake metrics</p>
                    </div>
                </div>
                <Link
                    href="/onboarding"
                    className="text-11 text-pat-blue hover:underline flex items-center gap-1 font-semibold"
                >
                    <span>Update Intake</span>
                    <ArrowRight size={12} />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 text-pat-muted uppercase tracking-wider block font-semibold">Age</span>
                    <span className="text-base font-bold font-mono text-pat-navy">{profile?.age ?? '—'} yrs</span>
                </div>
                <div className="p-3 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 text-pat-muted uppercase tracking-wider block font-semibold">Height</span>
                    <span className="text-base font-bold font-mono text-pat-navy">
                        {profile?.height ? `${profile.height} ${profile.heightUnit}` : '—'}
                    </span>
                </div>
                <div className="p-3 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 text-pat-muted uppercase tracking-wider block font-semibold">Weight</span>
                    <span className="text-base font-bold font-mono text-pat-navy">
                        {profile?.weight ? `${profile.weight} ${profile.weightUnit}` : '—'}
                    </span>
                </div>
                <div className="p-3 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 text-pat-muted uppercase tracking-wider block font-semibold">Daily Rest</span>
                    <span className="text-base font-bold font-mono text-pat-navy">
                        {lifestyle?.sleepHours ? `${lifestyle.sleepHours}h sleep` : '—'}
                    </span>
                </div>
            </div>

            {/* Goals & Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Fitness Goals */}
                <div className="p-3.5 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 font-bold uppercase tracking-wider text-pat-navy flex items-center gap-1.5 mb-2">
                        <Target size={13} className="text-pat-blue" />
                        <span>Fitness & Rehab Goals</span>
                    </span>
                    {goals.length === 0 ? (
                        <span className="text-pat-muted italic text-11">None specified</span>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {goals.map((g: any) => (
                                <span
                                    key={g.id || g.goal}
                                    className="px-2.5 py-1 rounded-lg bg-pat-blue-soft border border-pat-blue/20 text-pat-blue text-11 font-medium"
                                >
                                    ✓ {g.goal}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Medical Conditions */}
                <div className="p-3.5 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 font-bold uppercase tracking-wider text-pat-navy flex items-center gap-1.5 mb-2">
                        <Heart size={13} className="text-emerald-600" />
                        <span>Self-Reported Conditions</span>
                    </span>
                    {conditions.length === 0 ? (
                        <span className="text-pat-muted italic text-11">None reported</span>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {conditions.map((c: any) => (
                                <span
                                    key={c.id || c.condition}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-11 font-medium"
                                >
                                    {c.condition}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Initial Pain Points */}
            {pains.length > 0 && (
                <div className="mt-3 p-3.5 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 font-bold uppercase tracking-wider text-pat-navy flex items-center gap-1.5 mb-2">
                        <Activity size={13} className="text-amber-600" />
                        <span>Baseline Pain Locations</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {pains.map((p: any) => (
                            <div key={p.id || p.bodyPart} className="p-2 rounded-lg bg-white border border-pat-border/80 flex items-center justify-between">
                                <span className="font-semibold text-pat-navy">{p.bodyPart}</span>
                                <span className="text-10 text-pat-muted">
                                    {p.painType} • <strong className="text-pat-navy">{p.severity}/10</strong>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
