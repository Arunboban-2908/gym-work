'use server';

import prisma from '@/lib/prisma';

export async function getSidebarCounts() {
    try {
        const [patientsCount, exerciseCount] = await Promise.all([
            prisma.patient.count(),
            prisma.exerciseLibrary.count()
        ]);
        
        return { success: true, patientsCount, exerciseCount };
    } catch (error) {
        console.error('Error fetching sidebar counts:', error);
        return { success: false, patientsCount: 0, exerciseCount: 0 };
    }
}
