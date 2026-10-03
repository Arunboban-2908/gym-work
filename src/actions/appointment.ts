'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAppointments() {
    try {
        const appointments = await prisma.appointment.findMany({
            include: { patient: true },
            orderBy: [{ date: 'asc' }, { time: 'asc' }]
        });
        return { success: true, data: appointments };
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, error: 'Failed to fetch appointments' };
    }
}

export async function createAppointment(data: { 
    patientId: number, 
    type: string, 
    date: Date, 
    time: string, 
    therapist: string, 
    mode: string 
}) {
    try {
        const appt = await prisma.appointment.create({ data });
        revalidatePath('/admin/appointments');
        return { success: true, data: appt };
    } catch (error) {
        console.error('Error creating appointment:', error);
        return { success: false, error: 'Failed to create appointment' };
    }
}

export async function getVerifiedPatients() {
    try {
        const patients = await prisma.patient.findMany({
            where: { isVerified: true },
            select: { id: true, firstName: true, lastName: true },
            orderBy: { firstName: 'asc' }
        });
        return { success: true, data: patients };
    } catch (error) {
         console.error('Error fetching verified patients:', error);
         return { success: false, error: 'Failed to fetch verified patients' };
    }
}

export async function deleteAppointment(id: number) {
    try {
        await prisma.appointment.delete({
            where: { id }
        });
        revalidatePath('/admin/appointments');
        return { success: true };
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, error: 'Failed to delete appointment' };
    }
}
