interface StatsCardsProps {
    totalPatients: number;
    activePatients: number;
    avgRecovery: number;
    criticalPatients: number;
}

export function StatsCards({ totalPatients, activePatients, avgRecovery, criticalPatients }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-adm-card border border-adm-border rounded-xl p-3 relative overflow-hidden after:absolute after:top-0 after:right-0 after:w-3px after:h-full after:bg-adm-accent">
                <div className="text-11 text-adm-muted font-medium uppercase tracking-wide mb-2">Total Patients</div>
                <div className="text-28 font-extrabold text-adm-text tracking-tight leading-none">{totalPatients}</div>
                <div className="text-11 mt-1.5 font-mono text-adm-accent2">{totalPatients} registered</div>
            </div>
            <div className="bg-adm-card border border-adm-border rounded-xl p-3 relative overflow-hidden after:absolute after:top-0 after:right-0 after:w-3px after:h-full after:bg-adm-accent2">
                <div className="text-11 text-adm-muted font-medium uppercase tracking-wide mb-2">Active Rehab</div>
                <div className="text-28 font-extrabold text-adm-text tracking-tight leading-none">{activePatients}</div>
                <div className="text-11 mt-1.5 font-mono text-adm-accent2">In treatment</div>
            </div>
            <div className="bg-adm-card border border-adm-border rounded-xl p-3 relative overflow-hidden after:absolute after:top-0 after:right-0 after:w-3px after:h-full after:bg-adm-warn">
                <div className="text-11 text-adm-muted font-medium uppercase tracking-wide mb-2">Avg Recovery %</div>
                <div className="text-28 font-extrabold text-adm-text tracking-tight leading-none">{avgRecovery}%</div>
                <div className="text-11 mt-1.5 font-mono text-adm-accent2">↑ improving</div>
            </div>
            <div className="bg-adm-card border border-adm-border rounded-xl p-3 relative overflow-hidden after:absolute after:top-0 after:right-0 after:w-3px after:h-full after:bg-adm-danger">
                <div className="text-11 text-adm-muted font-medium uppercase tracking-wide mb-2">Critical Alerts</div>
                <div className="text-28 font-extrabold text-adm-text tracking-tight leading-none">{criticalPatients}</div>
                <div className="text-11 mt-1.5 font-mono text-adm-danger">Needs attention</div>
            </div>
        </div>
    );
}
