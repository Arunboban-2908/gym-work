import React from 'react';

interface PatientHeaderProps {
    patient: any;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
    const hour = new Date().getHours();
    let greeting = 'Good Evening 🌙';
    if (hour < 12) greeting = 'Good Morning ☀️';
    else if (hour < 18) greeting = 'Good Afternoon 🌤️';

    const week = patient.isVerified && patient.verifiedAt 
        ? Math.max(1, Math.floor((new Date().getTime() - new Date(patient.verifiedAt).getTime()) / (7 * 24 * 3600 * 1000)) + 1) 
        : '--';

    const recoveryPct = patient.assessments?.[0]?.recoveryPct || 0;
    return (
        <div className="bg-gradient-to-br from-pat-navy via-[#1e4a7a] to-[#0d3a6e] px-5.5 pt-5 pb-7 relative overflow-hidden shrink-0 lg:sticky lg:top-0 lg:z-50 shadow-md">
            <div className="absolute -top-15 -right-10 w-50 h-50 rounded-full bg-blue-600/20" />
            <div className="absolute -bottom-30px left-15 w-30 h-30 rounded-full bg-teal-600/15" />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="text-11 text-white/55 font-medium tracking-wide border border-transparent uppercase mb-1">{greeting}</div>
                    <div className="text-22 font-extrabold text-white tracking-tight mb-0.5">{patient.firstName} {patient.lastName}</div>
                    <div className="text-12 text-white/60 mb-2.5">{patient.injuryLevel} · {patient.ais} · Week {week}</div>

                    <div className="inline-flex items-center gap-1.5 mt-1 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full backdrop-blur-md">
                        <div className="w-5px h-5px bg-green-400 rounded-full" />
                        <div className="text-11 text-white/85 font-medium">Active Rehabilitation</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="relative w-16 h-16 transform -rotate-90 origin-center mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="26" fill="none" className="stroke-slate-200/20" strokeWidth="6" />
                            <circle cx="32" cy="32" r="26" fill="none" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" strokeDasharray="163" strokeDashoffset={163 - (163 * (recoveryPct / 100))} className="transition-all duration-1000 ease-out" />
                        </svg>
                    </div>
                    <div className="text-10 text-white/60 mt-0.5 font-bold">Recovery {recoveryPct}%</div>
                </div>
            </div>
        </div>
    );
}
