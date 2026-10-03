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
