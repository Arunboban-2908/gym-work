'use client';

import React, { useState } from 'react';
import { FileText, Upload, Eye, Trash2, Plus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadPatientReport, deletePatientReport } from '@/actions/patient-health';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface MedicalDocumentsSectionProps {
    patientId: number;
    reports?: any[];
}

export function MedicalDocumentsSection({ patientId, reports = [] }: MedicalDocumentsSectionProps) {
    const { toast } = useToast();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [reportType, setReportType] = useState<string>('Blood Report');
    const [customTitle, setCustomTitle] = useState<string>('');
    const [uploading, setUploading] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast('Please select a file to upload.', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('reportType', reportType);
        formData.append('name', customTitle.trim() || file.name);

        const res = await uploadPatientReport(formData);

        if (res.success) {
            toast('Document uploaded securely to your medical chart.', 'success');
            setIsUploadOpen(false);
            setFile(null);
            setCustomTitle('');
        } else {
            toast(res.error || 'Upload failed. Please check file format and try again.', 'error');
        }
        setUploading(false);
    };

    const handleDelete = async (reportId: number) => {
        if (!confirm('Are you sure you want to remove this medical document?')) return;
        setDeletingId(reportId);
        const res = await deletePatientReport(reportId);
        if (res.success) {
            toast('Document removed.', 'success');
        } else {
            toast(res.error || 'Failed to delete report', 'error');
        }
        setDeletingId(null);
    };

    return (
        <div className="bg-pat-card border border-pat-border rounded-2xl p-5 mb-5 shadow-sm font-sora">
            <div className="flex items-center justify-between pb-3 border-b border-pat-border mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-pat-blue-soft flex items-center justify-center text-pat-blue">
                        <FileText size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-pat-navy">Medical Documents</h3>
                        <p className="text-11 text-pat-muted">Blood reports, doctor injury statements, and scans</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-pat-navy text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#152a45] transition-colors cursor-pointer shadow-sm"
                >
                    <Upload size={13} />
                    <span>Upload New</span>
                </button>
            </div>

            {reports.length === 0 ? (
                <div className="py-6 px-4 text-center rounded-xl bg-pat-bg border border-dashed border-pat-border text-xs text-pat-muted">
                    <p>No medical documents uploaded yet.</p>
                    <p className="text-10 text-pat-muted/70 mt-1">
                        You can upload blood panels, physician injury statements, or imaging for your rehabilitation team.
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="p-3 bg-pat-bg rounded-xl border border-pat-border text-xs flex items-center justify-between gap-3"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-pat-blue-soft text-pat-blue flex items-center justify-center shrink-0">
                                    <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-pat-navy truncate max-w-xs">{report.name}</div>
                                    <div className="text-10 text-pat-muted flex items-center gap-2 mt-0.5">
                                        <span className="uppercase font-mono">{report.type}</span>
                                        <span>•</span>
                                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                    href={report.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-white border border-pat-border text-pat-navy hover:bg-pat-blue-soft text-11 font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Eye size={13} />
                                    <span>View</span>
                                </a>
                                <button
                                    type="button"
                                    disabled={deletingId === report.id}
                                    onClick={() => handleDelete(report.id)}
                                    className="p-1.5 text-pat-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete document"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                title="Upload Medical Document"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsUploadOpen(false)} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleUploadSubmit} disabled={uploading || !file}>
                            {uploading ? 'Encrypting & Uploading...' : 'Upload Document'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 font-sora">
                    <div>
                        <label className="block text-xs font-semibold text-adm-muted mb-1.5 uppercase tracking-wider">
                            Document Type *
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full bg-adm-surface border border-adm-border rounded-xl px-3 py-2 text-xs text-adm-text outline-none focus:border-adm-accent"
                        >
                            <option value="Blood Report">Blood Report (Biomarkers, Lab Panel)</option>
                            <option value="Doctor Injury Statement">Doctor Injury Statement / Clinical Diagnosis</option>
                            <option value="Other Medical Report">Other Medical Report (X-Ray, MRI, Notes)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-adm-muted mb-1.5 uppercase tracking-wider">
                            Document Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="e.g. Spine MRI Scan Oct 2026"
                            className="w-full bg-adm-surface border border-adm-border rounded-xl px-3 py-2 text-xs text-adm-text outline-none focus:border-adm-accent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-adm-muted mb-1.5 uppercase tracking-wider">
                            Select File (PDF, PNG, JPG, WEBP - Max 10MB) *
                        </label>
                        <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full bg-adm-surface border border-adm-border rounded-xl p-2 text-xs text-adm-text file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-adm-accent file:text-white cursor-pointer"
                        />
                    </div>

                    <div className="p-3 bg-adm-surface/60 rounded-xl border border-adm-border/80 text-10 text-adm-muted flex items-start gap-2">
                        <Shield size={14} className="text-adm-accent shrink-0 mt-0.5" />
                        <span>
                            Security Note: Uploaded documents are encrypted and only accessible to you and your authorized clinical rehab administrators.
                        </span>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
