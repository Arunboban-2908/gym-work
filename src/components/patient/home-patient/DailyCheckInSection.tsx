import React from 'react';
import { Section } from './ui-blocks';
import { updateDailyCheckIn } from '@/actions/patient-daily';

interface DailyCheckInSectionProps {
    patientId: number;
    pain: number | null;
    setPain: (val: number) => void;
    mood: string | null;
    setMood: (val: string) => void;
}

export function DailyCheckInSection({ patientId, pain, setPain, mood, setMood }: DailyCheckInSectionProps) {
    const painLevels = [
        { val: 0, bg: 'bg-[#dcfce7]', color: 'text-[#16a34a]' },
        { val: 1, bg: 'bg-[#d1fae5]', color: 'text-[#059669]' },
        { val: 2, bg: 'bg-[#fef3c7]', color: 'text-[#d97706]' },
        { val: 3, bg: 'bg-[#fed7aa]', color: 'text-[#ea580c]' },
        { val: 4, bg: 'bg-[#fecaca]', color: 'text-[#dc2626]' },
        { val: 5, bg: 'bg-[#fee2e2]', color: 'text-[#b91c1c]' },
    ];
    const moods = ['😊', '😐', '😔', '😤', '💪'];

    return (
        <Section title="Daily Check-in">
            <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm mb-3 lg:mb-5">
                <div className="mb-3.5">
                    <div className="flex justify-between mb-1.5">
                        <span className="text-12 font-bold text-pat-text">Pain Level</span>
                        <span className="text-11 text-pat-muted">{pain !== null ? `${pain}/5 Recorded` : 'Tap to rate'}</span>
                    </div>
                    <div className="flex gap-1">
                        {painLevels.map(p => (
                            <button key={p.val} onClick={() => { setPain(p.val); updateDailyCheckIn(patientId, p.val, mood); }} className={`flex-1 h-8 rounded-lg text-11 font-bold transition-all border-2 border-transparent ${p.bg} ${p.color} ${pain === p.val ? 'border-pat-navy scale-110' : ''}`}>
                                {p.val}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="text-12 font-bold text-pat-text mb-1.5">How are you feeling?</div>
                    <div className="flex justify-center gap-2">
                        {moods.map(m => (
                            <button key={m} onClick={() => { setMood(m); updateDailyCheckIn(patientId, pain, m); }} className={`w-10 h-10 rounded-xl text-20 flex items-center justify-center transition-all bg-pat-bg border-2 border-transparent ${mood === m ? 'border-pat-blue bg-pat-blue-soft scale-110' : ''}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );
}
