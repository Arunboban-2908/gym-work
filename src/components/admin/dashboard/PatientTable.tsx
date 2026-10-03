import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface PatientRow {
    id: number;
    firstName: string;
    lastName: string;
    injuryLevel: string;
    ais: string;
    status: string;
    latestWeek: number | null;
    latestRecoveryPct: number | null;
}

interface PatientTableProps {
    patients: PatientRow[];
}

function getStatusTag(status: string) {
    const map: Record<string, string> = {
        ACTIVE: 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/20',
        DISCHARGED: 'text-adm-muted bg-adm-muted/10 border-adm-muted/20',
        CRITICAL: 'text-adm-danger bg-adm-danger/10 border-adm-danger/20',
    };
    const displayName: Record<string, string> = {
        ACTIVE: 'Active',
        DISCHARGED: 'Discharged',
        CRITICAL: 'Critical',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border ${map[status] || map.ACTIVE}`}>
            {displayName[status] || status}
        </span>
    );
}

export function PatientTable({ patients }: PatientTableProps) {
    return (
        <div className="bg-adm-card border border-adm-border rounded-xl mb-4 overflow-hidden">
            <div className="p-4 border-b border-adm-border2 flex justify-between items-center">
                <div className="text-13 font-semibold text-adm-text">Patient Overview</div>
                <Link href="/admin/patients"><Button variant="ghost" size="sm">View All →</Button></Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Patient</th>
                            <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Injury</th>
                            <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">AIS</th>
                            <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Week</th>
                            <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Recovery</th>
                            <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(p => (
                            <tr key={p.id} className="hover:bg-white/5 border-b border-adm-border2 last:border-none">
                                <td className="p-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-adm-accent shrink-0">
                                            {p.firstName[0]}{p.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="text-13 font-semibold text-adm-text">{p.firstName} {p.lastName}</div>
                                            <div className="font-mono text-11 text-adm-muted">#P{String(p.id).padStart(4, '0')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 px-4 text-xs">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border text-adm-teal bg-adm-teal/10 border-adm-teal/20">{p.injuryLevel}</span>
                                </td>
                                <td className="p-3 px-4 text-xs">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border text-adm-muted bg-adm-muted/10 border-adm-muted/20">{p.ais}</span>
                                </td>
                                <td className="p-3 px-4 text-11 font-mono text-adm-muted">W{p.latestWeek ?? '-'}</td>
                                <td className="p-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-14 bg-adm-border rounded-full overflow-hidden">
                                            <div className="h-full bg-adm-accent" style={{ width: `${p.latestRecoveryPct ?? 0}%` }} />
                                        </div>
                                        <span className="text-10 font-bold text-adm-text">{p.latestRecoveryPct ?? 0}%</span>
                                    </div>
                                </td>
                                <td className="p-3 px-4">{getStatusTag(p.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
