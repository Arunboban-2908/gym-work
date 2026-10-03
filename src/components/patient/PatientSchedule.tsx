'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export function PatientSchedule() {
    const activePatientId = useAppStore(s => s.activePatientId);
    const allAppointments = useAppStore(s => s.appointments);
    const appointments = allAppointments.filter(a => a.patientId === activePatientId);

    const getMonthName = (dateStr: string) => {
        const [yyyy, mm] = dateStr.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[parseInt(mm, 10) - 1];
    };

    const getDayNumber = (dateStr: string) => {
        const [, , dd] = dateStr.split('-');
        return parseInt(dd, 10).toString();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-pat-bg font-sora pb-6 relative">
            <div className="bg-gradient-to-br from-[#1c3557] to-[#1e4a7a] px-5.5 py-4 shrink-0 lg:sticky lg:top-0 lg:z-50 shadow-md">
                <div className="text-10 text-white/50 font-medium tracking-[0.5px] uppercase mb-0.5">My Schedule</div>
                <div className="text-20 font-extrabold text-white tracking-tight leading-tight">Appointments</div>
            </div>

            <div className="px-3.5 pt-4 lg:p-6 flex-1 w-full max-w-container-xl mx-auto">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start w-full">
                    {/* Left Column */}
                    <div className="flex flex-col">
                        <div className="text-10 font-bold uppercase tracking-[1px] text-pat-muted mb-2 px-1">Upcoming</div>
                        <div className="space-y-3 mb-5 lg:mb-0">
                            {appointments.map((appt, i) => (
                                <div key={i} className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm flex gap-3 hover:-translate-y-0.5 transition-transform cursor-pointer">
                                    <div className="w-13 h-14 rounded-xl bg-pat-blue-soft border border-pat-blue/20 flex flex-col items-center justify-center shrink-0 shadow-sm">
                                        <div className="text-10 uppercase font-bold text-pat-blue tracking-wide">{getMonthName(appt.date)}</div>
                                        <div className="text-20 font-extrabold text-pat-navy leading-none mt-0.5">{getDayNumber(appt.date)}</div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="text-13 font-extrabold text-pat-text truncate">{appt.type}</div>
                                        <div className="text-11 text-pat-muted mt-0.5 truncate">{appt.therapist}</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-9 font-bold bg-pat-bg border border-pat-border text-pat-muted px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-pat-blue" />
                                                {appt.time}
                                            </span>
                                            <span className="text-9 font-bold bg-[#dcfce7] text-[#16a34a] px-2 py-0.5 rounded-md">
                                                {appt.mode}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="text-center text-12 text-pat-muted py-6 bg-pat-card rounded-2xl border border-pat-border">No upcoming appointments.</div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col mt-2 lg:mt-0">
                        <div className="text-10 font-bold uppercase tracking-[1px] text-pat-muted mb-2 px-1">Care Team</div>
                        <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm divide-y divide-pat-border">
                            {[
                                { name: 'Dr. Sarah Chen', role: 'Lead Neurologist', color: 'bg-blue-600' },
                                { name: 'Mark Rivera, PT', role: 'Physiotherapist', color: 'bg-teal-600' },
                                { name: 'James Wong, OT', role: 'Occupational Therapist', color: 'bg-amber-600' },
                            ].map((ct, i) => (
                                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-12 font-bold text-white shadow-md ${ct.color}`}>
                                        {ct.name.split(' ')[0][0]}{ct.name.split(' ')[1][0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-12 font-bold text-pat-text">{ct.name}</div>
                                        <div className="text-10 text-pat-muted">{ct.role}</div>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-pat-bg border border-pat-border flex items-center justify-center hover:bg-pat-blue-soft transition-colors text-pat-blue">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
