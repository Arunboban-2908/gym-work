'use client';

import React, { useState } from 'react';
import { Play, ExternalLink, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface PatientExercisesProps {
    assignedExercises: any[];
}

export function PatientExercises({ assignedExercises }: PatientExercisesProps) {
    const { toast } = useToast();
    const [level, setLevel] = useState('All Exercises');
    const [activeVideo, setActiveVideo] = useState<number | null>(null);
    const [completedIds, setCompletedIds] = useState<number[]>([]);

    const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Exercises'];

    const filteredExercises = assignedExercises.filter(ex => {
        if (level === 'All Exercises') return true;
        return ex.exercise?.difficulty === level.toUpperCase();
    });

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleToggleComplete = (id: number) => {
        if (completedIds.includes(id)) {
            setCompletedIds(prev => prev.filter(x => x !== id));
            toast('Exercise unmarked', 'info');
        } else {
            setCompletedIds(prev => [...prev, id]);
            toast('🎉 Exercise completed! Great job keeping up with your rehab plan.', 'success');
        }
    };

    const activeEx = assignedExercises.find(e => e.id === activeVideo);
    const activeExInfo = activeEx?.exercise || {};
    const activeVideoId = getYoutubeId(activeExInfo.youtubeUrl);

    return (
        <div className="flex-1 flex flex-col h-full relative font-sora">
            <div className="lg:sticky lg:top-0 lg:z-40 shadow-md shrink-0">
                <div className="px-5.5 py-4 bg-gradient-to-br from-[#1c3557] to-[#1e4a7a] relative">
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <div className="text-10 text-white/50 font-medium tracking-[0.5px] uppercase mb-0.5">Physiotherapy</div>
                            <div className="text-20 font-extrabold text-white tracking-tight leading-tight">Exercise Program</div>
                        </div>
                        <div className="text-right">
                            <div className="text-22 font-extrabold text-white leading-none">
                                {completedIds.length} <span className="text-15 opacity-40 font-medium">/ {assignedExercises.length}</span>
                            </div>
                            <div className="text-9 text-white/50 uppercase tracking-[0.5px] mt-0.5">Completed</div>
                        </div>
                    </div>
                </div>
                <div className="flex overflow-x-auto bg-[#1c3557] px-3.5 pt-2.5 scrollbar-hide relative z-40 border-b border-[#1e4a7a]">
                    {levels.map(l => (
                        <button key={l} onClick={() => setLevel(l)} className={`px-3.5 py-2 rounded-t-lg text-11 font-bold whitespace-nowrap transition-all ${level === l ? 'bg-pat-bg text-pat-navy' : 'text-white/50 bg-transparent hover:text-white'}`}>
                            {l}
                            {l !== 'All Exercises' && <span className={`inline-block w-4 h-4 ml-1 rounded-full text-center leading-4 text-9 font-extrabold ${l === 'Beginner' ? 'bg-[#dcfce7] text-[#16a34a]' : l === 'Intermediate' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-[#fee2e2] text-[#dc2626]'}`}>{assignedExercises.filter(ex => ex.exercise?.difficulty === l.toUpperCase()).length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-3.5 py-3 pb-20 lg:p-6 w-full max-w-container-xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 lg:gap-6 w-full">
                    {filteredExercises.map(ex => {
                        const exerciseInfo = ex.exercise || {};
                        const videoId = getYoutubeId(exerciseInfo.youtubeUrl);
                        const thumbnailUrl = videoId 
                            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            : null;
                        const isDone = completedIds.includes(ex.id);

                        return (
                            <div 
                                key={ex.id} 
                                className={`bg-pat-card border-[1.5px] rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer ${
                                    isDone ? 'border-green-300 ring-1 ring-green-300/50' : 'border-pat-border'
                                }`} 
                                onClick={() => setActiveVideo(ex.id)}
                            >
                                <div className="h-35 md:h-180px bg-gradient-to-br from-[#1c3557] to-[#1e4a7a] relative flex items-center justify-center group overflow-hidden">
                                    {thumbnailUrl && (
                                        <img src={thumbnailUrl} alt={exerciseInfo.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 z-10">
                                        <Play className="ml-0.5 text-pat-blue" fill="currentColor" size={20} />
                                    </div>
                                    <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-10 font-bold px-2 py-0.5 rounded-md uppercase tracking-[0.3px] z-10">
                                        {(exerciseInfo.category || 'Therapy').split('—')[0]}
                                    </div>
                                    {isDone && (
                                        <div className="absolute top-2.5 right-2.5 bg-green-500 text-white text-10 font-bold px-2 py-0.5 rounded-md uppercase tracking-[0.3px] z-10 flex items-center gap-1 shadow-md">
                                            <CheckCircle2 size={12} /> Done
                                        </div>
                                    )}
                                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-10 font-semibold px-7px py-0.5 rounded font-mono z-10">
                                        {ex.durationMins}:00
                                    </div>
                                </div>
                                <div className="p-3 lg:p-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-13 lg:text-14 font-extrabold text-pat-text">{exerciseInfo.name}</div>
                                    </div>
                                    <div className="text-11 lg:text-12 text-pat-muted truncate max-w-full mb-2" title={exerciseInfo.instructions}>
                                        {exerciseInfo.instructions}
                                    </div>
                                    <div className="flex gap-1.5 items-center mt-3">
                                        <span className="text-9 lg:text-10 font-bold uppercase py-1 px-2.5 bg-pat-bg rounded-md text-pat-muted tracking-[0.3px] border border-pat-border">
                                            {(exerciseInfo.target || '').split(',')[0]}
                                        </span>
                                        <button 
                                            className={`ml-auto font-bold text-11 px-4 py-2 rounded-10px hover:scale-105 transition-transform z-10 flex items-center gap-1.5 ${
                                                isDone 
                                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                                    : 'bg-pat-blue text-white shadow-sm'
                                            }`} 
                                            onClick={(e) => { e.stopPropagation(); setActiveVideo(ex.id); }}
                                        >
                                            <Play size={12} fill="currentColor" />
                                            <span>Watch & Start</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredExercises.length === 0 && (
                        <div className="text-center text-12 text-pat-muted mt-10 lg:col-span-2">No exercises found for this level.</div>
                    )}
                </div>
            </div>

            {/* Video Player Modal */}
            {activeVideo && activeEx && (
                <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-pat-card w-[560px] max-w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 font-sora relative z-[101] border border-pat-border flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="px-5 py-3.5 bg-pat-surface border-b border-pat-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-10 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pat-blue-soft text-pat-blue border border-pat-blue/20">
                                    {(activeExInfo.category || 'Therapy').split('—')[0]}
                                </span>
                                <span className={`text-10 font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    activeExInfo.difficulty === 'BEGINNER' ? 'bg-[#dcfce7] text-[#16a34a] border-green-200' :
                                    activeExInfo.difficulty === 'INTERMEDIATE' ? 'bg-[#fef3c7] text-[#d97706] border-amber-200' :
                                    'bg-[#fee2e2] text-[#dc2626] border-red-200'
                                }`}>
                                    {activeExInfo.difficulty}
                                </span>
                            </div>
                            <button 
                                onClick={() => setActiveVideo(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-pat-muted hover:text-pat-text hover:bg-pat-bg transition-colors cursor-pointer"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Real Video Player Container */}
                        <div className="w-full bg-black aspect-video relative flex items-center justify-center">
                            {activeVideoId ? (
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                                    title={activeExInfo.name || 'Exercise Walkthrough Video'}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center text-white/80">
                                    <Play className="w-12 h-12 text-pat-blue mb-2" />
                                    <p className="text-sm font-semibold">{activeExInfo.name}</p>
                                    <p className="text-xs text-white/50 mt-1">Video walkthrough not configured</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto">
                            <div className="flex justify-between items-start gap-4 mb-3">
                                <div>
                                    <h3 className="text-16 font-extrabold text-pat-text">{activeExInfo.name}</h3>
                                    <p className="text-11 font-mono text-pat-muted mt-0.5">Target: {activeExInfo.target || 'General mobility'}</p>
                                </div>
                                {activeExInfo.youtubeUrl && (
                                    <a
                                        href={activeExInfo.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-11 font-semibold text-pat-blue bg-pat-blue-soft hover:bg-pat-blue/20 transition-colors shrink-0"
                                    >
                                        <span>Open in YouTube</span>
                                        <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>

                            <div className="my-3 p-3.5 bg-pat-bg rounded-xl border border-pat-border">
                                <div className="text-10 font-bold uppercase tracking-wider text-pat-muted mb-1">Step-by-Step Instructions</div>
                                <div className="text-12 text-pat-text leading-relaxed">
                                    {activeExInfo.instructions}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    className={`flex-1 py-3 px-4 rounded-xl text-13 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                                        completedIds.includes(activeEx.id)
                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                            : 'bg-pat-green text-white hover:bg-green-700 active:scale-[0.98]'
                                    }`}
                                    onClick={() => handleToggleComplete(activeEx.id)}
                                >
                                    <CheckCircle2 size={16} />
                                    <span>{completedIds.includes(activeEx.id) ? 'Completed (Tap to undo)' : '✓ Mark Complete'}</span>
                                </button>
                                <button
                                    className="px-5 py-3 bg-pat-blue-soft rounded-xl text-pat-blue text-13 font-bold hover:bg-pat-blue/20 transition-colors cursor-pointer"
                                    onClick={() => setActiveVideo(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
