import { getPatients, getRecentActivity } from '@/actions/patient';
import type { PatientWithAssessments, ActivityLogEntry, AssessmentData } from '@/actions/patient';
import {
    DashboardHeader,
    StatsCards,
    DashboardCharts,
    MotorChart,
    PatientTable,
    ActivityFeed,
} from '@/components/admin/dashboard';

export default async function AdminDashboard() {
    const [patientsRes, activityRes] = await Promise.all([
        getPatients(),
        getRecentActivity(4),
    ]);

    const patients: PatientWithAssessments[] = patientsRes.success ? patientsRes.data : [];
    const activities: ActivityLogEntry[] = activityRes.success ? activityRes.data : [];

    // ── Stats ──
    const activePatients = patients.filter(p => p.status === 'ACTIVE').length;
    const criticalPatients = patients.filter(p => p.status === 'CRITICAL').length;

    const latestAssessments: AssessmentData[] = patients
        .map(p => p.assessments[0])
        .filter((a): a is AssessmentData => !!a);

    const avgRecovery = latestAssessments.length
        ? Math.round(latestAssessments.reduce((a, b) => a + b.recoveryPct, 0) / latestAssessments.length)
        : 0;

    // ── Recovery trends (weekly averages) ──
    const allAssessments = patients.flatMap(p => p.assessments);
    const weeklyMap = new Map<number, number[]>();
    allAssessments.forEach(a => {
        const existing = weeklyMap.get(a.week) || [];
        existing.push(a.recoveryPct);
        weeklyMap.set(a.week, existing);
    });
    const sortedWeeks = [...weeklyMap.keys()].sort((a, b) => a - b).slice(-8);
    const weeklyAvgData = sortedWeeks.map(w => {
        const vals = weeklyMap.get(w)!;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    });

    // ── Chart data ──
    const recoveryData = {
        labels: sortedWeeks.length > 0 ? sortedWeeks.map(w => `W${w}`) : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
        datasets: [{
            data: weeklyAvgData.length > 0 ? weeklyAvgData : [0],
            borderColor: '#2f81f7',
            backgroundColor: 'rgba(47,129,247,0.1)',
            fill: true,
            tension: 0.4,
        }],
    };

    const injuryData = {
        labels: ['Cervical', 'Thoracic', 'Lumbar'],
        datasets: [{
            data: [
                patients.filter(p => p.injuryLevel.startsWith('C')).length,
                patients.filter(p => p.injuryLevel.startsWith('T')).length,
                patients.filter(p => p.injuryLevel.startsWith('L')).length,
            ],
            backgroundColor: ['#2f81f7', '#3fb950', '#d29922'],
            borderWidth: 0,
        }],
    };

    const motorData = {
        labels: ['Upper Limb', 'Trunk', 'Fine Motor', 'Sensory'],
        datasets: [{
            data: latestAssessments.length > 0
                ? [
                    Math.round(latestAssessments.reduce((a, b) => a + b.upperLimb, 0) / latestAssessments.length),
                    Math.round(latestAssessments.reduce((a, b) => a + b.trunk, 0) / latestAssessments.length),
                    Math.round(latestAssessments.reduce((a, b) => a + b.fineMotor, 0) / latestAssessments.length),
                    Math.round(latestAssessments.reduce((a, b) => a + b.sensory, 0) / latestAssessments.length),
                ]
                : [0, 0, 0, 0],
            backgroundColor: ['#2f81f7', '#3fb950', '#d29922', '#f85149'],
            borderRadius: 4,
        }],
    };

    // ── Table rows ──
    const tableRows = patients.slice(0, 5).map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        injuryLevel: p.injuryLevel,
        ais: p.ais,
        status: p.status,
        latestWeek: p.assessments[0]?.week ?? null,
        latestRecoveryPct: p.assessments[0]?.recoveryPct ?? null,
    }));

    // ── Activity feed (serialize dates for client) ──
    const activityItems = activities.map(a => ({
        id: a.id,
        message: a.message,
        color: a.color,
        createdAt: a.createdAt.toISOString(),
    }));

    return (
        <div className="p-6 pb-19">
            <DashboardHeader />

            <StatsCards
                totalPatients={patients.length}
                activePatients={activePatients}
                avgRecovery={avgRecovery}
                criticalPatients={criticalPatients}
            />

            <DashboardCharts
                recoveryData={recoveryData}
                injuryData={injuryData}
                motorData={motorData}
            />

            <PatientTable patients={tableRows} />

            <div className="grid grid-cols-2 gap-4">
                <MotorChart motorData={motorData} />
                <ActivityFeed activities={activityItems} />
            </div>
        </div>
    );
}
