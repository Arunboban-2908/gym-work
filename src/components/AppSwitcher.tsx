'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export function AppSwitcher() {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');
    const patientsCount = useAppStore(s => s.patients.length);
    const activePatientId = useAppStore(s => s.activePatientId);
    const patient = useAppStore(s => s.patients.find(p => p.id === activePatientId));

    const [time, setTime] = useState('--:--');

    useEffect(() => {
        setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-12 bg-[#090d13] border-b border-adm-card flex items-center px-4 z-[1000] font-sora">
            <div className="font-lora text-16 text-adm-text font-semibold mr-6 tracking-tight flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-adm-accent to-adm-accent2 shadow-[0_0_8px_rgba(47,129,247,0.6)]" />
                NeuroPath
            </div>

            <div className="flex gap-2 flex-1">
                <Link
                    href="/admin"
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${isAdmin ? 'text-adm-text bg-adm-card shadow-sm' : 'text-adm-muted hover:text-adm-text hover:bg-adm-surface'}`}
                >
                    <svg viewBox="0 0 24 24" className="w-13px h-13px stroke-current fill-none stroke-2">
                        <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                    Admin Dashboard
                    <span className="bg-adm-accent text-white rounded-full px-1.5 py-[0.5px] text-10 ml-0.5">{patientsCount}</span>
                </Link>
                <Link
                    href="/user"
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${!isAdmin ? 'text-adm-text bg-adm-card shadow-sm' : 'text-adm-muted hover:text-adm-text hover:bg-adm-surface'}`}
                >
                    <svg viewBox="0 0 24 24" className="w-13px h-13px stroke-current fill-none stroke-2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Patient Portal
                </Link>
            </div>

            <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-11 font-mono text-adm-accent2">
                    <span className="w-1.5 h-1.5 rounded-full bg-adm-accent2 shadow-[0_0_4px_rgba(63,185,80,0.4)] animate-pulse" />
                     · Live
                </div>
                <div className="text-11 font-mono text-adm-muted min-w-46px text-right">
                    {time}
                </div>
            </div>
        </div>
    );
}
