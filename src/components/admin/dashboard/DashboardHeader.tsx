'use client';

import { Button } from '@/components/ui/Button';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';

export function DashboardHeader() {
    return (
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-20 font-bold text-adm-text tracking-tight">Clinical Dashboard</h1>
                <p className="text-xs text-adm-muted mt-1 font-mono">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm"><Download className="w-4 h-4" /> Export</Button>
                <Link href="/admin/add-patient">
                    <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> New Patient</Button>
                </Link>
            </div>
        </div>
    );
}
