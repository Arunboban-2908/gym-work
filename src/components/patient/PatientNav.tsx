'use client';

import React from 'react';
import { Home, Activity, MessageSquare, Target, Calendar, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth-client';

export function PatientNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const baseTabs = [
        { href: '/user', exact: true, label: 'Home', icon: Home },
        { href: '/user/exercises', exact: false, label: 'Exercises', icon: Activity },
        { href: '/user/chat', exact: false, label: 'AI Guide', icon: MessageSquare },
        { href: '/user/goals', exact: false, label: 'Goals', icon: Target },
        { href: '/user/schedule', exact: false, label: 'Schedule', icon: Calendar },
    ];

    const tabs = isAdmin 
        ? [...baseTabs, { href: '/admin', exact: false, label: 'Admin', icon: Shield }]
        : baseTabs;

    const handleLogout = async () => {
        const destination = isAdmin ? '/login?portal=admin' : '/login?portal=patient';
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push(destination);
                },
            },
        });
    };

    return (
        <div className="flex md:flex-col bg-pat-card border-t md:border-t-0 md:border-r border-pat-border px-2.5 py-2 md:py-6 md:w-100px shrink-0 justify-around md:justify-start gap-0 md:gap-4 md:items-center">
            {tabs.map(tab => {
                const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex-1 md:flex-none md:w-full flex flex-col items-center justify-center gap-1.5 cursor-pointer p-2 rounded-xl transition-all ${isActive ? 'bg-pat-blue-soft' : 'hover:bg-pat-bg'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-pat-navy text-white shadow-md' : 'text-pat-muted'}`}>
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                        </div>
                        <span className={`text-10 md:text-11 font-bold tracking-wide ${isActive ? 'text-pat-navy' : 'text-pat-muted'}`}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
            
            <button
                onClick={handleLogout}
                className="flex-1 md:flex-none md:w-full flex flex-col items-center justify-center gap-1.5 cursor-pointer p-2 rounded-xl transition-all hover:bg-red-50 group"
            >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-pat-muted group-hover:text-red-500 transition-colors">
                    <LogOut size={20} strokeWidth={1.8} />
                </div>
                <span className="text-10 md:text-11 font-bold tracking-wide text-pat-muted group-hover:text-red-600 transition-colors">
                    Logout
                </span>
            </button>
        </div>
    );
}
