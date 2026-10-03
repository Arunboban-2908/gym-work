'use client';

import React, { useEffect, useState } from 'react';
import { getPatientById, updatePatientStatus } from '@/actions/patient';
import { Button } from '@/components/ui/Button';
import { X, Activity, User, FileText, Calendar, PlusCircle } from 'lucide-react';

interface PatientModalProps {
    patientId: number;
    onClose: () => void;
    onUpdated: () => void;
}

export default function PatientModal({ patientId, onClose, onUpdated }: PatientModalProps) {
    const [patientData, setPatientData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        async function loadPatient() {
            setLoading(true);
            const res = await getPatientById(patientId);
            if (res.success) {
                setPatientData(res.data);
            }
            setLoading(false);
        }
        loadPatient();
    }, [patientId]);

    const handleUpdateStatus = async (status: 'ACTIVE' | 'DISCHARGED' | 'CRITICAL') => {
        setStatusLoading(true);
        const res = await updatePatientStatus(patientId, status);
        if (res.success) {
            onUpdated();
            // Optimistically update local state if keeping modal open
            setPatientData((prev: any) => ({ ...prev, status }));
        }
        setStatusLoading(false);
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

    const { assessments, appointments, emergencyContacts, assignedExercises } = patientData;
    const latestAssessment = assessments?.[0];

    return (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto">
            <div className="bg-adm-card border border-adm-border rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-adm-border bg-adm-surface">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white bg-adm-accent shrink-0">
                            {patientData.firstName[0]}
                            {patientData.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-adm-text">
                                {patientData.firstName} {patientData.lastName}
                            </h2>
                            <div className="flex gap-2 items-center text-13 mt-1">
                                <span className="font-mono text-adm-muted">#P{String(patientData.id).padStart(4, '0')}</span>
                                <span className="w-1 h-1 rounded-full bg-adm-border2"></span>
                                <span className="text-adm-muted">{patientData.gender} • {new Date().getFullYear() - new Date(patientData.dob).getFullYear()}y</span>
                                <span className="w-1 h-1 rounded-full bg-adm-border2"></span>
                                <span className="text-adm-teal uppercase text-10 font-bold px-1.5 py-0.5 rounded border border-adm-teal/20 bg-adm-teal/10">
                                    {patientData.injuryLevel}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-adm-muted hover:text-adm-text rounded-md hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    {/* Grid Section 1: Overview & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Clinical Overview */}
                        <div className="bg-adm-surface border border-adm-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-adm-text mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-adm-accent" />
                                Clinical Overview
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-adm-muted">Status</span>
                                    <span className={`font-bold uppercase text-11 ${patientData.status === 'ACTIVE' ? 'text-[#3fb950]' :
                                        patientData.status === 'CRITICAL' ? 'text-adm-danger' : 'text-adm-muted'
                                        }`}>{patientData.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-adm-muted">AIS Grade</span>
                                    <span className="text-adm-text font-medium">{patientData.ais}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-adm-muted">Program</span>
                                    <span className="text-adm-text font-medium">{patientData.program || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-adm-muted">Primary Therapist</span>
                                    <span className="text-adm-text font-medium">{patientData.therapist || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-adm-surface border border-adm-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-adm-text mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-adm-accent" />
                                Contact Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-adm-muted">Email</span>
                                    <span className="text-adm-text font-medium">{patientData.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-adm-muted">Phone</span>
                                    <span className="text-adm-text font-medium">{patientData.phone}</span>
                                </div>
                                {emergencyContacts?.length > 0 && (
                                    <>
                                        <div className="my-2 border-t border-adm-border"></div>
                                        <div className="flex justify-between">
                                            <span className="text-adm-muted">Emergency ({emergencyContacts[0].relationship})</span>
                                            <span className="text-adm-text font-medium">{emergencyContacts[0].name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-adm-muted">Emergency Phone</span>
                                            <span className="text-adm-danger font-medium">{emergencyContacts[0].phone}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Latest Assessment / Recovery */}
                    {latestAssessment && (
                        <div className="bg-adm-surface border border-adm-border rounded-lg p-5">
                            <h3 className="text-sm font-semibold text-adm-text mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-adm-accent" />
                                Latest Assessment (Week {latestAssessment.week})
                                <span className="text-11 font-normal text-adm-muted ml-auto">
                                    {new Date(latestAssessment.date).toLocaleDateString()}
                                </span>
                            </h3>

                            <div className="mb-5">
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-adm-text font-medium">Overall Recovery</span>
                                    <span className="text-adm-accent font-bold">{latestAssessment.recoveryPct}%</span>
                                </div>
                                <div className="h-2 w-full bg-adm-border rounded-full overflow-hidden">
                                    <div className="h-full bg-adm-accent" style={{ width: `${latestAssessment.recoveryPct}%` }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries({
                                    upperLimb: 'Upper Limb',
                                    trunk: 'Trunk Control',
                                    fineMotor: 'Fine Motor',
                                    sensory: 'Sensory'
                                }).map(([key, label]) => (
                                    <div key={key} className="bg-adm-card border border-adm-border/50 rounded-md p-3 text-center">
                                        <div className="text-adm-muted text-11 tracking-wide uppercase mb-1">{label}</div>
                                        <div className="text-lg font-bold text-adm-text">{latestAssessment[key as keyof typeof latestAssessment]}/50</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assigned Exercises */}
                    <div className="bg-adm-surface border border-adm-border rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-adm-text mb-4 flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-adm-accent" />
                            Assigned Exercises
                        </h3>
                        {assignedExercises?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {assignedExercises.map((ae: any) => (
                                    <div key={ae.id} className="flex items-center gap-3 p-3 bg-adm-card border border-adm-border/50 rounded-lg">
                                        <div className="w-10 h-10 rounded-md bg-adm-accent/10 flex items-center justify-center text-xl shrink-0">
                                            {ae.exercise.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-13 font-semibold text-adm-text truncate">{ae.exercise.name}</div>
                                            <div className="text-11 text-adm-muted mt-0.5">
                                                {ae.durationMins}m • {ae.frequencyPerWeek}x/week
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-adm-muted text-sm text-center py-4 bg-adm-card rounded border border-adm-border/30 border-dashed">
                                No exercises currently assigned.
                            </p>
                        )}
                    </div>

                </div>

                {/* Footer / Actions */}
                <div className="p-5 border-t border-adm-border bg-adm-surface flex flex-wrap gap-3 justify-between items-center">
                    <p className="text-11 text-adm-muted font-mono hidden sm:block">
                        Added: {new Date(patientData.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="danger"
                            disabled={statusLoading || patientData.status === 'CRITICAL'}
                            onClick={() => handleUpdateStatus('CRITICAL')}
                            className="flex-1 sm:flex-none"
                            isLoading={statusLoading && patientData.status !== 'CRITICAL'} // Simplified loading state
                        >
                            Mark Critical
                        </Button>
                        <Button
                            variant="outline"
                            disabled={statusLoading || patientData.status === 'DISCHARGED'}
                            onClick={() => handleUpdateStatus('DISCHARGED')}
                            className="flex-1 sm:flex-none border-adm-muted hover:border-white hover:text-white"
                        >
                            Discharge
                        </Button>
                        <Button
                            variant="primary"
                            disabled={statusLoading || patientData.status === 'ACTIVE'}
                            onClick={() => handleUpdateStatus('ACTIVE')}
                            className="flex-1 sm:flex-none"
                        >
                            Mark Active
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
