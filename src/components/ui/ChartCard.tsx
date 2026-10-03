'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartOptions,
    ChartData
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface ChartCardProps {
    title: string;
    subtitle?: string;
    type: 'line' | 'bar' | 'doughnut';
    data: ChartData<any>;
    options?: ChartOptions<any>;
    height?: number;
    className?: string;
}

export function ChartCard({ title, subtitle, type, data, options, height = 210, className }: ChartCardProps) {
    const defaultOptions: ChartOptions<any> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#161b22',
                titleFont: { family: 'Sora', size: 12 },
                bodyFont: { family: 'Sora', size: 11 },
                borderColor: '#30363d',
                borderWidth: 1,
            }
        },
        ...options
    };

    return (
        <div className={cn("bg-adm-card border border-adm-border rounded-xl overflow-hidden flex flex-col", className)}>
            <div className="px-18px py-3.5 border-b border-adm-border2 flex items-center justify-between">
                <h3 className="text-13 font-semibold text-adm-text">{title}</h3>
                {subtitle && <span className="text-11 text-adm-muted font-mono">{subtitle}</span>}
            </div>
            <div className="p-18px relative w-full" style={{ height }}>
                {type === 'line' && <Line data={data as any} options={defaultOptions} />}
                {type === 'bar' && <Bar data={data as any} options={defaultOptions} />}
                {type === 'doughnut' && <Doughnut data={data as any} options={defaultOptions} />}
            </div>
        </div>
    );
}
