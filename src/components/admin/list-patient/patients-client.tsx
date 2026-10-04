'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, BadgeCheck, ShieldAlert, Trash2, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatientWithAssessments, deletePatient } from '@/actions/patient';
import PatientModal from './patient-modal';
import { useToast } from '@/components/ui/Toast';

export default function PatientsClient({ initialPatients }: { initialPatients: PatientWithAssessments[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [patients, setPatients] = useState<PatientWithAssessments[]>(initialPatients);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [verifyFilter, setVerifyFilter] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PatientWithAssessments | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setPatients(initialPatients);
    }, [initialPatients]);

    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            const matchSearch = (p.firstName + ' ' + p.lastName).toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter ? p.status === filter : true;
            
            let matchVerify = true;
            if (verifyFilter === 'VERIFIED') matchVerify = p.isVerified === true;
            if (verifyFilter === 'UNVERIFIED') matchVerify = p.isVerified !== true;

            return matchSearch && matchFilter && matchVerify;
        });
    }, [patients, search, filter, verifyFilter]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await deletePatient(deleteTarget.id);
            if (res.success) {
                toast(`User ${deleteTarget.firstName} ${deleteTarget.lastName} deleted permanently.`, 'success');
                setPatients(prev => prev.filter(p => p.id !== deleteTarget.id));
                setDeleteTarget(null);
                if (selectedPatientId === deleteTarget.id) {
                    setSelectedPatientId(null);
                }
                router.refresh();
            } else {
                toast(res.error || 'Failed to delete user', 'error');
            }
        } catch {
            toast('Failed to delete user. Please try again.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusTag = (status: string) => {
        const map: Record<string, string> = {
            ACTIVE: 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/20',
            DISCHARGED: 'text-adm-muted bg-adm-muted/10 border-adm-muted/20',
            CRITICAL: 'text-adm-danger bg-adm-danger/10 border-adm-danger/20'
        };
        const defaultStyle = 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/20';
        return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border ${map[status] || defaultStyle}`}>{status}</span>;
    };

    return (
        <div className="p-3.5 sm:p-6 pb-20 font-sora">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-18 sm:text-20 font-bold text-adm-text tracking-tight">All Patients & Users</h1>
                    <p className="text-xs text-adm-muted mt-1 font-mono">{patients.length} registered</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-4">
                <div className="relative flex-1 sm:max-w-[280px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-adm-muted" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-adm-surface border border-adm-border rounded-md py-2 pl-9 pr-3 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors font-sora"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="flex-1 sm:flex-none bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-12 text-adm-text outline-none focus:border-adm-accent font-sora min-w-0 sm:min-w-[130px]"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="DISCHARGED">Discharged</option>
                    </select>
                    <select
                        value={verifyFilter}
                        onChange={(e) => setVerifyFilter(e.target.value)}
                        className="flex-1 sm:flex-none bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-12 text-adm-text outline-none focus:border-adm-accent font-sora min-w-0 sm:min-w-[130px]"
                    >
                        <option value="">All Users</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="UNVERIFIED">Unverified</option>
                    </select>
                </div>
            </div>

            <div className="bg-adm-card border border-adm-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Patient</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Age/Gender</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Injury</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">AIS</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Week</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Recovery</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Status</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border text-center">Verified</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map((p: any) => {
                                const age = p.dob ? Math.floor((new Date().getTime() - new Date(p.dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : '--';
                                const latestAssessment = p.assessments?.[0];
                                
                                const week = p.isVerified && p.verifiedAt 
                                    ? Math.max(1, Math.floor((new Date().getTime() - new Date(p.verifiedAt).getTime()) / (7 * 24 * 3600 * 1000)) + 1) 
                                    : '--';

                                const recoveryPct = latestAssessment?.recoveryPct || 0;

                                return (
                                    <tr 
                                        key={p.id} 
                                        onClick={() => setSelectedPatientId(p.id)}
                                        className="hover:bg-white/5 border-b border-adm-border2 last:border-none cursor-pointer transition-colors group"
                                    >
                                        <td className="p-3 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-adm-accent shrink-0">
                                                    {p.firstName[0]}{p.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="text-13 font-semibold text-adm-text group-hover:text-adm-accent transition-colors">
                                                        {p.firstName} {p.lastName}
                                                    </div>
                                                    <div className="font-mono text-11 text-adm-muted">#P{String(p.id).padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 px-4 text-xs text-adm-muted font-mono">{age}y / {p.gender[0]}</td>
                                        <td className="p-3 px-4 text-xs"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border text-adm-teal bg-adm-teal/10 border-adm-teal/20">{p.injuryLevel}</span></td>
                                        <td className="p-3 px-4 text-xs"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border text-adm-muted bg-adm-muted/10 border-adm-muted/20">{p.ais}</span></td>
                                        <td className="p-3 px-4 text-11 font-mono text-adm-muted">{week === '--' ? '--' : `W${week}`}</td>
                                        <td className="p-3 px-4">
                                            <div className="flex items-center gap-2 w-24">
                                                <div className="h-1.5 w-full bg-adm-border rounded-full overflow-hidden">
                                                    <div className="h-full bg-adm-accent" style={{ width: `${recoveryPct}%` }} />
                                                </div>
                                                <span className="text-10 font-bold text-adm-text w-6">{recoveryPct}%</span>
                                            </div>
                                        </td>
                                        <td className="p-3 px-4">{getStatusTag(p.status)}</td>
                                        <td className="p-3 px-4 text-center">
                                            {p.isVerified ? (
                                                <BadgeCheck className="w-5 h-5 text-[#3fb950] mx-auto" />
                                            ) : (
                                                <ShieldAlert className="w-5 h-5 text-adm-muted mx-auto" />
                                            )}
                                        </td>
                                        <td className="p-3 px-4 text-right">
                                            <div className="flex justify-end items-center gap-1 sm:gap-2">
                                                {!p.isVerified && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-[#3fb950] hover:bg-[#3fb950]/10 hover:text-[#3fb950] border border-[#3fb950]/20 text-xs px-2.5 py-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/admin/add-patient/${p.id}`);
                                                        }}
                                                    >
                                                        Verify
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-xs px-2.5 py-1 text-adm-muted hover:text-adm-text hover:bg-white/5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/add-patient/${p.id}`);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <button
                                                    type="button"
                                                    title={`Delete user ${p.firstName} ${p.lastName}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteTarget(p);
                                                    }}
                                                    className="p-1.5 rounded-lg text-adm-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="p-10 text-center text-adm-muted text-sm border-none">
                                        No patients found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Patient Deep Dive Modal */}
            {selectedPatientId && (
                <PatientModal
                    patientId={selectedPatientId}
                    onClose={() => setSelectedPatientId(null)}
                    onUpdated={() => {
                        setPatients(prev => prev.filter(p => p.id !== selectedPatientId));
                        setSelectedPatientId(null);
                        router.refresh();
                    }}
                />
            )}

            {/* Delete User Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[1200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-adm-card border border-adm-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 font-sora">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-adm-text">Delete Patient & User</h3>
                                <p className="text-xs text-adm-muted font-mono">Permanent system removal</p>
                            </div>
                        </div>

                        <p className="text-xs text-adm-muted leading-relaxed mb-4">
                            Are you sure you want to permanently delete <strong className="text-adm-text">{deleteTarget.firstName} {deleteTarget.lastName}</strong> (#P{String(deleteTarget.id).padStart(4, '0')})?
                        </p>

                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-11 text-red-300 leading-normal mb-6 space-y-1">
                            <div className="font-semibold text-red-400">⚠️ This action will permanently remove:</div>
                            <ul className="list-disc pl-4 space-y-0.5 text-10 text-red-300/90 font-mono">
                                <li>User credentials & login account</li>
                                <li>Clinical baseline profile & 3D pain records</li>
                                <li>Daily health logs & progress assessments</li>
                                <li>Cloudinary medical report documents</li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-end gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isDeleting}
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>Yes, Delete User</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
