'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Plus, Trash2, Activity, Pill, UploadCloud, FileText, Image as ImageIcon, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { updatePatient } from '@/actions/patient';
import { addAssessment, deleteAssessment } from '@/actions/progress';
import { PersonalInfo } from '@/components/admin/add-patient/personal-info';
import { ClinicalDetails } from '@/components/admin/add-patient/clinical-details';

export default function EditPatientClient({ patient, allExercises }: { patient: any, allExercises: any[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pendingFile, setPendingFile] = useState<{ name: string, type: string, base64: string } | null>(null);

    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [assessmentData, setAssessmentData] = useState({
        week: patient.assessments?.length ? patient.assessments.length + 1 : 1,
        upperLimb: 0,
        trunk: 0,
        fineMotor: 0,
        sensory: 0,
        notes: ''
    });

    const [formData, setFormData] = useState({
        firstName: patient.firstName || '', 
        lastName: patient.lastName || '', 
        dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '', 
        gender: patient.gender || 'Male',
        phone: patient.phone || '', 
        email: patient.email || '', 
        injuryLevel: patient.injuryLevel || 'C1-C4', 
        ais: patient.ais || 'AIS A',
        therapist: patient.therapist || 'Dr. Sarah Chen', 
        program: patient.program || 'Acute Inpatient', 
        notes: patient.notes || '', 
        status: patient.status || 'ACTIVE',
        reports: [] as { name: string, type: string, base64: string }[]
    });

    const [selectedExercises, setSelectedExercises] = useState<{id: number, duration: number, freq: number}[]>(
        patient.assignedExercises ? patient.assignedExercises.map((e: any) => ({
            id: e.exerciseId,
            duration: e.durationMins,
            freq: e.frequencyPerWeek
        })) : []
    );

    const [medications, setMedications] = useState<{name: string, dosage: string, time: string}[]>(
        patient.medications ? patient.medications.map((m: any) => ({
            name: m.name, dosage: m.dosage, time: m.time
        })) : []
    );

    const handleChange = (e: any) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPendingFile({
                name: file.name,
                type: file.type.includes('pdf') ? 'pdf' : 'photo',
                base64: event.target?.result as string
            });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // reset input
    };

    const confirmFileUpload = (customName: string) => {
        if (!pendingFile) return;
        setFormData(prev => ({
            ...prev,
            reports: [...prev.reports, {
                ...pendingFile,
                name: customName || pendingFile.name
            }]
        }));
        setPendingFile(null);
    };

    const removeReport = (index: number) => {
        setFormData(prev => ({
            ...prev,
            reports: prev.reports.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async (verify: boolean = false) => {
        try {
            setIsSubmitting(true);
            setErrors({});

            // basic validation
            if (!formData.firstName || !formData.lastName || !formData.email) {
                toast('Please fill all required personal information fields.', 'error');
                setIsSubmitting(false);
                return;
            }

            const payload = {
                ...formData,
                exercises: selectedExercises,
                medications: medications,
                isVerified: verify ? true : patient.isVerified
            };

            const res = await updatePatient(patient.id, payload);

            if (res.success) {
                toast(verify ? 'Patient verified and saved successfully!' : 'Patient updated successfully!', 'success');
                router.push('/admin/patients');
            } else {
                toast(res.error || 'Failed to update patient', 'error');
            }
        } catch (e) {
            toast('An error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddAssessment = async () => {
        try {
            setIsSubmitting(true);
            const res = await addAssessment(patient.id, assessmentData);
            if (res.success) {
                toast('Assessment logged successfully!', 'success');
                setIsAssessmentModalOpen(false);
                router.refresh();
            } else {
                toast(res.error || 'Failed to log assessment', 'error');
            }
        } catch (e) {
            toast('Error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAssessment = async (id: number) => {
        if (!confirm('Are you sure you want to delete this assessment?')) return;
        const res = await deleteAssessment(id, patient.id);
        if (res.success) {
            toast('Assessment deleted', 'success');
            router.refresh();
        } else {
            toast(res.error || 'Failed', 'error');
        }
    };

    const toggleExercise = (exId: number) => {
        if (selectedExercises.find(e => e.id === exId)) {
            setSelectedExercises(prev => prev.filter(e => e.id !== exId));
        } else {
            setSelectedExercises(prev => [...prev, { id: exId, duration: 15, freq: 7 }]);
        }
    };

    const addMedication = () => {
        setMedications(prev => [...prev, { name: '', dosage: '', time: '8:00 AM' }]);
    };

    const updateMedication = (index: number, field: string, value: string) => {
        setMedications(prev => {
            const newMeds = [...prev];
            newMeds[index] = { ...newMeds[index], [field]: value };
            return newMeds;
        });
    };

    const removeMedication = (index: number) => {
        setMedications(prev => prev.filter((_, i) => i !== index));
    };

    const getInputClass = (fieldName: string, isSelect?: boolean) => {
        return `w-full bg-adm-surface border ${errors[fieldName] ? 'border-red-500' : 'border-adm-border'} rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors font-sora`;
    };

    const getIconClass = (fieldName: string) => '';

    return (
        <div className="p-6 pb-20">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-20 font-bold text-adm-text tracking-tight">{!patient.isVerified ? 'Verify & Edit Patient Setup' : 'Edit Patient Setup'}</h1>
                    <p className="text-xs text-adm-muted mt-1 font-mono">#{String(patient.id).padStart(4, '0')} - {patient.firstName} {patient.lastName}</p>
                </div>
                <Link href="/admin/patients">
                    <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto">
                
                {/* Reused Components */}
                <PersonalInfo
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    getInputClass={getInputClass}
                    getIconClass={getIconClass}
                />

                <ClinicalDetails
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    getInputClass={getInputClass}
                    getIconClass={getIconClass}
                />

                {/* Clinical Reports */}
                <div className="bg-adm-card border border-adm-border rounded-xl p-6 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-adm-muted mb-4 pb-2.5 border-b border-adm-border2">Clinical Reports (Optional)</h2>
                    <div className="border-2 border-dashed border-adm-border rounded-xl p-8 text-center bg-adm-surface hover:border-adm-accent/50 transition-colors">
                        <UploadCloud className="w-8 h-8 text-adm-muted mx-auto mb-3" />
                        <div className="text-sm font-semibold text-adm-text mb-1">Upload Assessments & Scans</div>
                        <div className="text-11 text-adm-muted mb-4">PDF, JPG, PNG up to 10MB</div>
                        <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-adm-text border border-adm-border px-4 py-2 rounded-lg text-xs font-semibold transition-colors inline-block">
                            Browse File
                            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" />
                        </label>
                    </div>

                    {formData.reports.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {formData.reports.map((report, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-adm-surface border border-adm-border p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-adm-bg flex items-center justify-center">
                                            {report.type === 'pdf' ? <FileText className="w-4 h-4 text-red-400" /> : <ImageIcon className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <div className="text-xs font-semibold text-adm-text truncate max-w-[200px]">{report.name}</div>
                                    </div>
                                    <button onClick={() => removeReport(idx)} className="text-adm-muted hover:text-red-400 p-1 transition-colors"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clinical Assessments */}
                <div className="bg-adm-card border border-adm-border rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#10b981]" />
                            <h2 className="text-xs font-bold uppercase tracking-wide text-adm-muted">Progress Assessments</h2>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsAssessmentModalOpen(true)} className="h-8">
                            <Plus className="w-3 h-3 mr-1" /> Log Assessment
                        </Button>
                    </div>

                    {!patient.assessments || patient.assessments.length === 0 ? (
                        <div className="text-center py-6 text-adm-muted text-sm border border-dashed border-adm-border rounded-lg">
                            No assessments logged yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {patient.assessments.map((a: any) => (
                                <div key={a.id} className="flex items-center justify-between bg-adm-surface p-3 rounded-lg border border-adm-border">
                                    <div className="flex gap-6 items-center">
                                        <div className="bg-adm-bg px-3 py-1.5 rounded text-xs font-bold text-adm-accent">
                                            Week {a.week}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-adm-muted">
                                            <div><span className="font-semibold text-adm-text">{a.recoveryPct}%</span> Recovery</div>
                                            <div>Upper: {a.upperLimb}</div>
                                            <div>Trunk: {a.trunk}</div>
                                            <div>Fine: {a.fineMotor}</div>
                                            <div>Sensory: {a.sensory}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteAssessment(a.id)} className="p-2 text-adm-muted hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Exercises */}
                <div className="bg-adm-card border border-adm-border rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-adm-accent" />
                        <h2 className="text-xs font-bold uppercase tracking-wide text-adm-muted">Assign Exercises</h2>
                    </div>
                    {allExercises.length === 0 ? (
                        <div className="text-center py-6 text-adm-muted text-sm border border-dashed border-adm-border rounded-lg">
                            No exercises available in the library. Please add them in the Exercise Library first.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {allExercises.map(ex => {
                            const isSelected = selectedExercises.find(e => e.id === ex.id);
                            return (
                                <div key={ex.id} onClick={() => toggleExercise(ex.id)} className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-adm-accent bg-adm-accent/10' : 'border-adm-border bg-adm-surface hover:bg-white/5'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-sm text-adm-text">{ex.name}</div>
                                        <div className={`w-4 h-4 rounded text-xs flex items-center justify-center ${isSelected ? 'bg-adm-accent text-white' : 'border border-adm-muted text-transparent'}`}>{isSelected && '✓'}</div>
                                    </div>
                                    <div className="text-xs text-adm-muted mb-2">{ex.difficulty} • {ex.target}</div>
                                    
                                    {isSelected && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-adm-border/50" onClick={e => e.stopPropagation()}>
                                            <div className="flex-1">
                                                <label className="text-10 text-adm-muted mb-1 block">Duration (min)</label>
                                                <input type="number" min="1" className="w-full bg-adm-bg border border-adm-border rounded px-2 py-1 text-xs text-white" value={isSelected.duration} onChange={e => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    setSelectedExercises(prev => prev.map(p => p.id === ex.id ? {...p, duration: val} : p));
                                                }} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-10 text-adm-muted mb-1 block">Days/Week</label>
                                                <input type="number" min="1" max="7" className="w-full bg-adm-bg border border-adm-border rounded px-2 py-1 text-xs text-white" value={isSelected.freq} onChange={e => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    setSelectedExercises(prev => prev.map(p => p.id === ex.id ? {...p, freq: val} : p));
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        </div>
                    )}
                </div>

                {/* Medications */}
                <div className="bg-adm-card border border-adm-border rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-[#d97706]" />
                            <h2 className="text-xs font-bold uppercase tracking-wide text-adm-muted">Medications</h2>
                        </div>
                        <Button variant="outline" size="sm" onClick={addMedication} className="h-8">
                            <Plus className="w-3 h-3 mr-1" /> Add Medication
                        </Button>
                    </div>

                    {medications.length === 0 ? (
                        <div className="text-center py-6 text-adm-muted text-sm border border-dashed border-adm-border rounded-lg">
                            No medications added.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {medications.map((med, i) => (
                                <div key={i} className="flex gap-3 items-center bg-adm-surface p-3 rounded-lg border border-adm-border">
                                    <div className="flex-1">
                                        <input type="text" placeholder="Medication Name (e.g. Baclofen)" value={med.name} onChange={e => updateMedication(i, 'name', e.target.value)} className="w-full bg-adm-bg border border-adm-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-adm-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <input type="text" placeholder="Dosage (e.g. 10mg)" value={med.dosage} onChange={e => updateMedication(i, 'dosage', e.target.value)} className="w-full bg-adm-bg border border-adm-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-adm-accent" />
                                    </div>
                                    <div className="w-32">
                                        <input type="text" placeholder="Time (e.g. 8:00 AM)" value={med.time} onChange={e => updateMedication(i, 'time', e.target.value)} className="w-full bg-adm-bg border border-adm-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-adm-accent" />
                                    </div>
                                    <button onClick={() => removeMedication(i)} className="p-2 text-adm-muted hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/admin/patients"><Button variant="ghost" disabled={isSubmitting}>Cancel</Button></Link>
                    {!patient.isVerified && (
                        <Button variant="outline" className="text-adm-accent border-adm-accent" onClick={() => handleSave(true)} disabled={isSubmitting}>
                            {isSubmitting ? 'Verifying...' : 'Verify & Setup'}
                        </Button>
                    )}
                    <Button variant="primary" onClick={() => handleSave(false)} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Patient'}
                    </Button>
                </div>
            </div>

            {/* Document Naming Modal */}
            {pendingFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-adm-card border border-adm-border rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-sm font-bold text-adm-text mb-2">Name Document</h3>
                        <p className="text-xs text-adm-muted mb-4">Provide a descriptive name for this clinical report.</p>
                        
                        <input 
                            type="text" 
                            className="w-full bg-adm-surface border border-adm-border rounded-lg px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent mb-5 font-sora"
                            placeholder="e.g. Initial MRI Scan"
                            defaultValue={pendingFile.name.split('.')[0]}
                            id="docNameInput"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" size="sm" onClick={() => setPendingFile(null)}>Cancel</Button>
                            <Button variant="primary" size="sm" onClick={() => {
                                const input = document.getElementById('docNameInput') as HTMLInputElement;
                                confirmFileUpload(input.value);
                            }}>Add Document</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Assessment Modal */}
            {isAssessmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-adm-card border border-adm-border rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-sm font-bold text-adm-text mb-1">Log Clinical Assessment</h3>
                        <p className="text-xs text-adm-muted mb-5 pb-4 border-b border-adm-border">Record the patient's neurological progress points (out of 25 for each category).</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Week Number</label>
                                <input type="number" className="w-full bg-adm-surface border border-adm-border rounded-lg px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent font-sora" value={assessmentData.week} onChange={e => setAssessmentData({...assessmentData, week: parseInt(e.target.value) || 1})} />
                            </div>
                            <div></div> {/* spacer */}
                            
                            <div>
                                <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Upper Limb (0-25)</label>
                                <input type="number" max="25" className="w-full bg-adm-surface border border-adm-border rounded-lg px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent font-sora" value={assessmentData.upperLimb} onChange={e => setAssessmentData({...assessmentData, upperLimb: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Trunk (0-25)</label>
                                <input type="number" max="25" className="w-full bg-adm-surface border border-adm-border rounded-lg px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent font-sora" value={assessmentData.trunk} onChange={e => setAssessmentData({...assessmentData, trunk: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Fine Motor (0-25)</label>
                                <input type="number" max="25" className="w-full bg-adm-surface border border-adm-border rounded-lg px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent font-sora" value={assessmentData.fineMotor} onChange={e => setAssessmentData({...assessmentData, fineMotor: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Sensory (0-25)</label>
                                <input type="number" max="25" className="w-full bg-adm-surface border border-adm-border rounded-lg px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent font-sora" value={assessmentData.sensory} onChange={e => setAssessmentData({...assessmentData, sensory: parseInt(e.target.value) || 0})} />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Therapist Notes</label>
                            <textarea className="w-full bg-adm-surface border border-adm-border rounded-lg px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent font-sora min-h-[60px]" placeholder="Observation notes..." value={assessmentData.notes} onChange={e => setAssessmentData({...assessmentData, notes: e.target.value})}></textarea>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div className="text-xs font-semibold text-adm-accent">
                                Estimated Recovery: {Math.min(100, assessmentData.upperLimb + assessmentData.trunk + assessmentData.fineMotor + assessmentData.sensory)}%
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" size="sm" onClick={() => setIsAssessmentModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button variant="primary" size="sm" onClick={handleAddAssessment} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Log Progress'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
