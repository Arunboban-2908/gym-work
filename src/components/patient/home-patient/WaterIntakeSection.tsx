import React, { useState } from 'react';
import { Section } from './ui-blocks';
import { updateWaterIntake } from '@/actions/patient-daily';

export function WaterIntakeSection({ patientId, initialWater }: { patientId: number, initialWater: number }) {
    const glasses = [1, 2, 3, 4, 5, 6, 7, 8];
    const [currentIntake, setCurrentIntake] = useState(initialWater);

    const handleIntake = async (i: number) => {
        const newVal = currentIntake === i ? i - 1 : i;
        setCurrentIntake(newVal);
        await updateWaterIntake(patientId, newVal);
    };

    return (
        <Section title="Water Intake" action={`${currentIntake}/${glasses.length} glasses`}>
            <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm mb-3 lg:mb-5">
                <div className="flex justify-between gap-1.5">
                    {glasses.map(i => (
                        <div key={i} onClick={() => handleIntake(i)} className={`flex-1 aspect-[1/1.3] rounded-t-lg rounded-b-md border-[1.5px] cursor-pointer transition-all hover:-translate-y-px ${i <= currentIntake ? 'bg-blue-100 border-blue-400/40 relative overflow-hidden shadow-sm' : 'bg-pat-bg border-pat-border border-dashed'}`}>
                            {i <= currentIntake && <div className="absolute bottom-0 left-0 right-0 bg-blue-400 opacity-60" style={{ height: '75%' }} />}
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
