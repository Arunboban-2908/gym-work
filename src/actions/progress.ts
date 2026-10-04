'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProgressChartData() {
    try {
        // Fetch all assessments
        const assessments = await prisma.assessment.findMany({
            select: { week: true, recoveryPct: true },
            orderBy: { week: 'asc' }
        });

        if (assessments.length === 0) {
            // Return empty state
            return { success: true, labels: [], data: [] };
        }

        // Group by week and calculate average recovery percentage
        const weekMap = new Map<number, { sum: number, count: number }>();
        for (const a of assessments) {
            const current = weekMap.get(a.week) || { sum: 0, count: 0 };
            current.sum += a.recoveryPct;
            current.count += 1;
            weekMap.set(a.week, current);
        }

        // Sort weeks
        const weeks = Array.from(weekMap.keys()).sort((a, b) => a - b);
        
        const labels = weeks.map(w => `W${w}`);
        const data = weeks.map(w => {
            const entry = weekMap.get(w)!;
            return Math.round(entry.sum / entry.count);
        });

        return { success: true, labels, data };
    } catch (error) {
        console.error('Error fetching progress data:', error);
        return { success: false, error: 'Failed to fetch progress data', labels: [], data: [] };
    }
}

export async function addAssessment(patientId: number, data: {
    week: number;
    upperLimb: number;
    trunk: number;
    fineMotor: number;
    sensory: number;
    therapist?: string;
    notes?: string;
}) {
    try {
        // Calculate recovery percentage automatically based on inputs
        const total = data.upperLimb + data.trunk + data.fineMotor + data.sensory;
        // Assume each field is out of 25 to make a total of 100 for simplicity
        const recoveryPct = Math.min(100, Math.max(0, total));

        const assessment = await prisma.assessment.create({
            data: {
                patientId,
                week: data.week,
                recoveryPct,
                upperLimb: data.upperLimb,
                trunk: data.trunk,
                fineMotor: data.fineMotor,
                sensory: data.sensory,
                therapist: data.therapist,
                notes: data.notes
            }
        });

        revalidatePath('/admin/patients');
        revalidatePath(`/admin/add-patient/${patientId}`);
        return { success: true, data: assessment };
    } catch (error) {
        console.error('Error adding assessment:', error);
        return { success: false, error: 'Failed to add assessment' };
    }
}

export async function deleteAssessment(id: number, patientId: number) {
    try {
        await prisma.assessment.delete({
            where: { id }
        });
        revalidatePath('/admin/patients');
        revalidatePath(`/admin/add-patient/${patientId}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting assessment:', error);
        return { success: false, error: 'Failed to delete assessment' };
    }
}

/**
 * Calculates aggregate clinical statistics from real stored records only.
 * Discloses exact sample counts and avoids distorting averages.
 */
export async function getOverallAdminAnalytics() {
    try {
        const [
            totalPatients,
            activePatients,
            criticalPatients,
            assessments,
            healthUpdates,
            totalReports,
            totalAssigned
        ] = await Promise.all([
            prisma.patient.count(),
            prisma.patient.count({ where: { status: 'ACTIVE' } }),
            prisma.patient.count({ where: { status: 'CRITICAL' } }),
            prisma.assessment.findMany({ select: { recoveryPct: true, week: true } }),
            prisma.healthUpdate.findMany({ select: { painLevel: true, exerciseCompleted: true, createdAt: true } }),
            prisma.patientReport.count(),
            prisma.assignedExercise.count()
        ]);

        const assessmentCount = assessments.length;
        const avgRecovery = assessmentCount > 0
            ? Math.round(assessments.reduce((sum, a) => sum + a.recoveryPct, 0) / assessmentCount)
            : null;

        const healthUpdateCount = healthUpdates.length;
        const avgPain = healthUpdateCount > 0
            ? +(healthUpdates.reduce((sum, u) => sum + u.painLevel, 0) / healthUpdateCount).toFixed(1)
            : null;

        const exerciseCompletedCount = healthUpdates.filter(u => u.exerciseCompleted).length;
        const exerciseAdherence = healthUpdateCount > 0
            ? Math.round((exerciseCompletedCount / healthUpdateCount) * 100)
            : null;

        return {
            success: true as const,
            data: {
                totalPatients,
                activePatients,
                criticalPatients,
                avgRecovery,
                assessmentCount,
                avgPain,
                healthUpdateCount,
                exerciseAdherence,
                totalReports,
                totalAssigned
            }
        };
    } catch (error) {
        console.error('Error fetching admin analytics:', error);
        return { success: false as const, error: 'Failed to calculate analytics.' };
    }
}

/**
 * Fetches comprehensive progress data for a single patient
 */
export async function getPatientProgressDetails(patientId: number) {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                healthProfile: true,
                fitnessGoals: true,
                medicalConditions: true,
                painLocations: true,
                healthUpdates: { orderBy: { createdAt: 'asc' } },
                assessments: { orderBy: { date: 'asc' } },
                assignedExercises: { include: { exercise: true } },
            }
        });

        if (!patient) return { success: false as const, error: 'Patient not found' };

        return { success: true as const, data: patient };
    } catch (error) {
        console.error('Error fetching patient progress details:', error);
        return { success: false as const, error: 'Failed to fetch patient progress' };
    }
}

