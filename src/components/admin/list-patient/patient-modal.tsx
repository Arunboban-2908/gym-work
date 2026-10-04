'use client';

import React, { useEffect, useState } from 'react';
import { getPatientById, updatePatientStatus, deletePatient } from '@/actions/patient';
import { getExercises, assignExercisesToPatient } from '@/actions/exercise';
import { Button } from '@/components/ui/Button';
import {
    X,
    Activity,
    User,
    FileText,
    Calendar,
    PlusCircle,
    Trash2,
    Shield,
    HeartPulse,
    Target,
    Clock,
    Eye,
    CheckCircle2,
    Sparkles,
    AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface PatientModalProps {
    patientId: number;
    onClose: () => void;
    onUpdated: () => void;
}

export default function PatientModal({ patientId, onClose, onUpdated }: PatientModalProps) {
    const { toast } = useToast();
    const [patientData, setPatientData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'exercises'>('profile');

    // Exercise Library Assignment state
    const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
    const [assignDuration, setAssignDuration] = useState<number>(15);
    const [assignFrequency, setAssignFrequency] = useState<number>(4);
    const [assigningLoading, setAssigningLoading] = useState<boolean>(false);

    // Delete Patient state
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [pRes, exRes] = await Promise.all([
                getPatientById(patientId),
                getExercises()
            ]);

            if (pRes.success && pRes.data) {
                setPatientData(pRes.data);
                // Pre-populate currently assigned exercise IDs
                const currIds = (pRes.data.assignedExercises || []).map((ae: any) => ae.exerciseId);
                setSelectedExerciseIds(currIds);
            }

            if (exRes.success && exRes.data) {
                setExerciseLibrary(exRes.data);
            }

            setLoading(false);
        }
        loadData();
    }, [patientId]);

    const handleUpdateStatus = async (status: 'ACTIVE' | 'DISCHARGED' | 'CRITICAL') => {
        setStatusLoading(true);
        const res = await updatePatientStatus(patientId, status);
        if (res.success) {
            onUpdated();
            setPatientData((prev: any) => ({ ...prev, status }));
            toast(`Patient status updated to ${status}.`, 'success');
        }
        setStatusLoading(false);
    };

    const handleToggleExercise = (exId: number) => {
        if (selectedExerciseIds.includes(exId)) {
            setSelectedExerciseIds(selectedExerciseIds.filter(id => id !== exId));
        } else {
            setSelectedExerciseIds([...selectedExerciseIds, exId]);
        }
    };

    const handleAssignExercises = async () => {
        setAssigningLoading(true);
        const payload = selectedExerciseIds.map(id => ({
            exerciseId: id,
            durationMins: assignDuration,
            frequencyPerWeek: assignFrequency
        }));

        const res = await assignExercisesToPatient(patientId, payload);
        if (res.success) {
            toast('Assigned exercises updated successfully.', 'success');
            onUpdated();
            // Refresh patient data
            const refreshed = await getPatientById(patientId);
            if (refreshed.success) setPatientData(refreshed.data);
        } else {
            toast(res.error || 'Failed to assign exercises.', 'error');
        }
        setAssigningLoading(false);
    };

    const handleDeletePatient = async () => {
        setDeleteLoading(true);
        const res = await deletePatient(patientId);
        if (res.success) {
            toast('Patient and associated records permanently deleted.', 'success');
            onUpdated();
            onClose();
        } else {
            toast(res.error || 'Failed to delete patient.', 'error');
            setDeleteLoading(false);
            setConfirmDeleteOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adm-accent"></div>
            </div>
        );
    }

    if (!patientData) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-adm-card border border-adm-border rounded-xl p-6 w-full max-w-md text-center">
                    <p className="text-adm-text mb-4">Patient not found</p>
                    <Button onClick={onClose} variant="outline">Close</Button>
                </div>
            </div>
        );
    }

    const {
        healthProfile,
        fitnessGoals = [],
        medicalConditions = [],
        painLocations = [],
        lifestyle,
        healthUpdates = [],
        reports = [],
        assessments = [],
        assignedExercises = [],
        emergencyContacts = []
    } = patientData;

    const latestAssessment = assessments?.[0];
    const patientAge = healthProfile?.age ?? (patientData.dob ? new Date().getFullYear() - new Date(patientData.dob).getFullYear() : '—');

    return (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto">
            <div className="bg-adm-card border border-adm-border rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-adm-border bg-adm-surface">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-adm-accent shrink-0 shadow-md">
                            {patientData.firstName?.[0] || 'P'}
                            {patientData.lastName?.[0] || 'U'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-adm-text">
                                    {patientData.firstName} {patientData.lastName}
                                </h2>
                                <span className={`text-10 font-bold px-2 py-0.5 rounded-full uppercase border ${
                                    patientData.status === 'ACTIVE' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                                    patientData.status === 'CRITICAL' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                                    'bg-adm-muted/15 border-adm-border text-adm-muted'
                                }`}>
                                    {patientData.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center text-12 text-adm-muted mt-1 font-mono">
                                <span>#P{String(patientData.id).padStart(4, '0')}</span>
                                <span>•</span>
                                <span>{patientData.email}</span>
                                <span>•</span>
                                <span>{patientData.phone || 'No phone'}</span>
                                {patientData.onboardingCompleted && (
                                    <>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-sans font-semibold">✓ Intake Complete</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-adm-muted hover:text-adm-text rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-adm-border bg-adm-surface/60 px-5 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'profile'
                                ? 'border-adm-accent text-adm-accent font-bold'
                                : 'border-transparent text-adm-muted hover:text-adm-text'
                        }`}
                    >
                        <User size={15} />
                        <span>Clinical Profile & Intake (Model 1)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'history'
                                ? 'border-adm-accent text-adm-accent font-bold'
                                : 'border-transparent text-adm-muted hover:text-adm-text'
                        }`}
                    >
                        <Activity size={15} />
                        <span>Health Logs ({healthUpdates.length}) & Reports ({reports.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('exercises')}
                        className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'exercises'
                                ? 'border-adm-accent text-adm-accent font-bold'
                                : 'border-transparent text-adm-muted hover:text-adm-text'
                        }`}
                    >
                        <PlusCircle size={15} />
                        <span>Assign Exercises ({assignedExercises.length})</span>
                    </button>
                </div>

                {/* Tab Content Area */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    {/* ================= TAB 1: PROFILE & INTAKE ================= */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Key Biomarkers Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-3.5 bg-adm-surface border border-adm-border rounded-xl">
                                    <span className="text-10 text-adm-muted uppercase tracking-wider block font-semibold">Age</span>
                                    <span className="text-lg font-bold font-mono text-adm-text">{patientAge} yrs</span>
                                </div>
                                <div className="p-3.5 bg-adm-surface border border-adm-border rounded-xl">
                                    <span className="text-10 text-adm-muted uppercase tracking-wider block font-semibold">Height</span>
                                    <span className="text-lg font-bold font-mono text-adm-text">
                                        {healthProfile?.height ? `${healthProfile.height} ${healthProfile.heightUnit}` : '—'}
                                    </span>
                                </div>
                                <div className="p-3.5 bg-adm-surface border border-adm-border rounded-xl">
                                    <span className="text-10 text-adm-muted uppercase tracking-wider block font-semibold">Weight</span>
                                    <span className="text-lg font-bold font-mono text-adm-text">
                                        {healthProfile?.weight ? `${healthProfile.weight} ${healthProfile.weightUnit}` : '—'}
                                    </span>
                                </div>
                                <div className="p-3.5 bg-adm-surface border border-adm-border rounded-xl">
                                    <span className="text-10 text-adm-muted uppercase tracking-wider block font-semibold">Program / AIS</span>
                                    <span className="text-sm font-bold text-adm-accent truncate block mt-0.5">
                                        {patientData.injuryLevel || 'General'} • {patientData.ais || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Goals & Medical Conditions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Fitness Goals */}
                                <div className="p-4 bg-adm-surface border border-adm-border rounded-xl space-y-2.5">
                                    <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider flex items-center gap-1.5">
                                        <Target size={14} className="text-adm-accent" />
                                        Fitness & Rehab Goals
                                    </h4>
                                    {fitnessGoals.length === 0 ? (
                                        <p className="text-xs text-adm-muted italic">No goals selected yet.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {fitnessGoals.map((g: any) => (
                                                <span
                                                    key={g.id || g.goal}
                                                    className="px-2.5 py-1 rounded-lg bg-adm-accent/15 border border-adm-accent/30 text-adm-accent text-11 font-medium"
                                                >
                                                    ✓ {g.goal}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Medical Conditions */}
                                <div className="p-4 bg-adm-surface border border-adm-border rounded-xl space-y-2.5">
                                    <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider flex items-center gap-1.5">
                                        <HeartPulse size={14} className="text-emerald-400" />
                                        Self-Reported Conditions
                                    </h4>
                                    {medicalConditions.length === 0 ? (
                                        <p className="text-xs text-adm-muted italic">No conditions reported.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {medicalConditions.map((c: any) => (
                                                <span
                                                    key={c.id || c.condition}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-11 font-medium"
                                                >
                                                    {c.condition}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pain Locations & Lifestyle */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Pain Locations (from 3D map) */}
                                <div className="p-4 bg-adm-surface border border-adm-border rounded-xl space-y-2.5">
                                    <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider flex items-center gap-1.5">
                                        <Activity size={14} className="text-amber-400" />
                                        Pain Locations & Severity
                                    </h4>
                                    {painLocations.length === 0 ? (
                                        <p className="text-xs text-adm-muted italic">No pain locations recorded.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {painLocations.map((p: any) => (
                                                <div
                                                    key={p.id || p.bodyPart}
                                                    className="p-2.5 bg-adm-card rounded-lg border border-adm-border flex items-center justify-between text-xs"
                                                >
                                                    <div>
                                                        <span className="font-bold text-adm-text">{p.bodyPart}</span>
                                                        <span className="text-10 text-adm-muted block">
                                                            Tissue: {p.painType} {p.notes ? `• "${p.notes}"` : ''}
                                                        </span>
                                                    </div>
                                                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-11 ${
                                                        p.severity >= 7 ? 'bg-red-500/15 text-red-400' :
                                                        p.severity >= 4 ? 'bg-amber-500/15 text-amber-400' :
                                                        'bg-emerald-500/15 text-emerald-400'
                                                    }`}>
                                                        {p.severity} / 10
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Lifestyle & Contact */}
                                <div className="p-4 bg-adm-surface border border-adm-border rounded-xl space-y-3">
                                    <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock size={14} className="text-adm-teal" />
                                        Lifestyle & Rest Ergonomics
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="p-2.5 bg-adm-card rounded-lg border border-adm-border">
                                            <span className="text-10 text-adm-muted block">Sitting Hours</span>
                                            <span className="font-bold font-mono text-adm-text text-sm">
                                                {lifestyle?.sittingHours !== undefined ? `${lifestyle.sittingHours}h / day` : '—'}
                                            </span>
                                        </div>
                                        <div className="p-2.5 bg-adm-card rounded-lg border border-adm-border">
                                            <span className="text-10 text-adm-muted block">Nightly Sleep</span>
                                            <span className="font-bold font-mono text-adm-text text-sm">
                                                {lifestyle?.sleepHours !== undefined ? `${lifestyle.sleepHours}h / night` : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {emergencyContacts?.length > 0 && (
                                        <div className="pt-2 border-t border-adm-border text-xs">
                                            <span className="text-10 text-adm-muted block">Emergency Contact</span>
                                            <span className="font-medium text-adm-text">
                                                {emergencyContacts[0].name} ({emergencyContacts[0].relationship}) • {emergencyContacts[0].phone}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 2: HEALTH LOGS & DOCUMENTS ================= */}
                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            {/* Medical Documents Section */}
                            <div>
                                <h3 className="text-sm font-bold text-adm-text uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <FileText size={15} className="text-adm-accent" />
                                    Uploaded Medical Documents ({reports.length})
                                </h3>

                                {reports.length === 0 ? (
                                    <p className="text-xs text-adm-muted p-4 bg-adm-surface rounded-xl border border-dashed border-adm-border text-center">
                                        No medical documents uploaded for this patient.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {reports.map((r: any) => (
                                            <div
                                                key={r.id}
                                                className="p-3 bg-adm-surface border border-adm-border rounded-xl flex items-center justify-between text-xs"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <span className="font-bold text-adm-text truncate block">{r.name}</span>
                                                    <span className="text-10 text-adm-muted font-mono mt-0.5 block">
                                                        {new Date(r.createdAt).toLocaleDateString()} • {r.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <a
                                                    href={r.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 rounded-lg bg-adm-accent text-white font-semibold text-11 flex items-center gap-1 hover:brightness-110 shrink-0"
                                                >
                                                    <Eye size={12} />
                                                    <span>View</span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ongoing Health Updates (Model 2 Historical Log) */}
                            <div>
                                <h3 className="text-sm font-bold text-adm-text uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Activity size={15} className="text-adm-teal" />
                                    Daily Health Updates History ({healthUpdates.length} Records)
                                </h3>

                                {healthUpdates.length === 0 ? (
                                    <p className="text-xs text-adm-muted p-4 bg-adm-surface rounded-xl border border-dashed border-adm-border text-center">
                                        No daily health updates recorded yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                        {healthUpdates.map((u: any) => (
                                            <div
                                                key={u.id}
                                                className="p-3 bg-adm-surface border border-adm-border rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-adm-text">
                                                            {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className={`text-10 font-bold px-2 py-0.5 rounded-full ${
                                                            u.recoveryStatus === 'Improving' ? 'bg-emerald-500/15 text-emerald-400' :
                                                            u.recoveryStatus === 'Getting Worse' ? 'bg-red-500/15 text-red-400' :
                                                            'bg-blue-500/15 text-blue-400'
                                                        }`}>
                                                            {u.recoveryStatus}
                                                        </span>
                                                        <span className="text-10 font-mono text-adm-muted">
                                                            Energy: {u.energyLevel}
                                                        </span>
                                                    </div>
                                                    {u.painLocation && (
                                                        <div className="text-11 text-adm-muted mt-0.5">
                                                            Location: <span className="text-adm-text">{u.painLocation}</span>
                                                        </div>
                                                    )}
                                                    {u.symptoms && (
                                                        <div className="text-10 text-adm-text/80 italic mt-0.5">
                                                            &ldquo;{u.symptoms}&rdquo;
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <div className="font-mono font-bold text-adm-accent">
                                                        Pain: {u.painLevel} / 10
                                                    </div>
                                                    <span className="text-10 text-adm-muted font-mono">
                                                        {u.exerciseCompleted ? '✓ Exercises Done' : '— Rest Day'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ================= TAB 3: EXERCISES & ASSIGNMENT ================= */}
                    {activeTab === 'exercises' && (
                        <div className="space-y-6">
                            {/* Exercise Prescription Controls */}
                            <div className="p-4 bg-adm-surface border border-adm-border rounded-xl space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-adm-text">Prescribe Rehabilitation Exercises</h4>
                                        <p className="text-xs text-adm-muted">
                                            Select exercises matching this patient&apos;s goals and reported pain points.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-adm-muted font-medium">Duration:</span>
                                            <input
                                                type="number"
                                                min={5}
                                                max={60}
                                                value={assignDuration}
                                                onChange={(e) => setAssignDuration(parseInt(e.target.value) || 15)}
                                                className="w-16 bg-adm-card border border-adm-border rounded-lg px-2 py-1 text-xs text-adm-text font-mono text-center outline-none focus:border-adm-accent"
                                            />
                                            <span className="text-10 text-adm-muted">mins</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-adm-muted font-medium">Freq:</span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={7}
                                                value={assignFrequency}
                                                onChange={(e) => setAssignFrequency(parseInt(e.target.value) || 4)}
                                                className="w-14 bg-adm-card border border-adm-border rounded-lg px-2 py-1 text-xs text-adm-text font-mono text-center outline-none focus:border-adm-accent"
                                            />
                                            <span className="text-10 text-adm-muted">x/wk</span>
                                        </div>

                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleAssignExercises}
                                            disabled={assigningLoading}
                                        >
                                            {assigningLoading ? 'Assigning...' : `Assign Selected (${selectedExerciseIds.length})`}
                                        </Button>
                                    </div>
                                </div>

                                {/* Exercise Library Checklist */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                                    {exerciseLibrary.map((ex) => {
                                        const isSelected = selectedExerciseIds.includes(ex.id);
                                        return (
                                            <div
                                                key={ex.id}
                                                onClick={() => handleToggleExercise(ex.id)}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-adm-accent/15 border-adm-accent text-adm-text'
                                                        : 'bg-adm-card border-adm-border text-adm-muted hover:border-adm-border2'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="mt-1 w-4 h-4 rounded text-adm-accent accent-adm-accent cursor-pointer"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-base">{ex.emoji}</span>
                                                        <span className="font-bold text-xs truncate text-adm-text">{ex.name}</span>
                                                    </div>
                                                    <div className="text-10 text-adm-muted mt-0.5 truncate">
                                                        {ex.category} • {ex.target}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Currently Assigned Exercises */}
                            <div>
                                <h4 className="text-xs font-bold text-adm-text uppercase tracking-wider mb-2">
                                    Currently Assigned Program ({assignedExercises.length} Exercises)
                                </h4>
                                {assignedExercises.length === 0 ? (
                                    <p className="text-xs text-adm-muted p-3 bg-adm-surface rounded-xl border border-dashed border-adm-border text-center">
                                        No exercises currently assigned.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {assignedExercises.map((ae: any) => (
                                            <div key={ae.id} className="p-3 bg-adm-surface border border-adm-border rounded-xl flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-adm-accent/10 flex items-center justify-center text-xl shrink-0">
                                                    {ae.exercise.emoji}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-xs text-adm-text truncate">{ae.exercise.name}</div>
                                                    <div className="text-10 text-adm-muted mt-0.5">
                                                        {ae.durationMins}m • {ae.frequencyPerWeek}x/week
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-adm-border bg-adm-surface flex flex-wrap items-center justify-between gap-3">
                    {/* Delete Patient (Admin-Only) */}
                    <div>
                        {confirmDeleteOpen ? (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 p-1.5 px-3 rounded-xl">
                                <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                                    <AlertTriangle size={14} />
                                    Confirm permanent deletion?
                                </span>
                                <button
                                    type="button"
                                    disabled={deleteLoading}
                                    onClick={handleDeletePatient}
                                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-10 transition-colors cursor-pointer"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDeleteOpen(false)}
                                    className="text-10 text-adm-muted hover:underline ml-1 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteOpen(true)}
                                className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Trash2 size={13} />
                                <span>Delete Patient</span>
                            </button>
                        )}
                    </div>

                    {/* Status Updaters */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={statusLoading || patientData.status === 'CRITICAL'}
                            onClick={() => handleUpdateStatus('CRITICAL')}
                        >
                            Mark Critical
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={statusLoading || patientData.status === 'DISCHARGED'}
                            onClick={() => handleUpdateStatus('DISCHARGED')}
                        >
                            Discharge
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            disabled={statusLoading || patientData.status === 'ACTIVE'}
                            onClick={() => handleUpdateStatus('ACTIVE')}
                        >
                            Mark Active
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
