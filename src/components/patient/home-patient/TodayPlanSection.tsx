import React from 'react';
import { Section } from './ui-blocks';

interface TodayPlanSectionProps {
    onNavigate: (tab: string) => void;
    assignedExercises: any[];
}

export function TodayPlanSection({ onNavigate, assignedExercises }: TodayPlanSectionProps) {
    // Sort assigned exercises by difficulty (BEGINNER -> INTERMEDIATE -> ADVANCED)
    const sortedExercises = [...assignedExercises].sort((a, b) => {
        const diffA = a.exercise?.difficulty === 'BEGINNER' ? 1 : a.exercise?.difficulty === 'INTERMEDIATE' ? 2 : 3;
        const diffB = b.exercise?.difficulty === 'BEGINNER' ? 1 : b.exercise?.difficulty === 'INTERMEDIATE' ? 2 : 3;
        return diffA - diffB;
    });

    const exercises = sortedExercises.map(ex => ({
        name: ex.exercise?.name || 'Exercise',
        duration: `${ex.durationMins} min`,
        done: false, // In a real app we'd track daily completion of each exercise
        difficulty: ex.exercise?.difficulty || 'BEGINNER'
    }));

    return (
        <Section title="Today's Plan" action="3/5 done">
            <div className="bg-pat-card rounded-2xl p-3.5 border border-pat-border shadow-sm mb-3 lg:mb-5">
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                    {exercises.map((ex, i) => (
                        <div key={i} onClick={() => onNavigate('exercises')} className={`w-35 shrink-0 rounded-xl p-3 border cursor-pointer transition-all hover:-translate-y-0.5 ${ex.done ? 'bg-pat-bg border-pat-border opacity-70' : 'bg-pat-blue-soft border-pat-blue/30'} flex flex-col gap-1.5`}>
                            <div className="flex justify-between items-start">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-10 ${ex.done ? 'bg-pat-card text-pat-muted' : 'bg-pat-blue text-white shadow-sm'}`}>
                                    {ex.done ? '✓' : '▶'}
                                </div>
                                <span className="text-9 font-mono text-pat-muted mt-1">{ex.duration}</span>
                            </div>
                            <div className={`text-11 font-bold leading-snug mt-1 ${ex.done ? 'text-pat-muted' : 'text-pat-text'}`}>{ex.name}</div>
                            <div className="text-8 font-bold tracking-widest uppercase text-pat-blue/70">{ex.difficulty}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
