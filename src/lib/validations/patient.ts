import { z } from 'zod';

export const patientSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date of birth' }),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
    injuryLevel: z.string().min(1, 'Injury level is required'),
    ais: z.string().min(1, 'AIS classification is required'),
    therapist: z.string().optional().or(z.literal('')),
    program: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'CRITICAL']),
    reports: z.array(z.object({
        name: z.string(),
        type: z.string(),
        base64: z.string(),
        fileName: z.string()
    })).optional()
});

export type PatientFormValues = z.infer<typeof patientSchema>;
