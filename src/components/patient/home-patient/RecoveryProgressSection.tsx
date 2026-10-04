'use client';

import React from 'react';
import { TrendingDown, TrendingUp, CheckCircle, BarChart3, Info } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
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
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface RecoveryProgressSectionProps {
    healthUpdates?: any[];
    assessments?: any[];
}

export function RecoveryProgressSection({
    healthUpdates = [],
    assessments = []
}: RecoveryProgressSectionProps) {
    // Sort chronological (oldest to newest for trend)
    const sortedUpdates = [...healthUpdates].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Pain Trend Line Data
    const painLabels = sortedUpdates.map(u =>
        new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    );
    const painValues = sortedUpdates.map(u => u.painLevel);

    const painChartData = {
        labels: painLabels.length > 0 ? painLabels : ['Intake', 'Current'],
        datasets: [
            {
                label: 'Reported Pain (0-10)',
                data: painValues.length > 0 ? painValues : [5, 4],
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.35,
                fill: true,
                pointBackgroundColor: '#0284c7',
                pointRadius: 4,
            }
        ]
    };

    // Calculate neutral observation
    const firstPain = painValues[0];
    const latestPain = painValues[painValues.length - 1];
    let painObservation = 'Baseline pain tracking active.';
    if (painValues.length >= 2) {
        if (latestPain < firstPain) {
            painObservation = 'Your reported discomfort has decreased relative to baseline.';
        } else if (latestPain === firstPain) {
            painObservation = 'Your reported discomfort has remained consistent.';
        } else {
            painObservation = 'Your reported discomfort is fluctuating.';
        }
    }

    // Exercise completion rate
    const totalLogged = sortedUpdates.length;
    const completedCount = sortedUpdates.filter(u => u.exerciseCompleted).length;
    const adherenceRate = totalLogged > 0 ? Math.round((completedCount / totalLogged) * 100) : 100;

    return (
        <div className="bg-pat-card border border-pat-border rounded-2xl p-5 mb-5 shadow-sm font-sora">
            <div className="flex items-center justify-between pb-3 border-b border-pat-border mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-pat-navy">Recovery & Discomfort Trends</h3>
                        <p className="text-11 text-pat-muted">Neutral visual history based on your self-reported logs</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 text-pat-muted uppercase tracking-wider block font-semibold">Latest Pain Score</span>
                    <span className="text-xl font-bold font-mono text-pat-navy">
                        {latestPain !== undefined ? `${latestPain} / 10` : '—'}
                    </span>
                    <span className="text-10 text-pat-muted block mt-1">Self-reported</span>
                </div>

                <div className="p-3 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 text-pat-muted uppercase tracking-wider block font-semibold">Rehab Consistency</span>
                    <span className="text-xl font-bold font-mono text-emerald-700">{adherenceRate}%</span>
                    <span className="text-10 text-pat-muted block mt-1">{completedCount} of {totalLogged} logged days</span>
                </div>

                <div className="p-3 bg-pat-bg rounded-xl border border-pat-border">
                    <span className="text-10 text-pat-muted uppercase tracking-wider block font-semibold">Assessment Score</span>
                    <span className="text-xl font-bold font-mono text-pat-blue">
                        {assessments[0]?.recoveryPct ? `${assessments[0].recoveryPct}%` : 'Pending'}
                    </span>
                    <span className="text-10 text-pat-muted block mt-1">Clinical evaluation</span>
                </div>
            </div>

            {/* Pain Trend Chart */}
            {painValues.length > 0 ? (
                <div className="p-4 bg-pat-bg rounded-xl border border-pat-border mb-3">
                    <div className="h-44 w-full">
                        <Line
                            data={painChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: { min: 0, max: 10, ticks: { stepSize: 2, font: { size: 10 } } },
                                    x: { ticks: { font: { size: 10 } } }
                                },
                                plugins: {
                                    legend: { display: false }
                                }
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="py-6 text-center text-xs text-pat-muted bg-pat-bg rounded-xl border border-dashed border-pat-border mb-3">
                    Record your daily health status above to view your personalized discomfort trend.
                </div>
            )}

            {/* Neutral Summary Banner */}
            <div className="p-3 bg-pat-blue-soft/50 rounded-xl border border-pat-blue/20 text-xs text-pat-navy flex items-center gap-2">
                <Info size={15} className="text-pat-blue shrink-0" />
                <span>
                    <strong>Observation:</strong> {painObservation}
                </span>
            </div>
        </div>
    );
}
