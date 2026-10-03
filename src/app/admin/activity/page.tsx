import React from 'react';

export default function ActivityPage() {
    return (
        <div className="p-6 pb-20">
            <div className="mb-6">
                <h1 className="text-20 font-bold text-adm-text tracking-tight">Activity Log</h1>
                <p className="text-xs text-adm-muted mt-1 font-mono">System-wide activity events and alerts.</p>
            </div>

            <div className="bg-adm-card border border-adm-border rounded-xl overflow-hidden flex flex-col max-w-2xl">
                <div className="p-4 border-b border-adm-border2 flex justify-between items-center shrink-0">
                    <div className="text-13 font-semibold text-adm-text">Recent Events</div>
                </div>
                <div className="p-4 overflow-y-auto space-y-4">
                    {[
                        { time: '10:45 AM', msg: 'James Mitchell started daily exercise routine.', color: '#2f81f7' },
                        { time: '09:30 AM', msg: 'Dr. Sarah Chen updated clinical notes for Maria.', color: '#3fb950' },
                        { time: '08:15 AM', msg: 'Aisha Okonkwo critical vitals alert triggered.', color: '#f85149' },
                        { time: 'Yesterday', msg: 'Robert Kim reached 75% recovery milestone!', color: '#d29922' },
                    ].map((log, i) => (
                        <div key={i} className="flex gap-3 items-start p-2 rounded-md hover:bg-white/5 transition-colors">
                            <div className="font-mono text-10 text-adm-muted w-16 shrink-0 pt-1">{log.time}</div>
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: log.color }} />
                            <div className="text-sm text-adm-text font-medium leading-relaxed">{log.msg}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
