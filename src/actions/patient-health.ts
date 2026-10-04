'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface HealthUpdateInput {
    painLevel: number;
    painLocation?: string;
    recoveryStatus: 'Improving' | 'Stable' | 'Getting Worse';
    energyLevel: 'Low' | 'Moderate' | 'Good';
    symptoms?: string;
    exerciseCompleted: boolean;
    notes?: string;
}

/**
 * Creates an immutable historical HealthUpdate row for the logged-in patient.
 * NEVER overwrites previous rows.
 */
export async function recordHealthUpdate(data: HealthUpdateInput) {
    try {
        const h = await headers();
        const session = await auth.api.getSession({ headers: h });
        if (!session?.user?.id) {
            return { success: false as const, error: 'Unauthorized: You must be logged in.' };
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (!patient) {
            return { success: false as const, error: 'Patient profile not found.' };
        }

        // Validate values
        if (data.painLevel < 0 || data.painLevel > 10) {
            return { success: false as const, error: 'Pain level must be between 0 and 10.' };
        }

        const db = prisma as any;
        const newUpdate = await db.healthUpdate.create({
            data: {
                patientId: patient.id,
                painLevel: Math.round(data.painLevel),
                painLocation: data.painLocation?.trim() || null,
                recoveryStatus: data.recoveryStatus,
                energyLevel: data.energyLevel,
                symptoms: data.symptoms?.trim() || null,
                exerciseCompleted: Boolean(data.exerciseCompleted),
                notes: data.notes?.trim() || null,
            }
        });

        // Also update today's daily check-in pain if dailyCheckIn exists
        const todayStr = new Date().toISOString().split('T')[0];
        await prisma.dailyCheckIn.upsert({
            where: {
                patientId_dateString: {
                    patientId: patient.id,
                    dateString: todayStr
                }
            },
            update: {
                pain: Math.round(data.painLevel),
                mood: data.energyLevel === 'Good' ? 'Great' : data.energyLevel === 'Moderate' ? 'Good' : 'Tired'
            },
            create: {
                patientId: patient.id,
                dateString: todayStr,
                pain: Math.round(data.painLevel),
                mood: data.energyLevel === 'Good' ? 'Great' : data.energyLevel === 'Moderate' ? 'Good' : 'Tired',
                water: 3
            }
        }).catch(() => {});

        revalidatePath('/user');
        revalidatePath('/admin');
        revalidatePath('/admin/patients');

        return { success: true as const, data: newUpdate };
    } catch (error) {
        console.error('Error recording health update:', error);
        return { success: false as const, error: 'Failed to record health update.' };
    }
}

/**
 * Uploads a medical document to Cloudinary and saves the metadata into PatientReport.
 * Enforces authenticated patient or admin authorization.
 */
export async function uploadPatientReport(formData: FormData) {
    try {
        const h = await headers();
        const session = await auth.api.getSession({ headers: h });
        if (!session?.user?.id) {
            return { success: false as const, error: 'Unauthorized: Please log in.' };
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (!patient) {
            return { success: false as const, error: 'Patient profile not found.' };
        }

        const file = formData.get('file') as File | null;
        const reportType = (formData.get('reportType') as string) || 'Other Medical Report';
        const customName = (formData.get('name') as string) || file?.name || 'Medical Document';

        if (!file) {
            return { success: false as const, error: 'No file provided.' };
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return { success: false as const, error: 'File size exceeds maximum allowed 10MB limit.' };
        }

        // Validate MIME type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg'
        ];
        if (!allowedTypes.includes(file.type)) {
            return { success: false as const, error: 'Invalid file format. Only PDF, JPG, PNG, and WEBP files are supported.' };
        }

        // Convert file buffer to base64 data URI for Cloudinary upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

        const uploadRes = await cloudinary.uploader.upload(base64Data, {
            folder: 'neuropath/reports',
            resource_type: 'auto',
            access_mode: 'public',
        });

        const newReport = await prisma.patientReport.create({
            data: {
                patientId: patient.id,
                name: `${customName.trim()} (${reportType})`,
                type: file.type === 'application/pdf' ? 'pdf' : 'photo',
                url: uploadRes.secure_url
            }
        });

        revalidatePath('/user');
        revalidatePath('/admin');
        revalidatePath('/admin/patients');

        return { success: true as const, data: newReport };
    } catch (error) {
        console.error('Error uploading patient report:', error);
        return { success: false as const, error: 'Failed to upload document. Please check Cloudinary configuration or file.' };
    }
}

/**
 * Deletes a medical report with authorization check.
 */
export async function deletePatientReport(reportId: number) {
    try {
        const h = await headers();
        const session = await auth.api.getSession({ headers: h });
        if (!session?.user?.id) {
            return { success: false as const, error: 'Unauthorized.' };
        }

        const report = await prisma.patientReport.findUnique({
            where: { id: reportId },
            include: { patient: true }
        });

        if (!report) {
            return { success: false as const, error: 'Document not found.' };
        }

        // Check ownership: must be the patient who owns it, or an admin
        const isOwner = report.patient.userId === session.user.id;
        const isAdmin = session.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return { success: false as const, error: 'Forbidden: You do not have permission to delete this report.' };
        }

        // Attempt Cloudinary cleanup
        try {
            if (report.url && report.url.includes('cloudinary.com')) {
                const parts = report.url.split('/');
                const fileNameWithExt = parts[parts.length - 1];
                const publicId = `neuropath/reports/${fileNameWithExt.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId).catch(() => {});
            }
        } catch {
            // Ignore asset removal failure
        }

        await prisma.patientReport.delete({
            where: { id: reportId }
        });

        revalidatePath('/user');
        revalidatePath('/admin');

        return { success: true as const };
    } catch (error) {
        console.error('Error deleting report:', error);
        return { success: false as const, error: 'Failed to delete document.' };
    }
}
