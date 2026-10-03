'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Video, PlayCircle, Trash2, Edit2 } from 'lucide-react';
import { getExercises, createExercise, updateExercise, deleteExercise } from '@/actions/exercise';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function ExercisesLibrary() {
    const { toast } = useToast();
    const [exercises, setExercises] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Range of Motion',
        difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        target: '',
        instructions: '',
        emoji: '🧘‍♀️',
        youtubeUrl: '',
        duration: 15
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        const result = await getExercises();
        if (result.success && result.data) {
            setExercises(result.data);
        }
        setIsLoading(false);
    };

    const getYoutubeId = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        return match ? match[1] : null;
    };

    const getDiffTag = (diff: string) => {
        const map: any = { 
            BEGINNER: 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/20', 
            INTERMEDIATE: 'text-adm-warn bg-adm-warn/10 border-adm-warn/20', 
            ADVANCED: 'text-adm-danger bg-adm-danger/10 border-adm-danger/20' 
        };
        return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-10 font-bold uppercase tracking-wide border ${map[diff] || map.BEGINNER}`}>{diff}</span>;
    };

    const handleAddOpen = () => {
        setFormData({
            name: '', category: 'Range of Motion', difficulty: 'BEGINNER',
            target: '', instructions: '', emoji: '🧘‍♀️', youtubeUrl: '', duration: 15
        });
        setEditingId(null);
        setIsAddModalOpen(true);
    };

    const handleEditClick = (ex: any) => {
        setFormData({
            name: ex.name, category: ex.category, difficulty: ex.difficulty,
            target: ex.target, instructions: ex.instructions, emoji: ex.emoji,
            youtubeUrl: ex.youtubeUrl || '', duration: ex.duration
        });
        setEditingId(ex.id);
        setIsAddModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.target.trim() || !formData.instructions.trim()) {
            toast('Please fill all required fields.', 'error');
            return;
        }

        setIsSubmitting(true);
        if (editingId) {
            const result = await updateExercise(editingId, formData);
            if (result.success) {
                toast('Exercise updated successfully.', 'success');
                setIsAddModalOpen(false);
                loadExercises();
            } else {
                toast(result.error || 'Failed to update exercise.', 'error');
            }
        } else {
            const result = await createExercise(formData);
            if (result.success) {
                toast('Exercise added successfully.', 'success');
                setIsAddModalOpen(false);
                loadExercises();
            } else {
                toast(result.error || 'Failed to add exercise.', 'error');
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this exercise?")) return;
        const result = await deleteExercise(id);
        if (result.success) {
            toast('Exercise deleted successfully.', 'success');
            loadExercises();
        } else {
            toast(result.error || 'Failed to delete exercise.', 'error');
        }
    };

    const ytId = getYoutubeId(formData.youtubeUrl);

    return (
        <div className="p-6 pb-20">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-20 font-bold text-adm-text tracking-tight">SCI Exercise Library</h1>
                    <p className="text-xs text-adm-muted mt-1 font-mono">{exercises.length} approved exercises</p>
                </div>
                <Button variant="primary" size="sm" onClick={handleAddOpen}>
                    <Plus className="w-4 h-4 mr-1" /> Add Exercise
                </Button>
            </div>

            <div className="bg-adm-card border border-adm-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Exercise</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Category</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Target</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Difficulty</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Duration</th>
                                <th className="text-10 font-bold tracking-wide uppercase text-adm-muted p-3 px-4 bg-adm-surface border-b border-adm-border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center p-6 text-adm-muted">Loading...</td></tr>
                            ) : exercises.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-6 text-adm-muted">No exercises found. Add one above.</td></tr>
                            ) : (
                                exercises.map(ex => {
                                    const exYtId = ex.youtubeUrl ? getYoutubeId(ex.youtubeUrl) : null;
                                    return (
                                        <tr key={ex.id} className="hover:bg-white/5 border-b border-adm-border2 last:border-none cursor-pointer transition-colors">
                                            <td className="p-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {exYtId ? (
                                                        <div className="w-24 h-16 rounded bg-adm-surface border border-adm-border2 overflow-hidden relative shrink-0">
                                                            <img src={`https://img.youtube.com/vi/${exYtId}/hqdefault.jpg`} className="w-full h-full object-cover" alt="Video thumbnail" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                                                                <PlayCircle className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-24 h-16 rounded bg-adm-surface border border-adm-border2 flex items-center justify-center text-3xl shadow-sm shrink-0">
                                                            {ex.emoji}
                                                        </div>
                                                    )}
                                                    <div className="text-13 font-semibold text-adm-text">{ex.name}</div>
                                                </div>
                                            </td>
                                            <td className="p-3 px-4 text-xs text-adm-muted">{ex.category}</td>
                                            <td className="p-3 px-4 text-xs text-adm-muted max-w-180px truncate" title={ex.target}>{ex.target}</td>
                                            <td className="p-3 px-4">{getDiffTag(ex.difficulty)}</td>
                                            <td className="p-3 px-4 text-11 font-mono text-adm-muted">{ex.duration} min</td>
                                            <td className="p-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(ex); }}>
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }} className="text-red-400 hover:text-red-500 hover:bg-red-400/10">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingId ? "Edit Exercise" : "Add New Exercise"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Exercise')}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Exercise Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Scapular Retraction"
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Emoji Icon</label>
                            <input
                                type="text"
                                value={formData.emoji}
                                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                placeholder="e.g. 🧘‍♀️"
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            >
                                <option>Range of Motion</option>
                                <option>Strength Training</option>
                                <option>Balance</option>
                                <option>Cardio</option>
                                <option>Stretching</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Difficulty</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Target Muscle/Area *</label>
                            <input
                                type="text"
                                value={formData.target}
                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                placeholder="e.g. Upper Back, Shoulders"
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-adm-muted mb-1.5">Duration (mins)</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 15 })}
                                className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-adm-muted mb-1.5">Instructions *</label>
                        <textarea
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            placeholder="Step by step instructions..."
                            className="w-full bg-adm-surface border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors min-h-[80px]"
                        />
                    </div>

                    <div className="border border-adm-border rounded-lg p-4 bg-adm-surface">
                        <label className="block text-xs font-semibold text-adm-muted mb-2 flex items-center">
                            <Video className="w-3.5 h-3.5 mr-1.5" /> YouTube Video URL
                        </label>
                        <input
                            type="text"
                            value={formData.youtubeUrl}
                            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full bg-adm-card border border-adm-border rounded-md px-3 py-2 text-sm text-adm-text outline-none focus:border-adm-accent transition-colors"
                        />
                        {ytId && (
                            <div className="mt-3 relative w-full aspect-video rounded-md overflow-hidden border border-adm-border">
                                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} className="w-full h-full object-cover" alt="YouTube Thumbnail Preview" />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
