'use client';

import React, { useState } from 'react';
import { Activity, Plus, CheckCircle2, AlertCircle, History, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { recordHealthUpdate } from '@/actions/patient-health';
import { useToast } from '@/components/ui/Toast';

interface TodaysHealthStatusSectionProps {
    patientId: number;
    initialPainLocations?: string[];
    healthUpdates?: any[];
}

export function TodaysHealthStatusSection({
    patientId,
    initialPainLocations = [],
    healthUpdates = []
}: TodaysHealthStatusSectionProps) {
    const { toast } = useToast();
    const [painLevel, setPainLevel] = useState<number>(healthUpdates[0]?.painLevel ?? 3);
    const [painLocation, setPainLocation] = useState<string>(initialPainLocations[0] || 'Lower Back');
    const [customLocation, setCustomLocation] = useState<string>('');
    const [recoveryStatus, setRecoveryStatus] = useState<'Improving' | 'Stable' | 'Getting Worse'>('Stable');
    const [energyLevel, setEnergyLevel] = useState<'Low' | 'Moderate' | 'Good'>('Moderate');
    const [symptoms, setSymptoms] = useState<string>('');
    const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(true);
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showHistory, setShowHistory] = useState<boolean>(false);

    // Combine previous locations with default choices
    const locationOptions = Array.from(new Set([
        ...initialPainLocations,
        'Lower Back',
        'Right Knee',
        'Left Knee',
        'Neck / Cervical',
        'Right Shoulder',
        'Left Shoulder',
        'None / General',
        'Other'
    ]));

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const finalLocation = painLocation === 'Other' && customLocation.trim()
            ? customLocation.trim()
            : painLocation;

        const res = await recordHealthUpdate({
            painLevel,
            painLocation: finalLocation,
            recoveryStatus,
            energyLevel,
            symptoms: symptoms.trim() || undefined,
            exerciseCompleted,
            notes: notes.trim() || undefined,
        });

        if (res.success) {
            toast('Health status updated and logged to your history!', 'success');
            setSymptoms('');
            setNotes('');
        } else {
            toast(res.error || 'Failed to update health status', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="bg-pat-card border border-pat-border rounded-2xl p-5 mb-5 shadow-sm font-sora">
            <div className="flex items-center justify-between pb-3 border-b border-pat-border mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-pat-navy/10 flex items-center justify-center text-pat-navy">
                        <Activity size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-pat-navy">Today&apos;s Health Status</h3>
                        <p className="text-11 text-pat-muted">Log your daily recovery and physical comfort</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs text-pat-blue hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                    <History size={14} />
                    <span>{showHistory ? 'Hide History' : `History (${healthUpdates.length})`}</span>
                </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                {/* Pain Level Slider */}
                <div className="bg-pat-bg p-3.5 rounded-xl border border-pat-border/70">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-pat-navy uppercase tracking-wider text-11">
                            Reported Pain Level
                        </span>
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            painLevel >= 7 ? 'bg-red-500/15 text-red-600' :
                            painLevel >= 4 ? 'bg-amber-500/15 text-amber-700' :
                            'bg-emerald-500/15 text-emerald-700'
                        }`}>
                            {painLevel} / 10
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={painLevel}
                        onChange={(e) => setPainLevel(parseInt(e.target.value))}
                        className="w-full h-2 bg-pat-border rounded-lg appearance-none cursor-pointer accent-pat-navy"
                    />
                    <div className="flex justify-between text-9 text-pat-muted font-mono mt-1">
                        <span>0 - No Pain</span>
                        <span>5 - Moderate</span>
                        <span>10 - Severe</span>
                    </div>
                </div>

                {/* Pain Location Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-11 font-semibold text-pat-navy mb-1 uppercase tracking-wider">
                            Primary Pain Location
                        </label>
                        <select
                            value={painLocation}
                            onChange={(e) => setPainLocation(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-pat-bg border border-pat-border text-pat-navy outline-none focus:border-pat-navy font-sora"
                        >
                            {locationOptions.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    {painLocation === 'Other' && (
                        <div>
                            <label className="block text-11 font-semibold text-pat-navy mb-1 uppercase tracking-wider">
                                Specify Location
                            </label>
                            <input
                                type="text"
                                value={customLocation}
                                onChange={(e) => setCustomLocation(e.target.value)}
                                placeholder="e.g. Left wrist"
                                className="w-full px-3 py-2 text-xs rounded-xl bg-pat-bg border border-pat-border text-pat-navy outline-none focus:border-pat-navy font-sora"
                            />
                        </div>
                    )}

                    {/* Recovery Status */}
                    <div>
                        <label className="block text-11 font-semibold text-pat-navy mb-1 uppercase tracking-wider">
                            Recovery Status
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['Improving', 'Stable', 'Getting Worse'] as const).map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setRecoveryStatus(status)}
                                    className={`py-1.5 px-2 rounded-lg text-10 font-bold border transition-all cursor-pointer text-center ${
                                        recoveryStatus === status
                                            ? status === 'Improving'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                                                : status === 'Stable'
                                                ? 'bg-blue-50 text-blue-700 border-blue-400'
                                                : 'bg-red-50 text-red-700 border-red-400'
                                            : 'bg-pat-bg border-pat-border text-pat-muted hover:text-pat-navy'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Energy Level & Exercise Completed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-11 font-semibold text-pat-navy mb-1 uppercase tracking-wider">
                            Energy Level
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['Low', 'Moderate', 'Good'] as const).map(lvl => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setEnergyLevel(lvl)}
                                    className={`py-1.5 px-2 rounded-lg text-10 font-bold border transition-all cursor-pointer text-center ${
                                        energyLevel === lvl
                                            ? 'bg-pat-navy text-white border-pat-navy'
                                            : 'bg-pat-bg border-pat-border text-pat-muted hover:text-pat-navy'
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-11 font-semibold text-pat-navy mb-1 uppercase tracking-wider">
                            Today&apos;s Rehab Exercises Completed?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setExerciseCompleted(true)}
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                                    exerciseCompleted
                                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 font-bold'
                                        : 'bg-pat-bg border-pat-border text-pat-muted'
                                }`}
                            >
                                <CheckCircle2 size={13} />
                                <span>Yes</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setExerciseCompleted(false)}
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                                    !exerciseCompleted
                                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 font-bold'
                                        : 'bg-pat-bg border-pat-border text-pat-muted'
                                }`}
                            >
                                <Minus size={13} />
                                <span>Not Yet</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Symptoms & Free-text */}
                <div>
                    <label className="block text-11 font-semibold text-pat-navy mb-1 uppercase tracking-wider">
                        Current Symptoms or Changes (Optional)
                    </label>
                    <input
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g. Mild morning stiffness, feeling less tension when walking"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-pat-bg border border-pat-border text-pat-navy outline-none focus:border-pat-navy font-sora"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-pat-navy text-white text-xs font-bold hover:bg-[#152a45] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                    {loading ? (
                        <span>Saving Health Log...</span>
                    ) : (
                        <>
                            <Sparkles size={14} />
                            <span>Update Health</span>
                        </>
                    )}
                </button>
            </form>

            {/* Historical Updates Log */}
            {showHistory && (
                <div className="mt-5 pt-4 border-t border-pat-border space-y-2">
                    <span className="text-10 font-bold uppercase tracking-wider text-pat-muted block mb-2">
                        Recorded Health History (Permanent Log)
                    </span>
                    {healthUpdates.length === 0 ? (
                        <p className="text-xs text-pat-muted py-2 italic text-center">No past health logs yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {healthUpdates.map((item, idx) => (
                                <div key={item.id || idx} className="p-3 bg-pat-bg rounded-xl border border-pat-border text-xs flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-pat-navy">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="text-10 px-2 py-0.5 rounded-full font-semibold border bg-white text-pat-navy">
                                                Pain: {item.painLevel}/10
                                            </span>
                                            <span className={`text-10 font-bold px-2 py-0.5 rounded-full ${
                                                item.recoveryStatus === 'Improving' ? 'bg-emerald-100 text-emerald-800' :
                                                item.recoveryStatus === 'Getting Worse' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {item.recoveryStatus}
                                            </span>
                                        </div>
                                        {item.painLocation && (
                                            <div className="text-10 text-pat-muted mt-0.5">
                                                Location: {item.painLocation} • Energy: {item.energyLevel}
                                            </div>
                                        )}
                                        {item.symptoms && (
                                            <div className="text-10 text-pat-navy/80 italic mt-0.5">
                                                &ldquo;{item.symptoms}&rdquo;
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-10 text-pat-muted font-mono block">
                                            {item.exerciseCompleted ? '✓ Exercises Done' : '— Rest Day'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
