'use client';

import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/ui/ChartCard';
import { getProgressChartData } from '@/actions/progress';

export default function ProgressPage() {
    const [chartData, setChartData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getProgressChartData().then(res => {
            if (res.success && res.labels.length > 0) {
                setChartData({
                    labels: res.labels,
                    datasets: [{
                        data: res.data,
                        borderColor: '#2f81f7',
                        backgroundColor: 'rgba(47,129,247,0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                });
            }
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="p-6 pb-20">
            <div className="mb-6">
                <h1 className="text-20 font-bold text-adm-text tracking-tight">Progress Reports</h1>
                <p className="text-xs text-adm-muted mt-1 font-mono">Detailed recovery metrics across all patients.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
                {isLoading ? (
                    <div className="bg-adm-card border border-adm-border rounded-xl p-6 text-center text-adm-muted">
                        Loading chart data...
                    </div>
                ) : chartData ? (
                    <ChartCard title="Overall Recovery Trends" subtitle="Average recovery % per week" type="line" data={chartData} />
                ) : (
                    <div className="bg-adm-card border border-adm-border rounded-xl p-6 text-center text-adm-muted flex flex-col items-center justify-center min-h-[300px]">
                        <p>No assessment data available yet.</p>
                        <p className="text-xs mt-1">Once patient assessments are added, the overall recovery trend will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
