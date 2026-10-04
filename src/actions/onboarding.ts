'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface OnboardingPainItem {
    bodyPart: string;
    painType: 'Bone' | 'Joint' | 'Muscle';
    severity: number; // 0 - 10
    notes?: string;
}

export interface OnboardingPayload {
    // Step 1
    age: number;
    height: number;
    heightUnit: 'cm' | 'in';
    weight: number;
    weightUnit: 'kg' | 'lbs';

    // Step 2
    fitnessGoals: string[];

    // Step 3
    medicalConditions: string[];

    // Step 4
    painLocations: OnboardingPainItem[];

    // Step 5
    sittingHours: number;
    sleepHours: number;
}

/**
 * Loads existing onboarding data for the logged-in patient (if resuming)
 */
export async function getPatientOnboardingData() {
    try {
        const h = await headers();
        const session = await auth.api.getSession({ headers: h });
        if (!session?.user?.id) {
            return { success: false as const, error: 'Unauthorized' };
        }

        const db = prisma as any;
        const patient = await db.patient.findUnique({
            where: { userId: session.user.id },
            include: {
                healthProfile: true,
                fitnessGoals: true,
                medicalConditions: true,
                painLocations: true,
                lifestyle: true,
            }
        });

        if (!patient) {
            return { success: false as const, error: 'Patient record not found' };
        }

        return {
            success: true as const,
            data: {
                onboardingCompleted: patient.onboardingCompleted,
                firstName: patient.firstName,
                lastName: patient.lastName,
                healthProfile: patient.healthProfile,
                fitnessGoals: (patient.fitnessGoals || []).map((g: any) => g.goal),
                medicalConditions: (patient.medicalConditions || []).map((c: any) => c.condition),
                painLocations: (patient.painLocations || []).map((p: any) => ({
                    bodyPart: p.bodyPart,
                    painType: p.painType as 'Bone' | 'Joint' | 'Muscle',
                    severity: p.severity,
                    notes: p.notes || undefined,
                })),
                lifestyle: patient.lifestyle,
            }
        };
    } catch (error) {
        console.error('Error fetching onboarding data:', error);
        return { success: false as const, error: 'Failed to retrieve onboarding details' };
    }
}

/**
 * Saves complete patient onboarding data into Model 1 relational tables
 * and marks onboarding as completed.
 */
export async function saveOnboardingData(payload: OnboardingPayload) {
    try {
        const h = await headers();
        const session = await auth.api.getSession({ headers: h });
        if (!session?.user?.id) {
            return { success: false as const, error: 'You must be signed in to submit onboarding data.' };
        }

        let patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (!patient) {
            // Auto-create patient if somehow not created
            patient = await prisma.patient.create({
                data: {
                    userId: session.user.id,
                    firstName: session.user.name?.split(' ')[0] || 'Patient',
                    lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
                    email: session.user.email,
                    phone: 'Not provided',
                    status: 'ACTIVE',
                    onboardingCompleted: false
                }
            });
        }

        const patientId = patient.id;

        // Perform atomic update across all Model 1 relational tables
        const db = prisma as any;
        await db.$transaction(async (tx: any) => {
            // 1. HealthProfile (Age, Height, Weight)
            await tx.healthProfile.upsert({
                where: { patientId },
                update: {
                    age: payload.age,
                    height: payload.height,
                    heightUnit: payload.heightUnit,
                    weight: payload.weight,
                    weightUnit: payload.weightUnit,
                },
                create: {
                    patientId,
                    age: payload.age,
                    height: payload.height,
                    heightUnit: payload.heightUnit,
                    weight: payload.weight,
                    weightUnit: payload.weightUnit,
                }
            });

            // 2. Fitness Goals (multi-select)
            await tx.fitnessGoal.deleteMany({ where: { patientId } });
            if (payload.fitnessGoals.length > 0) {
                await tx.fitnessGoal.createMany({
                    data: payload.fitnessGoals.map(goal => ({
                        patientId,
                        goal
                    }))
                });
            }

            // 3. Medical Conditions (multi-select)
            await tx.medicalCondition.deleteMany({ where: { patientId } });
            if (payload.medicalConditions.length > 0) {
                await tx.medicalCondition.createMany({
                    data: payload.medicalConditions.map(condition => ({
                        patientId,
                        condition
                    }))
                });
            }

            // 4. Pain Locations (3D body map locations)
            await tx.painLocation.deleteMany({ where: { patientId } });
            if (payload.painLocations.length > 0) {
                await tx.painLocation.createMany({
                    data: payload.painLocations.map(p => ({
                        patientId,
                        bodyPart: p.bodyPart,
                        painType: p.painType,
                        severity: p.severity,
                        notes: p.notes || null
                    }))
                });
            }

            // 5. Lifestyle (Sitting & Sleep hours)
            await tx.lifestyle.upsert({
                where: { patientId },
                update: {
                    sittingHours: payload.sittingHours,
                    sleepHours: payload.sleepHours
                },
                create: {
                    patientId,
                    sittingHours: payload.sittingHours,
                    sleepHours: payload.sleepHours
                }
            });

            // 6. Mark patient onboarding as completed
            await tx.patient.update({
                where: { id: patientId },
                data: {
                    onboardingCompleted: true,
                    isVerified: true, // Allow user access to their portal
                    verifiedAt: new Date()
                }
            });

            // 7. Initial historical HealthUpdate entry for Model 2 baseline
            const initialPain = payload.painLocations.length > 0
                ? Math.round(payload.painLocations.reduce((acc, curr) => acc + curr.severity, 0) / payload.painLocations.length)
                : 0;

            const primaryPainLocation = payload.painLocations.length > 0
                ? payload.painLocations.map(p => p.bodyPart).join(', ')
                : 'None reported';

            await tx.healthUpdate.create({
                data: {
                    patientId,
                    painLevel: initialPain,
                    painLocation: primaryPainLocation,
                    recoveryStatus: 'Stable',
                    energyLevel: 'Moderate',
                    symptoms: 'Baseline onboarding assessment recorded.',
                    exerciseCompleted: false,
                    notes: `Initial onboarding completed with ${payload.painLocations.length} pain points recorded.`
                }
            });

            // Add notification
            await tx.notification.create({
                data: {
                    patientId,
                    title: 'Health Profile Completed',
                    message: 'Your onboarding information has been securely recorded. Your clinical team will review your goals and pain points.'
                }
            });
        });

        revalidatePath('/user');
        revalidatePath('/admin');
        revalidatePath('/admin/patients');
        return { success: true as const };
    } catch (error) {
        console.error('Error saving onboarding data:', error);
        return { success: false as const, error: 'Failed to save health onboarding data. Please check inputs and try again.' };
    }
}
