'use client';

import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/ui/ChartCard';
import {
    getProgressChartData,
    getOverallAdminAnalytics,
    getPatientProgressDetails
} from '@/actions/progress';
import { getPatients } from '@/actions/patient';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Users,
    AlertTriangle,
    HeartPulse,
    CheckCircle2,
    FileText,
    Dumbbell,
    User,
    Calendar,
    Target
} from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function AdminProgressPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [patientsList, setPatientsList] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [individualPatient, setIndividualPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [individualLoading, setIndividualLoading] = useState(false);

    useEffect(() => {
        async function loadInitial() {
            setIsLoading(true);
            const [analyticsRes, chartRes, patientsRes] = await Promise.all([
                getOverallAdminAnalytics(),
                getProgressChartData(),
                getPatients()
            ]);

            if (analyticsRes.success) {
                setAnalytics(analyticsRes.data);
            }

            if (chartRes.success && chartRes.labels.length > 0) {
                setChartData({
                    labels: chartRes.labels,
                    datasets: [{
                        label: 'Average Recovery %',
                        data: chartRes.data,
                        borderColor: '#2f81f7',
                        backgroundColor: 'rgba(47,129,247,0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                });
            }

            if (patientsRes.success && patientsRes.data) {
                setPatientsList(patientsRes.data);
                if (patientsRes.data.length > 0) {
                    setSelectedPatientId(patientsRes.data[0].id);
                }
            }

            setIsLoading(false);
        }
        loadInitial();
    }, []);

    // Load individual patient progress when selector changes
    useEffect(() => {
        if (!selectedPatientId) return;
        async function loadPatient() {
            setIndividualLoading(true);
            const res = await getPatientProgressDetails(selectedPatientId!);
            if (res.success && res.data) {
                setIndividualPatient(res.data);
            }
            setIndividualLoading(false);
        }
        loadPatient();
    }, [selectedPatientId]);

    // Prepare individual patient charts
    const individualPainUpdates = individualPatient?.healthUpdates || [];
    const individualPainData = {
        labels: individualPainUpdates.map((u: any) =>
            new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        ),
        datasets: [{
            label: 'Reported Pain Score (0-10)',
            data: individualPainUpdates.map((u: any) => u.painLevel),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#f59e0b'
        }]
    };

    const individualAssessments = individualPatient?.assessments || [];
    const individualRecoveryData = {
        labels: individualAssessments.map((a: any) => `W${a.week}`),
        datasets: [{
            label: 'Recovery Assessment %',
            data: individualAssessments.map((a: any) => a.recoveryPct),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#10b981'
        }]
    };

    return (
        <div className="p-3.5 sm:p-6 pb-24 font-sora">
            {/* Header */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-10 font-bold bg-adm-accent/15 text-adm-accent border border-adm-accent/30 mb-2 uppercase tracking-wide">
                    <Activity size={12} /> Clinical Analytics
                </div>
                <h1 className="text-2xl font-bold text-adm-text tracking-tight">Recovery & Health Analytics</h1>
                <p className="text-xs text-adm-muted mt-1 font-mono">
                    Aggregate clinical benchmarks and individual patient recovery tracking derived strictly from recorded data.
                </p>
            </div>

            {/* Overall Analytics Aggregate Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
                <div className="p-4 bg-adm-card border border-adm-border rounded-xl">
                    <div className="flex items-center justify-between text-adm-muted mb-1 text-xs">
                        <span>Total Patients</span>
                        <Users size={14} className="text-adm-accent" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-adm-text">
                        {analytics?.totalPatients ?? 0}
                    </div>
                    <span className="text-10 text-adm-muted">System records</span>
                </div>

                <div className="p-4 bg-adm-card border border-adm-border rounded-xl">
                    <div className="flex items-center justify-between text-adm-muted mb-1 text-xs">
                        <span>Active / Critical</span>
                        <AlertTriangle size={14} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-adm-text">
                        <span className="text-emerald-400">{analytics?.activePatients ?? 0}</span>
                        <span className="text-adm-muted text-lg mx-1">/</span>
                        <span className="text-red-400">{analytics?.criticalPatients ?? 0}</span>
                    </div>
                    <span className="text-10 text-adm-muted">Clinical status</span>
                </div>

                <div className="p-4 bg-adm-card border border-adm-border rounded-xl">
                    <div className="flex items-center justify-between text-adm-muted mb-1 text-xs">
                        <span>Average Recovery</span>
                        <TrendingUp size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                        {analytics?.avgRecovery !== null && analytics?.avgRecovery !== undefined
                            ? `${analytics.avgRecovery}%`
                            : 'N/A'}
                    </div>
                    <span className="text-10 text-adm-muted">
                        {analytics?.assessmentCount ?? 0} assessments evaluated
                    </span>
                </div>

                <div className="p-4 bg-adm-card border border-adm-border rounded-xl">
                    <div className="flex items-center justify-between text-adm-muted mb-1 text-xs">
                        <span>Average Pain</span>
                        <HeartPulse size={14} className="text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-adm-accent">
                        {analytics?.avgPain !== null && analytics?.avgPain !== undefined
                            ? `${analytics.avgPain} / 10`
                            : 'N/A'}
                    </div>
                    <span className="text-10 text-adm-muted">
                        {analytics?.healthUpdateCount ?? 0} logs recorded
                    </span>
                </div>

                <div className="p-4 bg-adm-card border border-adm-border rounded-xl">
                    <div className="flex items-center justify-between text-adm-muted mb-1 text-xs">
                        <span>Adherence Rate</span>
                        <CheckCircle2 size={14} className="text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-purple-400">
                        {analytics?.exerciseAdherence !== null && analytics?.exerciseAdherence !== undefined
                            ? `${analytics.exerciseAdherence}%`
                            : 'N/A'}
                    </div>
                    <span className="text-10 text-adm-muted">Daily exercise logging</span>
                </div>

                <div className="p-4 bg-adm-card border border-adm-border rounded-xl">
                    <div className="flex items-center justify-between text-adm-muted mb-1 text-xs">
                        <span>Reports & Prescriptions</span>
                        <FileText size={14} className="text-adm-teal" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-adm-text">
                        <span>{analytics?.totalReports ?? 0}</span>
                        <span className="text-adm-muted text-lg mx-1">/</span>
                        <span>{analytics?.totalAssigned ?? 0}</span>
                    </div>
                    <span className="text-10 text-adm-muted">Documents / Prescriptions</span>
                </div>
            </div>

            {/* Overall Recovery Trends Chart */}
            <div className="mb-8">
                {isLoading ? (
                    <div className="bg-adm-card border border-adm-border rounded-xl p-8 text-center text-adm-muted">
                        Loading clinical chart data...
                    </div>
                ) : chartData ? (
                    <ChartCard
                        title="Overall Recovery Trends Across Patients"
                        subtitle="Average recovery percentage by clinical assessment week"
                        type="line"
                        data={chartData}
                    />
                ) : (
                    <div className="bg-adm-card border border-adm-border rounded-xl p-8 text-center text-adm-muted">
                        <p>No assessment data recorded yet.</p>
                        <p className="text-xs mt-1">Aggregate weekly trendlines will populate as assessments are logged.</p>
                    </div>
                )}
            </div>

            {/* ================= SECTION: INDIVIDUAL PATIENT PROGRESS ================= */}
            <div className="bg-adm-card border border-adm-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-adm-border gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-adm-accent" />
                            <h2 className="text-lg font-bold text-adm-text">Individual Patient Progress</h2>
                        </div>
                        <p className="text-xs text-adm-muted mt-0.5">
                            Deep-dive into self-reported pain trajectory, exercise consistency, and clinical evaluations.
                        </p>
                    </div>

                    {/* Patient Picker */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                        <label className="text-xs font-semibold text-adm-muted shrink-0">Select Patient:</label>
                        <select
                            value={selectedPatientId || ''}
                            onChange={(e) => setSelectedPatientId(parseInt(e.target.value))}
                            className="bg-adm-surface border border-adm-border rounded-xl px-3 py-2 text-xs text-adm-text outline-none focus:border-adm-accent font-sora w-full sm:w-auto min-w-[200px]"
                        >
                            {patientsList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.firstName} {p.lastName} (#P{String(p.id).padStart(4, '0')})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {individualLoading ? (
                    <div className="py-12 text-center text-adm-muted text-xs">
                        Loading patient progress profile...
                    </div>
                ) : !individualPatient ? (
                    <div className="py-12 text-center text-adm-muted text-xs">
                        Select a patient above to view their individual recovery metrics.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Patient Summary Header */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-adm-surface border border-adm-border rounded-xl">
                                <span className="text-10 text-adm-muted block uppercase font-semibold">Status & AIS</span>
                                <span className="text-sm font-bold text-adm-text">
                                    {individualPatient.status} • {individualPatient.ais || 'Pending'}
                                </span>
                            </div>
                            <div className="p-3 bg-adm-surface border border-adm-border rounded-xl">
                                <span className="text-10 text-adm-muted block uppercase font-semibold">Latest Evaluated Recovery</span>
                                <span className="text-sm font-bold font-mono text-emerald-400">
                                    {individualAssessments.length > 0
                                        ? `${individualAssessments[individualAssessments.length - 1].recoveryPct}%`
                                        : 'No assessments'}
                                </span>
                            </div>
                            <div className="p-3 bg-adm-surface border border-adm-border rounded-xl">
                                <span className="text-10 text-adm-muted block uppercase font-semibold">Health Updates Logged</span>
                                <span className="text-sm font-bold font-mono text-adm-accent">
                                    {individualPainUpdates.length} daily logs
                                </span>
                            </div>
                            <div className="p-3 bg-adm-surface border border-adm-border rounded-xl">
                                <span className="text-10 text-adm-muted block uppercase font-semibold">Assigned Program</span>
                                <span className="text-sm font-bold font-mono text-adm-text">
                                    {individualPatient.assignedExercises?.length || 0} exercises
                                </span>
                            </div>
                        </div>

                        {/* Dual Chart Row: Pain Trend & Recovery Assessment */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Pain Trend */}
                            <div className="p-4 bg-adm-surface border border-adm-border rounded-xl">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider">
                                            Reported Pain Score Trend
                                        </h4>
                                        <span className="text-10 text-adm-muted">0 (No pain) to 10 (Severe)</span>
                                    </div>
                                    <span className="text-10 font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                        {individualPainUpdates.length} data points
                                    </span>
                                </div>
                                {individualPainUpdates.length > 0 ? (
                                    <div className="h-48 w-full">
                                        <Line
                                            data={individualPainData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: { min: 0, max: 10, ticks: { stepSize: 2, font: { size: 10 } } },
                                                    x: { ticks: { font: { size: 10 } } }
                                                },
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-xs text-adm-muted">
                                        No daily health logs recorded by this patient yet.
                                    </div>
                                )}
                            </div>

                            {/* Assessment Recovery % */}
                            <div className="p-4 bg-adm-surface border border-adm-border rounded-xl">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider">
                                            Clinical Assessment Recovery Trajectory
                                        </h4>
                                        <span className="text-10 text-adm-muted">Recovery percentage by evaluation week</span>
                                    </div>
                                    <span className="text-10 font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                        {individualAssessments.length} assessments
                                    </span>
                                </div>
                                {individualAssessments.length > 0 ? (
                                    <div className="h-48 w-full">
                                        <Line
                                            data={individualRecoveryData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: { min: 0, max: 100, ticks: { stepSize: 20, font: { size: 10 } } },
                                                    x: { ticks: { font: { size: 10 } } }
                                                },
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-xs text-adm-muted">
                                        No clinical assessments recorded for this patient yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Health Updates Feed */}
                        {individualPainUpdates.length > 0 && (
                            <div className="p-4 bg-adm-surface border border-adm-border rounded-xl">
                                <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider mb-3">
                                    Recent Daily Logs from {individualPatient.firstName}
                                </h4>
                                <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                                    {individualPainUpdates.slice(-5).reverse().map((u: any) => (
                                        <div key={u.id} className="p-2.5 bg-adm-card rounded-lg border border-adm-border text-xs flex items-center justify-between">
                                            <div>
                                                <span className="font-semibold text-adm-text mr-2">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className={`text-10 font-bold px-2 py-0.5 rounded-full ${
                                                    u.recoveryStatus === 'Improving' ? 'bg-emerald-500/15 text-emerald-400' :
                                                    u.recoveryStatus === 'Getting Worse' ? 'bg-red-500/15 text-red-400' :
                                                    'bg-blue-500/15 text-blue-400'
                                                }`}>
                                                    {u.recoveryStatus}
                                                </span>
                                                {u.painLocation && (
                                                    <span className="text-10 text-adm-muted ml-2">
                                                        ({u.painLocation})
                                                    </span>
                                                )}
                                                {u.symptoms && (
                                                    <span className="text-10 text-adm-text/80 italic ml-2">
                                                        &ldquo;{u.symptoms}&rdquo;
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-mono text-adm-accent font-bold">
                                                Pain: {u.painLevel}/10
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
