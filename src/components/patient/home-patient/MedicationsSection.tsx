import React, { useState } from 'react';
import { Section } from './ui-blocks';
import { toggleMedication } from '@/actions/patient-daily';

export function MedicationsSection({ medications }: { medications: any[] }) {
    const [localMeds, setLocalMeds] = useState(medications);

    const handleToggle = async (id: number, currentTaken: boolean) => {
        setLocalMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !currentTaken } : m));
        await toggleMedication(id, !currentTaken);
    };

    if (localMeds.length === 0) return null;

    return (
        <Section title="Medications">
            <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm mb-3 lg:mb-5 divide-y divide-pat-border">
                {localMeds.map(med => (
                    <div key={med.id} className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0">
                        <div className="w-30px h-30px bg-blue-100 rounded-9px flex items-center justify-center text-14">💊</div>
                        <div>
                            <div className="text-12 font-bold text-pat-text">{med.name} {med.dosage}</div>
                            <div className="text-10 text-pat-muted">{med.time}</div>
                        </div>
                        <button 
                            onClick={() => handleToggle(med.id, med.taken)}
                            className={`ml-auto text-10 font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${med.taken ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600 hover:bg-green-50'}`}
                        >
                            {med.taken ? '✓ Taken' : `⏰ ${med.time}`}
                        </button>
                    </div>
                ))}
            </div>
        </Section>
    );
}
