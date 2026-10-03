'use client';

import React from 'react';

export function ApkPanel() {
    return (
        <div className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] rounded-3xl p-7 w-80 shadow-2xl border border-white/10 shrink-0 font-sora">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-11 h-11 bg-gradient-to-br from-pat-blue to-pat-teal rounded-xl flex items-center justify-center text-22 shadow-lg shadow-pat-blue/40">
                    🧠
                </div>
                <div>
                    <div className="text-16 font-extrabold text-white tracking-tight">NeuroPath</div>
                    <div className="text-11 text-white/45">SCI Rehabilitation App</div>
                </div>
            </div>

            <div className="text-20 font-extrabold text-white mb-1.5 tracking-tight">Download the App</div>
            <div className="text-12 text-white/55 leading-relaxed mb-5">
                Get the full NeuroPath patient experience on your mobile device. AI-guided exercises, real-time health tracking, and direct therapist communication.
            </div>

            <div className="flex flex-col gap-2 mb-6">
                {[
                    { icon: '💪', text: 'Level-based video exercise library', color: 'rgba(37,99,235,0.2)' },
                    { icon: '🧠', text: 'AI rehab assistant (24/7)', color: 'rgba(13,148,136,0.2)' },
                    { icon: '📊', text: 'Recovery progress tracking', color: 'rgba(22,163,74,0.2)' },
                    { icon: '💊', text: 'Medication & pain logging', color: 'rgba(217,119,6,0.2)' },
                    { icon: '🚨', text: 'One-tap emergency contact', color: 'rgba(220,38,38,0.2)' },
                    { icon: '📅', text: 'Appointment & care team access', color: 'rgba(139,92,246,0.2)' },
                ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-12 text-white/75">
                        <div className="w-26px h-26px rounded-lg flex items-center justify-center text-13 shrink-0" style={{ background: feat.color }}>
                            {feat.icon}
                        </div>
                        {feat.text}
                    </div>
                ))}
            </div>

            <button className="w-full p-3.5 bg-gradient-to-br from-pat-blue to-[#1d4ed8] rounded-xl text-white text-14 font-bold shadow-lg shadow-pat-blue/40 flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5 mb-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 12l4 4 4-4" /><path d="M12 8v8" /></svg>
                Download APK (Android)
            </button>

            <div className="text-center text-10 text-white/30 my-2">— or —</div>

            <button className="w-full p-3.5 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl text-white text-14 font-bold shadow-lg flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 8v8M8 12l4 4 4-4" /></svg>
                Download for iOS
            </button>

            <div className="text-center text-10 text-white/25 mt-3.5 font-mono">
                v4.0.1 · 38.2 MB · Requires Android 8+ / iOS 14+ · HIPAA Compliant 🔒
            </div>
        </div>
    );
}
