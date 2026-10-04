'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { patientSchema, PatientFormValues } from '@/lib/validations/patient';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Infer types directly from Prisma queries ──
// We use Awaited<ReturnType<>> instead of importing types from '@prisma/client' 
// or manually defining them because:
// 1. Prisma v6 with custom output doesn't easily export flat model types
// 2. It automatically includes our specific relational `include` (like assessments)
// 3. It guarantees 100% sync with the actual query result without manual maintenance

/** A patient with their latest assessment included */
type GetPatientsResult = Awaited<ReturnType<typeof _getPatients>>;
async function _getPatients() {
    return prisma.patient.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            assessments: {
                orderBy: { date: 'desc' },
            },
        },
    });
}

export type PatientWithAssessments = GetPatientsResult[number];
export type AssessmentData = PatientWithAssessments['assessments'][number];

/** A single activity entry */
type GetActivityResult = Awaited<ReturnType<typeof _getActivity>>;
async function _getActivity(limit: number) {
    return prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { patient: true },
    });
}

export type ActivityLogEntry = GetActivityResult[number];

/**
 * Fetches all patients with their latest assessment for the dashboard
 */
export async function getPatients(): Promise<
    { success: true; data: PatientWithAssessments[] } |
    { success: false; error: string }
> {
    try {
        const patients = await _getPatients();
        return { success: true, data: patients };
    } catch (error) {
        console.error('Error fetching patients:', error);
        return { success: false, error: 'Failed to fetch patients' };
    }
}

/**
 * Fetches a single patient by ID with all related data
 */
export async function getPatientById(id: number) {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                assessments: { orderBy: { date: 'desc' } },
                appointments: { orderBy: { date: 'desc' } },
                emergencyContacts: true,
                assignedExercises: {
                    include: { exercise: true },
                },
                healthProfile: true,
                fitnessGoals: true,
                medicalConditions: true,
                painLocations: true,
                lifestyle: true,
                healthUpdates: { orderBy: { createdAt: 'desc' } },
                reports: { orderBy: { createdAt: 'desc' } },
            },
        });

        if (!patient) return { success: false as const, error: 'Patient not found' };

        return { success: true as const, data: patient };
    } catch (error) {
        console.error(`Error fetching patient ${id}:`, error);
        return { success: false as const, error: 'Failed to fetch patient' };
    }
}

/**
 * Fetches recent activity logs for the dashboard feed
 */
export async function getRecentActivity(limit = 10): Promise<
    { success: true; data: ActivityLogEntry[] } |
    { success: false; error: string }
> {
    try {
        const activities = await _getActivity(limit);
        return { success: true, data: activities };
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return { success: false, error: 'Failed to fetch activity logs' };
    }
}

/**
 * Creates a new patient
 */
export async function createPatient(data: PatientFormValues) {
    try {
        const validatedData = patientSchema.safeParse(data);
        if (!validatedData.success) {
            return { success: false as const, error: 'Invalid input data', issues: validatedData.error.issues };
        }

        const patient = await prisma.patient.create({
            data: {
                firstName: validatedData.data.firstName,
                lastName: validatedData.data.lastName,
                dob: new Date(validatedData.data.dob),
                gender: validatedData.data.gender,
                phone: validatedData.data.phone,
                email: validatedData.data.email,
                injuryLevel: validatedData.data.injuryLevel,
                ais: validatedData.data.ais,
                therapist: validatedData.data.therapist || null,
                program: validatedData.data.program || null,
                notes: validatedData.data.notes || null,
                status: validatedData.data.status,
                user: {
                    create: {
                        id: crypto.randomUUID(),
                        name: `${validatedData.data.firstName} ${validatedData.data.lastName}`,
                        email: validatedData.data.email,
                        role: 'patient',
                    }
                }
            }
        });

        // Handle report uploads if any
        if (validatedData.data.reports && validatedData.data.reports.length > 0) {
            const reportsData = [];

            for (const report of validatedData.data.reports) {
                try {
                    // Upload base64 data to Cloudinary
                    const uploadResponse = await cloudinary.uploader.upload(report.base64, {
                        folder: 'neuropath/reports',
                        resource_type: 'auto'
                    });
                    
                    reportsData.push({
                        patientId: patient.id,
                        name: report.name,
                        type: report.type,
                        url: uploadResponse.secure_url
                    });
                } catch (err) {
                    console.error("Cloudinary upload error:", err);
                    // Optionally handle upload failures (e.g. continue with other files, or return error)
                }
            }

            if (reportsData.length > 0) {
                await prisma.patientReport.createMany({
                    data: reportsData
                });
            }
        }

        revalidatePath('/admin/patients');
        return { success: true as const, data: patient };
    } catch (error) {
        console.error('Error creating patient:', error);
        return { success: false as const, error: 'Failed to create patient' };
    }
}

/**
 * Updates a patient's status
 */
export async function updatePatientStatus(id: number, status: 'ACTIVE' | 'DISCHARGED' | 'CRITICAL') {
    try {
        const patient = await prisma.patient.update({
            where: { id },
            data: { status }
        });
        revalidatePath('/admin/patients');
        return { success: true as const, data: patient };
    } catch (error) {
        console.error(`Error updating patient ${id} status:`, error);
        return { success: false as const, error: 'Failed to update patient status' };
    }
}

/**
 * Verifies a patient
 */
export async function verifyPatient(id: number) {
    try {
        const patient = await prisma.patient.update({
            where: { id },
            data: { isVerified: true, verifiedAt: new Date() }
        });
        revalidatePath('/admin/patients');
        return { success: true as const, data: patient };
    } catch (error) {
        console.error(`Error verifying patient ${id}:`, error);
        return { success: false as const, error: 'Failed to verify patient' };
    }
}

/**
 * Verifies and sets up a patient with clinical details, exercises, and medications
 */
export async function verifyAndSetupPatient(
    id: number, 
    data: any
) {
    return updatePatient(id, { ...data, isVerified: true });
}

/**
 * Updates a patient with all fields, exercises, and medications
 */
export async function updatePatient(
    id: number, 
    data: any
) {
    try {
        await prisma.$transaction(async (tx) => {
            // Update patient details
            const updateData: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                dob: data.dob ? new Date(data.dob) : undefined,
                gender: data.gender,
                phone: data.phone,
                email: data.email,
                injuryLevel: data.injuryLevel,
                ais: data.ais,
                therapist: data.therapist,
                program: data.program,
                notes: data.notes,
                status: data.status,
            };
            
            if (data.isVerified) {
                updateData.isVerified = true;
                updateData.verifiedAt = new Date();
            }

            // clean up undefined values
            Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

            await tx.patient.update({
                where: { id },
                data: updateData
            });

            // Replace assigned exercises
            if (data.exercises !== undefined) {
                await tx.assignedExercise.deleteMany({ where: { patientId: id } });
                if (data.exercises.length > 0) {
                    await tx.assignedExercise.createMany({
                        data: data.exercises.map((ex: any) => ({
                            patientId: id,
                            exerciseId: ex.id,
                            durationMins: ex.duration,
                            frequencyPerWeek: ex.freq
                        }))
                    });
                }
            }

            // Replace medications
            if (data.medications !== undefined) {
                await tx.medication.deleteMany({ where: { patientId: id } });
                if (data.medications.length > 0) {
                    await tx.medication.createMany({
                        data: data.medications.map((med: any) => ({
                            patientId: id,
                            name: med.name,
                            dosage: med.dosage,
                            time: med.time,
                            taken: false
                        }))
                    });
                }
            }
        });

        // Handle report uploads if any (outside transaction because Cloudinary upload can be slow)
        if (data.reports && data.reports.length > 0) {
            const reportsData = [];
            for (const report of data.reports) {
                try {
                    const uploadResponse = await cloudinary.uploader.upload(report.base64, {
                        folder: 'neuropath/reports',
                        resource_type: 'auto'
                    });
                    
                    reportsData.push({
                        patientId: id,
                        name: report.name,
                        type: report.type,
                        url: uploadResponse.secure_url
                    });
                } catch (err) {
                    console.error("Cloudinary upload error:", err);
                }
            }

            if (reportsData.length > 0) {
                await prisma.patientReport.createMany({
                    data: reportsData
                });
            }
        }

        revalidatePath('/admin/patients');
        return { success: true as const };
    } catch (error) {
        console.error(`Error updating patient ${id}:`, error);
        return { success: false as const, error: 'Failed to update patient' };
    }
}

/**
 * Fetches the current patient profile for the patient app.
 * Resolves against authenticated user session, with demo fallback if unauthenticated.
 */
export async function getCurrentPatientProfile() {
    try {
        let userId: string | null = null;
        try {
            const h = await headers();
            const session = await auth.api.getSession({ headers: h });
            if (session?.user?.id) {
                userId = session.user.id;
            }
        } catch {
            // Not in request context or session error
        }

        const patientInclude = {
            healthProfile: true,
            fitnessGoals: true,
            medicalConditions: true,
            painLocations: true,
            lifestyle: true,
            healthUpdates: { orderBy: { createdAt: 'desc' as const } },
            assessments: { orderBy: { date: 'desc' as const }, take: 1 },
            assignedExercises: { include: { exercise: true } },
            reports: { orderBy: { createdAt: 'desc' as const } },
            dailyCheckIns: { orderBy: { dateString: 'desc' as const }, take: 1 },
            medications: { orderBy: { date: 'desc' as const }, take: 5 },
            notifications: { orderBy: { createdAt: 'desc' as const }, take: 5 },
            emergencyContacts: true,
        };

        if (userId) {
            const patient = await prisma.patient.findUnique({
                where: { userId },
                include: patientInclude
            });
            if (patient) {
                return { success: true as const, data: patient };
            }
        }

        // Fallback to first verified patient for preview mode
        const fallback = await prisma.patient.findFirst({
            where: { isVerified: true },
            include: patientInclude
        });
        if (fallback) return { success: true as const, data: fallback };

        const anyPatient = await prisma.patient.findFirst({
            include: patientInclude
        });
        if (anyPatient) return { success: true as const, data: anyPatient };

        return { success: false as const, error: 'No patients found' };
    } catch (error) {
        console.error('Error fetching current patient profile:', error);
        return { success: false as const, error: 'Failed to fetch current patient profile' };
    }
}

/**
 * Updates a user's role (e.g. 'admin' or 'patient')
 */
export async function setUserRole(email: string, role: string) {
    try {
        await prisma.user.update({
            where: { email },
            data: { role }
        });
        return { success: true as const };
    } catch (error) {
        console.error('Error setting user role:', error);
        return { success: false as const, error: 'Failed to update user role' };
    }
}

/**
 * Automatically creates and links a minimal Patient record for a newly registered patient user.
 * NO fake medical data, NO fake DOB, NO fake phone, NO fake medications, NO fake exercises.
 */
export async function createPatientForUser(userId: string, name: string, email: string, phone: string = '') {
    try {
        const parts = name.trim().split(' ');
        const firstName = parts[0] || 'Patient';
        const lastName = parts.slice(1).join(' ') || '';

        // Check if patient already exists for this user
        let patient = await prisma.patient.findUnique({
            where: { userId }
        });

        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    userId,
                    firstName,
                    lastName,
                    phone: phone.trim() || 'Not provided',
                    email: email.trim().toLowerCase(),
                    status: 'ACTIVE',
                    isVerified: false,
                    onboardingCompleted: false,
                    notes: 'Newly registered patient.'
                }
            });
        }

        return { success: true as const, patient };
    } catch (error) {
        console.error('Error creating patient for user:', error);
        return { success: false as const, error: 'Failed to create patient record' };
    }
}

/**
 * Deletes a patient and all associated records (Admin-only).
 * Also cleans up Cloudinary assets if any.
 */
export async function deletePatient(id: number) {
    try {
        // Authorization check
        const h = await headers();
        const session = await auth.api.getSession({ headers: h });
        if (session?.user?.role !== 'admin') {
            return { success: false as const, error: 'Unauthorized. Admin access required.' };
        }

        // Find patient and their reports
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: { reports: true }
        });

        if (!patient) {
            return { success: false as const, error: 'Patient not found' };
        }

        // Clean up Cloudinary reports if possible
        for (const report of patient.reports) {
            try {
                if (report.url && report.url.includes('cloudinary.com')) {
                    const parts = report.url.split('/');
                    const fileNameWithExt = parts[parts.length - 1];
                    const publicId = `neuropath/reports/${fileNameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId).catch(() => {});
                }
            } catch (err) {
                console.warn('Could not delete Cloudinary asset for report:', report.id, err);
            }
        }

        // Delete patient record - cascade deletes relations
        await prisma.patient.delete({
            where: { id }
        });

        // Also delete associated User account if exists
        if (patient.userId) {
            await prisma.user.delete({
                where: { id: patient.userId }
            }).catch(() => {});
        }

        revalidatePath('/admin');
        revalidatePath('/admin/patients');
        return { success: true as const };
    } catch (error) {
        console.error('Error deleting patient:', error);
        return { success: false as const, error: 'Failed to delete patient' };
    }
}


