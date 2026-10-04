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
    EmergencyContactSection,
    TodaysHealthStatusSection,
    MedicalDocumentsSection,
    HealthBaselineCard,
    RecoveryProgressSection
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

    const initialPainLocations = (patient.painLocations || []).map((p: any) => p.bodyPart);

    return (
        <div className="flex-1 flex flex-col pb-4 h-full relative">
            <PatientHeader patient={patient} />

            <div className="px-3.5 pt-3 lg:p-6 lg:pt-6 flex-1 w-full max-w-container-xl mx-auto">
                {/* Baseline Health Profile Banner (Model 1) */}
                <HealthBaselineCard patient={patient} />

                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start w-full">
                    {/* Left Column */}
                    <div className="flex flex-col">
                        {/* Today's Health Status (Model 2 Historical Logging) */}
                        <TodaysHealthStatusSection
                            patientId={patient.id}
                            initialPainLocations={initialPainLocations}
                            healthUpdates={patient.healthUpdates || []}
                        />

                        {/* Recovery & Discomfort Trends */}
                        <RecoveryProgressSection
                            healthUpdates={patient.healthUpdates || []}
                            assessments={patient.assessments || []}
                        />

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
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col mt-3 mb-10 lg:mt-0">
                        {/* Medical Documents (Cloudinary) */}
                        <MedicalDocumentsSection
                            patientId={patient.id}
                            reports={patient.reports || []}
                        />

                        <DailyCheckInSection
                            patientId={patient.id}
                            pain={pain}
                            setPain={setPain}
                            mood={mood}
                            setMood={setMood}
                        />
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
