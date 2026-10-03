import React from 'react';
import { Section } from './ui-blocks';
import { clearNotifications } from '@/actions/patient-daily';

interface NotificationsSectionProps {
    patientId: number;
    notifications: any[];
    onClear: () => void;
}

export function NotificationsSection({ patientId, notifications, onClear }: NotificationsSectionProps) {
    if (notifications.length === 0) return null;

    const handleClear = async () => {
        await clearNotifications(patientId);
        onClear();
    };

    return (
        <Section title="Notifications" action="Clear all" onAction={handleClear}>
            <div className="bg-pat-card rounded-2xl p-4 border border-pat-border shadow-sm mb-3 lg:mb-5 divide-y divide-pat-border">
                {notifications.map(notif => (
                    <div key={notif.id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${notif.read ? 'bg-pat-muted' : 'bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.4)]'}`} />
                            <div className="flex-1">
                                <div className="text-12 text-pat-text leading-[1.4]">
                                    <strong>{notif.title}</strong> — {notif.message}
                                </div>
                                <div className="text-10 text-pat-muted mt-1 font-mono">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}
