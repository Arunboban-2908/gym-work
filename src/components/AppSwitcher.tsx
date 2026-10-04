'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Menu, X } from 'lucide-react';

export function AppSwitcher() {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');
    const patientsCount = useAppStore(s => s.patients.length);
    const activePatientId = useAppStore(s => s.activePatientId);
    const adminSidebarOpen = useAppStore(s => s.adminSidebarOpen);
    const toggleAdminSidebar = useAppStore(s => s.toggleAdminSidebar);

    const [time, setTime] = useState('--:--');

    useEffect(() => {
        setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-12 bg-[#090d13] border-b border-adm-card flex items-center px-2.5 sm:px-4 z-[1000] font-sora">
            {/* Mobile Hamburger Menu (Admin mode only) */}
            {isAdmin && (
                <button
                    type="button"
                    onClick={toggleAdminSidebar}
                    aria-label="Toggle navigation drawer"
                    className="md:hidden p-1.5 mr-1 text-adm-muted hover:text-adm-text hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    {adminSidebarOpen ? <X size={18} className="text-adm-accent" /> : <Menu size={18} />}
                </button>
            )}

            <div className="font-lora text-14 sm:text-16 text-adm-text font-semibold mr-2 sm:mr-6 tracking-tight flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-adm-accent to-adm-accent2 shadow-[0_0_8px_rgba(47,129,247,0.6)]" />
                <span>Neuro<span className="text-adm-accent">Path</span></span>
            </div>

            <div className="flex gap-1.5 sm:gap-2 flex-1 min-w-0">
                <Link
                    href="/admin"
                    className={`px-2 sm:px-3.5 py-1.5 rounded-md text-11 sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all truncate shrink-0 ${isAdmin ? 'text-adm-text bg-adm-card shadow-sm' : 'text-adm-muted hover:text-adm-text hover:bg-adm-surface'}`}
                >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 shrink-0">
                        <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                    <span>Admin<span className="hidden sm:inline"> Dashboard</span></span>
                    <span className="bg-adm-accent text-white rounded-full px-1.5 py-[0.5px] text-10 ml-0.5">{patientsCount}</span>
                </Link>
                <Link
                    href="/user"
                    className={`px-2 sm:px-3.5 py-1.5 rounded-md text-11 sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all truncate shrink-0 ${!isAdmin ? 'text-adm-text bg-adm-card shadow-sm' : 'text-adm-muted hover:text-adm-text hover:bg-adm-surface'}`}
                >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 shrink-0">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span>Patient<span className="hidden sm:inline"> Portal</span></span>
                </Link>
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0 pl-1">
                <div className="hidden xs:flex items-center gap-1.5 text-11 font-mono text-adm-accent2">
                    <span className="w-1.5 h-1.5 rounded-full bg-adm-accent2 shadow-[0_0_4px_rgba(63,185,80,0.4)] animate-pulse" />
                    <span className="hidden sm:inline">· Live</span>
                </div>
                <div className="text-10 sm:text-11 font-mono text-adm-muted min-w-[42px] text-right">
                    {time}
                </div>
            </div>
        </div>
    );
}
