'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { patientSchema, PatientFormValues } from '@/lib/validations/patient';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

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
 * For now, this just returns the first verified patient.
 */
export async function getCurrentPatientProfile() {
    try {
        const patient = await prisma.patient.findFirst({
            where: { isVerified: true },
            include: {
                assessments: { orderBy: { date: 'desc' }, take: 1 },
                assignedExercises: { include: { exercise: true } },
                dailyCheckIns: { orderBy: { dateString: 'desc' }, take: 1 },
                medications: { orderBy: { date: 'desc' }, take: 5 },
                notifications: { orderBy: { createdAt: 'desc' }, take: 5 }
            }
        });
        if (!patient) {
            // fallback to first patient if no verified patients
            const fallback = await prisma.patient.findFirst({
                 include: { 
                     assessments: { orderBy: { date: 'desc' }, take: 1 },
                     assignedExercises: { include: { exercise: true } },
                     dailyCheckIns: { orderBy: { dateString: 'desc' }, take: 1 },
                     medications: { orderBy: { date: 'desc' }, take: 5 },
                     notifications: { orderBy: { createdAt: 'desc' }, take: 5 }
                 }
            });
            if (!fallback) return { success: false as const, error: 'No patients found' };
            return { success: true as const, data: fallback };
        }
        return { success: true as const, data: patient };
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
 * Automatically creates and links a Patient record for a newly registered patient user
 */
export async function createPatientForUser(userId: string, name: string, email: string) {
    try {
        const parts = name.trim().split(' ');
        const firstName = parts[0] || 'Patient';
        const lastName = parts.slice(1).join(' ') || 'User';

        const patient = await prisma.patient.create({
            data: {
                userId,
                firstName,
                lastName,
                dob: new Date('1992-05-15'),
                gender: 'Prefer not to say',
                phone: '+1-555-0199',
                email,
                injuryLevel: 'C5-C7',
                ais: 'AIS D',
                status: 'ACTIVE',
                isVerified: true,
                verifiedAt: new Date(),
                program: 'Standard Outpatient PT',
                notes: 'Registered via patient portal.'
            }
        });

        // Assign 4 exercises from library
        const exercises = await prisma.exerciseLibrary.findMany({ take: 4 });
        for (const ex of exercises) {
            await prisma.assignedExercise.create({
                data: {
                    patientId: patient.id,
                    exerciseId: ex.id,
                    durationMins: ex.duration || 15,
                    frequencyPerWeek: 4
                }
            });
        }

        // Add initial check-in & medications
        const today = new Date().toISOString().split('T')[0];
        await prisma.dailyCheckIn.create({
            data: {
                patientId: patient.id,
                dateString: today,
                water: 4,
                pain: 2,
                mood: 'Good'
            }
        });

        await prisma.medication.createMany({
            data: [
                { patientId: patient.id, name: 'Gabapentin', dosage: '300mg', time: '8:00 AM', taken: false },
                { patientId: patient.id, name: 'Vitamin D3', dosage: '1000 IU', time: '8:00 PM', taken: false }
            ]
        });

        await prisma.notification.create({
            data: {
                patientId: patient.id,
                title: 'Welcome to NeuroPath!',
                message: 'Your personalized exercise program is now available.'
            }
        });

        return { success: true as const, patient };
    } catch (error) {
        console.error('Error creating patient for user:', error);
        return { success: false as const, error: 'Failed to create patient record' };
    }
}


