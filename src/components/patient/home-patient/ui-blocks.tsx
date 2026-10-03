import React from 'react';

export function Section({ title, action, onAction, children }: any) {
    return (
        <>
            <div className="flex justify-between items-center text-10 font-bold uppercase tracking-[1px] text-pat-muted mb-2 mt-1 px-1">
                {title}
                {action && <span onClick={onAction} className="text-pat-blue cursor-pointer">{action}</span>}
            </div>
            {children}
        </>
    );
}

export function QuickAction({ icon, label, color, onClick }: any) {
    return (
        <div onClick={onClick} className="bg-pat-card rounded-14px py-3 px-1.5 border border-pat-border flex flex-col items-center gap-1.5 cursor-pointer shadow-sm hover:-translate-y-0.5 transition-all">
            <div className={`w-34px h-34px rounded-lg flex items-center justify-center text-16 ${color}`}>{icon}</div>
            <span className="text-9 font-bold text-pat-muted text-center tracking-[0.2px] leading-tight">{label}</span>
        </div>
    );
}

export function HealthMetric({ icon, label, value, unit, trend, trendColor, bg }: any) {
    return (
        <div className="bg-pat-card rounded-2xl p-3 border border-pat-border shadow-sm flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-10px flex items-center justify-center text-16 ${bg}`}>{icon}</div>
            <div>
                <div className="text-16 font-extrabold text-pat-text leading-none">{value} <span className="text-11 font-medium text-pat-muted">{unit}</span></div>
                <div className="text-10 text-pat-muted font-medium mt-px">{label}</div>
                <div className={`text-10 font-bold mt-0.5 ${trendColor}`}>{trend}</div>
            </div>
        </div>
    );
}
