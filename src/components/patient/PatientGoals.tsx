'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export function PatientGoals() {
    const activePatientId = useAppStore(s => s.activePatientId);
    const patients = useAppStore(s => s.patients);
    const patient = patients.find(p => p.id === activePatientId);

    if (!patient) return null;

    const chartData = {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
        datasets: [{
            data: [30, 35, 42, 48, 55, 61, 65, patient.recoveryPct],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#2563eb'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1c3557',
                titleFont: { family: 'Sora', size: 12 },
                bodyFont: { family: 'Sora', size: 11 },
                padding: 10,
                displayColors: false,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 9 }, color: '#94a3b8' } },
            y: { border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Sora', size: 9 }, color: '#94a3b8', maxTicksLimit: 5 } }
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-pat-bg font-sora pb-6 relative">
            <div className="bg-gradient-to-br from-[#1c3557] to-[#1e4a7a] px-5.5 py-4 shrink-0 lg:sticky lg:top-0 lg:z-50 shadow-md">
                <div className="text-10 text-white/50 font-medium tracking-[0.5px] uppercase mb-0.5">Recovery Journey</div>
                <div className="text-20 font-extrabold text-white tracking-tight leading-tight">Goals & Milestones</div>
                <div className="text-11 text-white/60 mt-1">4 of 7 achieved</div>
            </div>

            <div className="px-3.5 pt-4 lg:p-6 flex-1 w-full max-w-container-xl mx-auto">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start w-full">
                    <div className="flex flex-col">
                        <Section title="Weekly Streak">
                            <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm mb-4 lg:mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-24 font-extrabold text-pat-text leading-none">14 <span className="text-12 font-medium text-pat-muted">days</span></div>
                                    <div className="text-10 font-bold text-[#d97706] bg-[#fef3c7] px-2 py-1 rounded-md">🔥 On Fire!</div>
                                </div>
                                <div className="flex justify-between gap-1">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-12 font-bold transition-all ${i < 5 ? 'bg-pat-blue text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]' : i === 5 ? 'bg-pat-blue-soft border-2 border-pat-blue text-pat-blue scale-110' : 'bg-pat-bg border border-pat-border text-pat-muted'}`}>{i < 5 ? '✓' : ''}</div>
                                            <div className={`text-10 font-bold ${i === 5 ? 'text-pat-blue' : 'text-pat-muted'}`}>{d}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        <Section title="Milestones">
                            <div className="bg-pat-card rounded-2xl border border-pat-border shadow-sm mb-4 lg:mb-6 overflow-hidden">
                                {[
                                    { title: 'Independent Transfer', desc: 'Bed to wheelchair without assistance', done: true, date: '2 weeks ago' },
                                    { title: 'Hold Sitting Balance', desc: 'Unsupported for 60 seconds', done: true, date: 'Last week' },
                                    { title: 'Perform 10 Wheelchair Pushups', desc: 'Pressure relief independently', done: false, date: 'In progress' },
                                ].map((m, i) => (
                                    <div key={i} className={`flex items-start gap-3 p-3.5 border-b border-pat-border last:border-0 ${m.done ? 'opacity-70' : ''}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.done ? 'bg-pat-green/20 text-pat-green' : 'bg-pat-blue-soft border border-pat-blue/30 text-pat-blue'}`}>
                                            {m.done ? '✓' : '🎯'}
                                        </div>
                                        <div>
                                            <div className={`text-12 font-bold mb-0.5 ${m.done ? 'text-pat-text line-through decoration-pat-muted/50' : 'text-pat-text'}`}>{m.title}</div>
                                            <div className="text-10 text-pat-muted leading-tight">{m.desc}</div>
                                            <div className={`text-9 font-bold uppercase tracking-wide mt-1.5 ${m.done ? 'text-pat-muted' : 'text-pat-blue'}`}>{m.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    <div className="flex flex-col mt-4 lg:mt-0">
                        <Section title="Recovery Progress">
                            <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm mb-4 lg:mb-6 space-y-3.5">
                                <ProgressRow label="Upper Limb Strength" value={patient.upperLimb} color="bg-blue-500" textColor="text-blue-600" />
                                <ProgressRow label="Trunk Stability" value={patient.trunk} color="bg-teal-500" textColor="text-teal-600" bgTrack="bg-teal-50" />
                                <ProgressRow label="Fine Motor Control" value={patient.fineMotor} color="bg-green-500" textColor="text-green-600" bgTrack="bg-green-50" />
                                <ProgressRow label="Sensory Function" value={patient.sensory} color="bg-amber-500" textColor="text-amber-600" bgTrack="bg-amber-50" />
                            </div>
                        </Section>

                        <Section title="Recovery Chart">
                            <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm h-50 lg:h-60">
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: any) {
    return (
        <>
            <div className="text-10 font-bold uppercase tracking-[1px] text-pat-muted mb-2 px-1">
                {title}
            </div>
            {children}
        </>
    );
}

function ProgressRow({ label, value, color, textColor, bgTrack = 'bg-slate-100' }: any) {
    return (
        <div>
            <div className="flex justify-between mb-1.5">
                <span className="text-11 font-bold text-pat-text">{label}</span>
                <span className={`text-11 font-extrabold ${textColor}`}>{value}%</span>
            </div>
            <div className={`h-2 relative w-full rounded-full overflow-hidden ${bgTrack}`}>
                <div className={`absolute top-0 left-0 h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}
