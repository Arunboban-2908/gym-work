'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getExercises() {
    try {
        const exercises = await prisma.exerciseLibrary.findMany({
            orderBy: { id: 'desc' },
        });
        return { success: true, data: exercises };
    } catch (error) {
        console.error('Error fetching exercises:', error);
        return { success: false, error: 'Failed to fetch exercises' };
    }
}

export async function createExercise(data: {
    name: string;
    category: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    target: string;
    instructions: string;
    emoji: string;
    youtubeUrl: string;
    duration: number;
}) {
    try {
        const exercise = await prisma.exerciseLibrary.create({
            data: {
                ...data,
            }
        });
        revalidatePath('/admin/exercises');
        return { success: true, data: exercise };
    } catch (error) {
        console.error('Error creating exercise:', error);
        return { success: false, error: 'Failed to create exercise' };
    }
}
export async function updateExercise(id: number, data: {
    name: string;
    category: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    target: string;
    instructions: string;
    emoji: string;
    youtubeUrl: string;
    duration: number;
}) {
    try {
        const exercise = await prisma.exerciseLibrary.update({
            where: { id },
            data: {
                ...data,
            }
        });
        revalidatePath('/admin/exercises');
        return { success: true, data: exercise };
    } catch (error) {
        console.error('Error updating exercise:', error);
        return { success: false, error: 'Failed to update exercise' };
    }
}

export async function deleteExercise(id: number) {
    try {
        await prisma.exerciseLibrary.delete({
            where: { id }
        });
        revalidatePath('/admin/exercises');
        return { success: true };
    } catch (error) {
        console.error('Error deleting exercise:', error);
        return { success: false, error: 'Failed to delete exercise' };
    }
}
