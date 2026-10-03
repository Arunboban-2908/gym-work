'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

export async function updateWaterIntake(patientId: number, water: number) {
    const today = getTodayString();
    try {
        await prisma.dailyCheckIn.upsert({
            where: { patientId_dateString: { patientId, dateString: today } },
            update: { water },
            create: { patientId, dateString: today, water }
        });
        revalidatePath('/user');
        return { success: true };
    } catch (error) {
        console.error('updateWaterIntake error:', error);
        return { success: false, error: 'Failed to update water' };
    }
}

export async function updateDailyCheckIn(patientId: number, pain: number | null, mood: string | null) {
    const today = getTodayString();
    try {
        await prisma.dailyCheckIn.upsert({
            where: { patientId_dateString: { patientId, dateString: today } },
            update: { 
                pain: pain !== null ? pain : undefined, 
                mood: mood !== null ? mood : undefined 
            },
            create: { patientId, dateString: today, pain, mood }
        });
        revalidatePath('/user');
        return { success: true };
    } catch (error) {
        console.error('updateDailyCheckIn error:', error);
        return { success: false, error: 'Failed to update check in' };
    }
}

export async function toggleMedication(id: number, taken: boolean) {
    try {
        await prisma.medication.update({
            where: { id },
            data: { taken }
        });
        revalidatePath('/user');
        return { success: true };
    } catch (error) {
        console.error('toggleMedication error:', error);
        return { success: false, error: 'Failed to update medication' };
    }
}

export async function clearNotifications(patientId: number) {
    try {
        await prisma.notification.deleteMany({
            where: { patientId }
        });
        revalidatePath('/user');
        return { success: true };
    } catch (error) {
        console.error('clearNotifications error:', error);
        return { success: false, error: 'Failed to clear notifications' };
    }
}

export async function seedDailyDataIfNeeded(patientId: number) {
    try {
        const medsCount = await prisma.medication.count({ where: { patientId } });
        if (medsCount === 0) {
            await prisma.medication.createMany({
                data: [
                    { patientId, name: 'Gabapentin', dosage: '300mg', time: '8:00 AM' },
                    { patientId, name: 'Baclofen', dosage: '10mg', time: '2:00 PM' },
                    { patientId, name: 'Vitamin D3', dosage: '1000 IU', time: '8:00 PM' }
                ]
            });
        }

        const notifCount = await prisma.notification.count({ where: { patientId } });
        if (notifCount === 0) {
            await prisma.notification.createMany({
                data: [
                    { patientId, title: 'New Exercise Added', message: 'Your therapist added "Wrist Extensor Stretch".' },
                    { patientId, title: 'Assessment Tomorrow', message: 'Reminder: Monthly assessment at 10:00 AM.' }
                ]
            });
        }
        return { success: true };
    } catch (error) {
        console.error('seedDailyData error:', error);
        return { success: false };
    }
}
