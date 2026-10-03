'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import {
    PatientHeader,
    QuickActionsSection,
    HealthMetricsSection,
    TodayPlanSection,
    DailyCheckInSection,
    WaterIntakeSection,
    MedicationsSection,
    NotificationsSection,
    EmergencyContactSection
} from './home-patient';

export function PatientHome({ patient }: { patient: any }) {
    const { toast } = useToast();
    const router = useRouter();

    const daily = patient.dailyCheckIns?.[0] || {};
    const [pain, setPain] = useState<number | null>(daily.pain ?? null);
    const [mood, setMood] = useState<string | null>(daily.mood ?? null);

    useEffect(() => {
        import('@/actions/patient-daily').then(m => m.seedDailyDataIfNeeded(patient.id));
    }, [patient.id]);

    const handleNavigate = (tab: string) => {
        if (tab === 'home') router.push('/user');
        else if (tab === 'ai') router.push('/user/chat');
        else router.push(`/user/${tab}`);
    };

    if (!patient) return null;

    return (
        <div className="flex-1 flex flex-col pb-4 h-full relative">
            <PatientHeader patient={patient} />

            <div className="px-3.5 pt-3 lg:p-6 lg:pt-6 flex-1 w-full max-w-container-xl mx-auto">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start w-full">
                    {/* Left Column */}
                    <div className="flex flex-col">
                        <QuickActionsSection
                            onNavigate={handleNavigate}
                            onCallTherapist={() => toast('📞 Connecting to Therapist...', 'info')}
                        />
                        <HealthMetricsSection
                            onSync={() => toast('Syncing health data...', 'info')}
                        />
                        <TodayPlanSection
                            onNavigate={handleNavigate}
                            assignedExercises={patient.assignedExercises || []}
                        />
                        <DailyCheckInSection
                            patientId={patient.id}
                            pain={pain}
                            setPain={setPain}
                            mood={mood}
                            setMood={setMood}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col mt-3 mb-10 lg:mt-0">
                        <WaterIntakeSection patientId={patient.id} initialWater={daily.water || 0} />
                        <MedicationsSection medications={patient.medications || []} />
                        <NotificationsSection
                            patientId={patient.id}
                            notifications={patient.notifications || []}
                            onClear={() => toast('Notifications cleared', 'success')}
                        />
                        <EmergencyContactSection
                            patient={patient}
                            onCallEmergency={() => toast('Calling Dr. Sarah Chen...', 'info')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
