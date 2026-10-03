import React from 'react';
import { Section, QuickAction } from './ui-blocks';

interface QuickActionsSectionProps {
    onNavigate: (tab: string) => void;
    onCallTherapist: () => void;
}

export function QuickActionsSection({ onNavigate, onCallTherapist }: QuickActionsSectionProps) {
    return (
        <Section title="Quick Actions">
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-3 lg:mb-5">
                <QuickAction icon="💪" label="Start Exercise" color="bg-pat-blue-soft" onClick={() => onNavigate('exercises')} />
                <QuickAction icon="🧠" label="Ask AI" color="bg-purple-100" onClick={() => onNavigate('ai')} />
                <QuickAction icon="📞" label="Call Therapist" color="bg-pat-teal-soft" onClick={onCallTherapist} />
                <QuickAction icon="📅" label="Schedule" color="bg-pat-amber-soft" onClick={() => onNavigate('schedule')} />
            </div>
        </Section>
    );
}
