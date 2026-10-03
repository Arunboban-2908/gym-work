import React from 'react';
import { Phone, ChevronRight } from 'lucide-react';
import { Section } from './ui-blocks';

interface EmergencyContactSectionProps {
    patient: any;
    onCallEmergency: () => void;
}

export function EmergencyContactSection({ patient, onCallEmergency }: EmergencyContactSectionProps) {
    return (
        <Section title="Emergency">
            <div onClick={onCallEmergency} className="bg-pat-red-soft border-2 border-red-300 rounded-18px p-3.5 flex items-center gap-3 cursor-pointer hover:scale-[0.99] transition-transform mb-3 lg:mb-5">
                <div className="w-10 h-10 bg-pat-red rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                    <Phone fill="white" stroke="white" size={18} />
                </div>
                <div>
                    <div className="text-13 font-extrabold text-red-900">Emergency Contact</div>
                    <div className="text-10 text-pat-red mt-0.5">{patient.therapist} · Tap to call</div>
                </div>
                <ChevronRight className="ml-auto text-pat-red" size={20} />
            </div>
        </Section>
    );
}
