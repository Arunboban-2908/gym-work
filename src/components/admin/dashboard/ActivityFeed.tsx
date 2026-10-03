'use client';

interface ActivityItem {
    id: number;
    message: string;
    color: string | null;
    createdAt: string; // serialized Date from server
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

function formatTime(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="bg-adm-card border border-adm-border rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-adm-border2 flex justify-between items-center shrink-0">
                <div className="text-13 font-semibold text-adm-text">Activity Feed</div>
                <div className="text-11 font-mono text-adm-muted">{activities.length} events</div>
            </div>
            <div className="p-4 max-h-220px overflow-y-auto space-y-3 scrollbar-hide">
                {activities.length > 0 ? activities.map((log) => (
                    <div key={log.id} className="flex gap-2.5 items-start">
                        <div className="font-mono text-10 text-adm-muted w-16 shrink-0 pt-0.5">{formatTime(log.createdAt)}</div>
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: log.color || '#2f81f7' }} />
                        <div className="text-xs text-adm-muted leading-relaxed">{log.message}</div>
                    </div>
                )) : (
                    <div className="text-xs text-adm-muted text-center py-4">No recent activity</div>
                )}
            </div>
        </div>
    );
}
