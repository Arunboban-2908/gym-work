'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getPatientOnboardingData,
    saveOnboardingData,
    OnboardingPainItem,
    OnboardingPayload
} from '@/actions/onboarding';
import { BodyPain3DMap } from '@/components/onboarding/BodyPain3DMap';
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Save,
    Sparkles,
    Shield,
    HeartPulse,
    Target,
    Clock,
    Scale,
    Ruler,
    Calendar
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const FITNESS_GOAL_OPTIONS = [
    { id: 'Gain Strength', label: 'Gain Strength', description: 'Rebuild muscle mass, motor force, and functional strength.' },
    { id: 'Gain Stamina', label: 'Gain Stamina', description: 'Enhance cardiovascular capacity and daily endurance.' },
    { id: 'Mobility / Flexibility', label: 'Mobility / Flexibility', description: 'Improve range of motion, joint ease, and reduce stiffness.' },
    { id: 'Injury Rehabilitation', label: 'Injury Rehabilitation', description: 'Targeted recovery protocols for specific neurological or physical injuries.' },
    { id: 'Lose Fat', label: 'Lose Fat', description: 'Optimize body composition alongside structured rehab.' },
];

const MEDICAL_CONDITION_OPTIONS = [
    { id: 'Diabetes / Pre-diabetes', label: 'Diabetes / Pre-diabetes' },
    { id: 'Hypertension', label: 'Hypertension (High Blood Pressure)' },
    { id: 'Heart Condition', label: 'Heart Condition' },
    { id: 'Depression / Anxiety', label: 'Depression / Anxiety' },
    { id: 'Bone / Joint Problem', label: 'Bone / Joint Problem (e.g. Arthritis, Osteopenia)' },
    { id: 'Breathing Difficulty', label: 'Breathing Difficulty (Asthma, COPD, etc.)' },
    { id: 'None', label: 'None of the above (No chronic conditions)' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState<number>(1);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Step 1: Basic Health Info
    const [age, setAge] = useState<number>(32);
    const [height, setHeight] = useState<number>(175);
    const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
    const [weight, setWeight] = useState<number>(70);
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

    // Step 2: Fitness Goals (multi-select)
    const [fitnessGoals, setFitnessGoals] = useState<string[]>(['Gain Strength', 'Injury Rehabilitation']);

    // Step 3: Medical Conditions (multi-select, with None mutual exclusion)
    const [medicalConditions, setMedicalConditions] = useState<string[]>([]);

    // Step 4: Pain Locations (from 3D body map)
    const [painLocations, setPainLocations] = useState<OnboardingPainItem[]>([]);

    // Step 5: Lifestyle
    const [sittingHours, setSittingHours] = useState<number>(8);
    const [sleepHours, setSleepHours] = useState<number>(7);

    // Prefill existing onboarding data if resuming
    useEffect(() => {
        async function loadDraft() {
            const res = await getPatientOnboardingData();
            if (res.success && res.data) {
                const { healthProfile, fitnessGoals: goals, medicalConditions: conditions, painLocations: pains, lifestyle } = res.data;
                if (healthProfile) {
                    setAge(healthProfile.age);
                    setHeight(healthProfile.height);
                    setHeightUnit(healthProfile.heightUnit as 'cm' | 'in');
                    setWeight(healthProfile.weight);
                    setWeightUnit(healthProfile.weightUnit as 'kg' | 'lbs');
                }
                if (goals && goals.length > 0) setFitnessGoals(goals);
                if (conditions && conditions.length > 0) setMedicalConditions(conditions);
                if (pains && pains.length > 0) setPainLocations(pains);
                if (lifestyle) {
                    setSittingHours(lifestyle.sittingHours);
                    setSleepHours(lifestyle.sleepHours);
                }
            }
            setLoadingData(false);
        }
        loadDraft();
    }, []);

    // Toggle fitness goal
    const toggleGoal = (goal: string) => {
        if (fitnessGoals.includes(goal)) {
            setFitnessGoals(fitnessGoals.filter(g => g !== goal));
        } else {
            setFitnessGoals([...fitnessGoals, goal]);
        }
    };

    // Toggle medical condition (with mutual exclusivity for "None")
    const toggleCondition = (cond: string) => {
        if (cond === 'None') {
            if (medicalConditions.includes('None')) {
                setMedicalConditions([]);
            } else {
                setMedicalConditions(['None']);
            }
        } else {
            const withoutNone = medicalConditions.filter(c => c !== 'None');
            if (withoutNone.includes(cond)) {
                setMedicalConditions(withoutNone.filter(c => c !== cond));
            } else {
                setMedicalConditions([...withoutNone, cond]);
            }
        }
    };

    // Step 1 Validation
    const validateStep1 = () => {
        if (!age || age < 1 || age > 120) {
            setError('Please enter a valid age between 1 and 120.');
            return false;
        }
        if (!height || height <= 0 || (heightUnit === 'cm' && (height < 50 || height > 260)) || (heightUnit === 'in' && (height < 20 || height > 100))) {
            setError('Please enter a realistic height value.');
            return false;
        }
        if (!weight || weight <= 0 || (weightUnit === 'kg' && (weight < 20 || weight > 400)) || (weightUnit === 'lbs' && (weight < 45 || weight > 900))) {
            setError('Please enter a realistic weight value.');
            return false;
        }
        setError('');
        return true;
    };

    // Step 2 Validation
    const validateStep2 = () => {
        if (fitnessGoals.length === 0) {
            setError('Please select at least one fitness or rehabilitation goal.');
            return false;
        }
        setError('');
        return true;
    };

    // Step 3 Validation
    const validateStep3 = () => {
        if (medicalConditions.length === 0) {
            setError('Please select any applicable medical condition or choose "None of the above".');
            return false;
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;
        setError('');
        setStep(prev => Math.min(5, prev + 1));
    };

    const handleBack = () => {
        setError('');
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleFinalSubmit = async () => {
        if (sittingHours < 0 || sittingHours > 24) {
            setError('Please specify realistic sitting hours between 0 and 24.');
            return;
        }
        if (sleepHours < 0 || sleepHours > 24) {
            setError('Please specify realistic sleep hours between 0 and 24.');
            return;
        }

        setError('');
        setSubmitting(true);

        const payload: OnboardingPayload = {
            age: Number(age),
            height: Number(height),
            heightUnit,
            weight: Number(weight),
            weightUnit,
            fitnessGoals,
            medicalConditions,
            painLocations,
            sittingHours: Number(sittingHours),
            sleepHours: Number(sleepHours),
        };

        const res = await saveOnboardingData(payload);

        if (res.success) {
            toast('Health Onboarding completed successfully!', 'success');
            router.push('/user');
        } else {
            setError(res.error || 'Failed to complete onboarding. Please try again.');
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-adm-bg flex items-center justify-center font-sora text-adm-text">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-adm-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-adm-muted">Loading your clinical profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-adm-bg text-adm-text font-sora antialiased py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-6 border-b border-adm-border/80 gap-3 sm:gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-10 font-bold bg-adm-accent/15 text-adm-accent border border-adm-accent/30 uppercase tracking-widest mb-2">
                            <Activity size={13} />
                            <span>Clinical Onboarding</span>
                        </div>
                        <h1 className="text-2xl font-bold text-adm-text tracking-tight">Patient Health Assessment</h1>
                        <p className="text-xs text-adm-muted mt-1">
                            Complete this 5-step clinical baseline to personalize your rehabilitation program.
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-adm-card border border-adm-border rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
                        <div className="text-right">
                            <div className="text-10 font-bold uppercase text-adm-muted">Progress</div>
                            <div className="text-base font-bold text-adm-accent font-mono">Step {step} / 5</div>
                        </div>
                        <div className="w-24 h-2.5 bg-adm-surface rounded-full overflow-hidden border border-adm-border">
                            <div
                                className="h-full bg-adm-accent transition-all duration-300 rounded-full"
                                style={{ width: `${(step / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Steps Navigator Tracker */}
                <div className="flex overflow-x-auto sm:grid sm:grid-cols-5 gap-2 my-4 sm:my-6 pb-2 sm:pb-0 scrollbar-none">
                    {[
                        { num: 1, label: 'Basic Health', icon: HeartPulse },
                        { num: 2, label: 'Fitness Goals', icon: Target },
                        { num: 3, label: 'Conditions', icon: Shield },
                        { num: 4, label: '3D Pain Map', icon: Activity },
                        { num: 5, label: 'Lifestyle', icon: Clock },
                    ].map(s => {
                        const Icon = s.icon;
                        const isDone = s.num < step;
                        const isCurrent = s.num === step;
                        return (
                            <div
                                key={s.num}
                                className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center sm:items-start text-center sm:text-left transition-all min-w-[110px] sm:min-w-0 shrink-0 ${
                                    isCurrent
                                        ? 'bg-adm-accent/15 border-adm-accent shadow-sm'
                                        : isDone
                                        ? 'bg-adm-card/60 border-adm-border text-adm-text'
                                        : 'bg-adm-surface/30 border-transparent text-adm-muted/60'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    {isDone ? (
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                    ) : (
                                        <Icon size={14} className={isCurrent ? 'text-adm-accent' : 'text-adm-muted'} />
                                    )}
                                    <span className="text-10 font-bold uppercase tracking-wider hidden sm:inline">
                                        Step {s.num}
                                    </span>
                                </div>
                                <span className={`text-11 font-medium truncate w-full ${isCurrent ? 'text-adm-accent font-bold' : ''}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-adm-danger/10 border border-adm-danger/30 text-adm-danger text-xs flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-adm-danger shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Step Form Box */}
                <div className="bg-adm-card border border-adm-border rounded-2xl p-4 sm:p-8 shadow-xl">
                    {/* ==================== STEP 1 ==================== */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-adm-text">Step 1 — Basic Health Information</h2>
                                <p className="text-xs text-adm-muted mt-1">
                                    Provide standard anatomical measurements so your physical therapy metrics are calibrated.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Age */}
                                <div className="p-4 rounded-xl bg-adm-surface border border-adm-border">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-adm-muted mb-2 uppercase tracking-wider">
                                        <Calendar size={14} className="text-adm-accent" />
                                        <span>Age</span>
                                    </div>
                                    <input
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={age}
                                        onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                                        className="w-full text-2xl font-bold font-mono bg-transparent text-adm-text outline-none border-b border-adm-border focus:border-adm-accent pb-1 transition-colors"
                                    />
                                    <span className="text-10 text-adm-muted mt-1 block">Years old</span>
                                </div>

                                {/* Height */}
                                <div className="p-4 rounded-xl bg-adm-surface border border-adm-border">
                                    <div className="flex items-center justify-between text-xs font-semibold text-adm-muted mb-2 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Ruler size={14} className="text-adm-accent" />
                                            <span>Height</span>
                                        </div>
                                        <div className="flex bg-adm-bg rounded-lg p-0.5 border border-adm-border text-10">
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit('cm')}
                                                className={`px-2 py-0.5 rounded cursor-pointer ${heightUnit === 'cm' ? 'bg-adm-accent text-white font-bold' : 'text-adm-muted'}`}
                                            >
                                                cm
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit('in')}
                                                className={`px-2 py-0.5 rounded cursor-pointer ${heightUnit === 'in' ? 'bg-adm-accent text-white font-bold' : 'text-adm-muted'}`}
                                            >
                                                in
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={height}
                                        onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                                        className="w-full text-2xl font-bold font-mono bg-transparent text-adm-text outline-none border-b border-adm-border focus:border-adm-accent pb-1 transition-colors"
                                    />
                                    <span className="text-10 text-adm-muted mt-1 block">Standardized in {heightUnit}</span>
                                </div>

                                {/* Weight */}
                                <div className="p-4 rounded-xl bg-adm-surface border border-adm-border">
                                    <div className="flex items-center justify-between text-xs font-semibold text-adm-muted mb-2 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Scale size={14} className="text-adm-accent" />
                                            <span>Weight</span>
                                        </div>
                                        <div className="flex bg-adm-bg rounded-lg p-0.5 border border-adm-border text-10">
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit('kg')}
                                                className={`px-2 py-0.5 rounded cursor-pointer ${weightUnit === 'kg' ? 'bg-adm-accent text-white font-bold' : 'text-adm-muted'}`}
                                            >
                                                kg
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit('lbs')}
                                                className={`px-2 py-0.5 rounded cursor-pointer ${weightUnit === 'lbs' ? 'bg-adm-accent text-white font-bold' : 'text-adm-muted'}`}
                                            >
                                                lbs
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={weight}
                                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                                        className="w-full text-2xl font-bold font-mono bg-transparent text-adm-text outline-none border-b border-adm-border focus:border-adm-accent pb-1 transition-colors"
                                    />
                                    <span className="text-10 text-adm-muted mt-1 block">Standardized in {weightUnit}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 2 ==================== */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-adm-text">Step 2 — Fitness & Rehabilitation Goals</h2>
                                <p className="text-xs text-adm-muted mt-1">
                                    What are your primary rehabilitation goals? Select all that apply.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {FITNESS_GOAL_OPTIONS.map((g) => {
                                    const isSelected = fitnessGoals.includes(g.id);
                                    return (
                                        <div
                                            key={g.id}
                                            onClick={() => toggleGoal(g.id)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                                                isSelected
                                                    ? 'bg-adm-accent/10 border-adm-accent shadow-sm'
                                                    : 'bg-adm-surface border-adm-border hover:border-adm-border2 text-adm-muted'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="mt-1 w-4 h-4 rounded text-adm-accent focus:ring-adm-accent accent-adm-accent cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className={`text-sm font-bold ${isSelected ? 'text-adm-accent' : 'text-adm-text'}`}>
                                                    {g.label}
                                                </div>
                                                <div className="text-xs text-adm-muted mt-0.5">{g.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 3 ==================== */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-adm-text">Step 3 — Medical Conditions</h2>
                                <p className="text-xs text-adm-muted mt-1">
                                    Do you have any of the following self-reported conditions? (Select all that apply, or &apos;None of the above&apos;).
                                </p>
                            </div>

                            <div className="space-y-2.5">
                                {MEDICAL_CONDITION_OPTIONS.map((c) => {
                                    const isSelected = medicalConditions.includes(c.id);
                                    const isNone = c.id === 'None';
                                    return (
                                        <div
                                            key={c.id}
                                            onClick={() => toggleCondition(c.id)}
                                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                                                isSelected
                                                    ? isNone
                                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold'
                                                        : 'bg-adm-accent/10 border-adm-accent text-adm-accent font-semibold'
                                                    : 'bg-adm-surface border-adm-border hover:border-adm-border2 text-adm-text'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="w-4 h-4 rounded text-adm-accent accent-adm-accent cursor-pointer"
                                            />
                                            <span className="text-xs">{c.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-11 text-adm-muted italic">
                                * Self-reported information only. This application does not diagnose clinical conditions.
                            </p>
                        </div>
                    )}

                    {/* ==================== STEP 4 ==================== */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-adm-text">Step 4 — Pain & Body Location</h2>
                                <p className="text-xs text-adm-muted mt-1">
                                    Do you currently experience pain, soreness, or stiffness? Use the 3D model below to pinpoint exact anatomical locations.
                                </p>
                            </div>

                            <BodyPain3DMap
                                painLocations={painLocations}
                                onChange={setPainLocations}
                            />
                        </div>
                    )}

                    {/* ==================== STEP 5 ==================== */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-adm-text">Step 5 — Lifestyle & Ergonomics</h2>
                                <p className="text-xs text-adm-muted mt-1">
                                    Record your daily sedentary and rest habits to help our physical therapists optimize your exercise pacing.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Sitting Hours */}
                                <div className="p-5 rounded-xl bg-adm-surface border border-adm-border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-bold text-adm-text">Sitting Hours per Day</div>
                                            <p className="text-xs text-adm-muted">Desk work, commuting, or resting in a chair.</p>
                                        </div>
                                        <div className="text-base font-bold font-mono text-adm-accent bg-adm-accent/15 px-3 py-1 rounded-lg border border-adm-accent/30">
                                            {sittingHours} hrs / day
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={24}
                                        step={0.5}
                                        value={sittingHours}
                                        onChange={(e) => setSittingHours(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-adm-card rounded-lg appearance-none cursor-pointer accent-adm-accent"
                                    />
                                    <div className="flex justify-between text-10 font-mono text-adm-muted">
                                        <span>0 hrs</span>
                                        <span>8 hrs (Standard)</span>
                                        <span>16+ hrs</span>
                                    </div>
                                </div>

                                {/* Sleep Hours */}
                                <div className="p-5 rounded-xl bg-adm-surface border border-adm-border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-bold text-adm-text">Sleep Hours per Night</div>
                                            <p className="text-xs text-adm-muted">Average restful night sleep.</p>
                                        </div>
                                        <div className="text-base font-bold font-mono text-emerald-400 bg-emerald-400/15 px-3 py-1 rounded-lg border border-emerald-400/30">
                                            {sleepHours} hrs / night
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={24}
                                        step={0.5}
                                        value={sleepHours}
                                        onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-adm-card rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-10 font-mono text-adm-muted">
                                        <span>0 hrs</span>
                                        <span>7-8 hrs (Recommended)</span>
                                        <span>12+ hrs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Nav / Controls */}
                    <div className="mt-8 pt-6 border-t border-adm-border/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <div className="w-full sm:w-auto">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="w-full sm:w-auto justify-center px-4 py-3 sm:py-2.5 rounded-xl bg-adm-surface border border-adm-border text-adm-text hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Back to Step {step - 1}</span>
                                </button>
                            ) : (
                                <span className="text-11 text-adm-muted text-center block sm:inline">Step 1 of 5</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {step < 5 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-adm-accent hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-adm-accent/25 transition-all cursor-pointer"
                                >
                                    <span>Continue to Step {step + 1}</span>
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={handleFinalSubmit}
                                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Saving Health Profile...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            <span>Complete Health Onboarding</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
