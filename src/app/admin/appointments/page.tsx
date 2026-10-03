'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { getAppointments, createAppointment, getVerifiedPatients, deleteAppointment } from '@/actions/appointment';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function AppointmentsList() {
    const { toast } = useToast();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [verifiedPatients, setVerifiedPatients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        patientId: '',
        type: 'Assessment',
        date: '',
        time: '10:00 AM',
        therapist: 'Dr. Sarah Chen',
        mode: 'In-Clinic'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [appRes, patRes] = await Promise.all([
            getAppointments(),
            getVerifiedPatients()
        ]);
        if (appRes.success) setAppointments(appRes.data || []);
        if (patRes.success) setVerifiedPatients(patRes.data || []);
        setIsLoading(false);
    };

    const handleSchedule = async () => {
        if (!formData.patientId || !formData.date) {
            toast('Please select a patient and date.', 'error');
            return;
        }

        setIsSubmitting(true);
        const result = await createAppointment({
            ...formData,
            patientId: parseInt(formData.patientId),
            date: new Date(formData.date)
        });

        if (result.success) {
            toast('Appointment scheduled successfully.', 'success');
            setIsModalOpen(false);
            setFormData(prev => ({ ...prev, patientId: '', date: '' }));
            loadData();
        } else {
            toast(result.error || 'Failed to schedule appointment.', 'error');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return;
        const result = await deleteAppointment(id);
        if (result.success) {
            toast('Appointment deleted successfully.', 'success');
            loadData();
        } else {
            toast(result.error || 'Failed to delete appointment.', 'error');
        }
    };

    return (
        <div className="p-6 pb-20">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-20 font-bold text-adm-text tracking-tight">Appointments</h1>
                    <p className="text-xs text-adm-muted mt-1 font-mono">{appointments.length} total</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Schedule
                </Button>
            </div>

            <div className="bg-adm-card border border-adm-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Patient</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Type</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Date & Time</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Therapist</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Mode</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Status</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center p-6 text-adm-muted">Loading appointments...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-6 text-adm-muted">No appointments found.</td></tr>
                            ) : appointments.map(app => {
                                const pt = app.patient;
                                return (
                                    <tr key={app.id} className="hover:bg-white/5 border-b border-adm-border2 last:border-none cursor-pointer transition-colors">
                                        <td className="p-3 px-4 text-13 font-semibold text-adm-text">
                                            {pt ? `${pt.firstName} ${pt.lastName}` : 'Unknown Patient'}
                                        </td>
                                        <td className="p-3 px-4 text-xs text-adm-muted">{app.type}</td>
                                        <td className="p-3 px-4 text-xs">
                                            <div className="flex gap-2">
                                                <span className="text-adm-text">{new Date(app.date).toLocaleDateString()}</span>
                                                <span className="text-adm-muted font-mono">{app.time}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 px-4 text-xs text-adm-muted">{app.therapist}</td>
                                        <td className="p-3 px-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border text-adm-accent border-adm-accent/20 bg-adm-accent/10">
                                                {app.mode}
                                            </span>
                                        </td>
                                        <td className="p-3 px-4 text-xs"><span className="text-[#3fb950] font-semibold">{app.status}</span></td>
                                        <td className="p-3 px-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }} className="text-red-400 hover:text-red-500 hover:bg-red-400/10">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Schedule Appointment"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button variant="primary" onClick={handleSchedule} disabled={isSubmitting}>
                            {isSubmitting ? 'Scheduling...' : 'Schedule'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-adm-muted mb-1.5">Verified Patient *</label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                        >
                            <option value="">Select patient...</option>
                            {verifiedPatients.map(p => (
                                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                            ))}
                        </select>
                        {verifiedPatients.length === 0 && (
                            <p className="text-10 text-adm-danger mt-1">No verified patients available.</p>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Date *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Time</label>
                            <select
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            >
                                <option>09:00 AM</option>
                                <option>10:00 AM</option>
                                <option>11:00 AM</option>
                                <option>01:00 PM</option>
                                <option>02:00 PM</option>
                                <option>03:00 PM</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Appointment Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            >
                                <option>Assessment</option>
                                <option>Therapy Session</option>
                                <option>Follow-up</option>
                                <option>Consultation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Mode</label>
                            <select
                                value={formData.mode}
                                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            >
                                <option>In-Clinic</option>
                                <option>Virtual</option>
                                <option>Home Visit</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
