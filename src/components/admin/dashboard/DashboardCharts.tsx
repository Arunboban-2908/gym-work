'use client';

import { ChartCard } from '@/components/ui/ChartCard';
import type { ChartData, ChartOptions } from 'chart.js';

interface DashboardChartsProps {
    recoveryData: ChartData<'line'>;
    injuryData: ChartData<'doughnut'>;
    motorData: ChartData<'bar'>;
}

export function DashboardCharts({ recoveryData, injuryData, motorData }: DashboardChartsProps) {
    return (
        <>
            <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-4">
                <ChartCard title="Recovery Trends" subtitle="Last 8 weeks" type="line" data={recoveryData} />
                <ChartCard title="Injury Tracking" type="doughnut" data={injuryData} options={{ cutout: '75%' } as ChartOptions<'doughnut'>} />
            </div>
        </>
    );
}

export function MotorChart({ motorData }: { motorData: ChartData<'bar'> }) {
    return <ChartCard title="Motor Domain Averages" type="bar" data={motorData} />;
}
