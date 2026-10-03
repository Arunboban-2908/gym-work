export type PatientStatus = 'Active' | 'Discharged' | 'Critical';
export type Gender = 'Male' | 'Female' | 'Non-binary';

export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    dob: string;
    gender: Gender;
    phone: string;
    email: string;
    injuryLevel: string;
    ais: string;
    therapist: string;
    program: string;
    notes: string;
    status: PatientStatus;
    recoveryPct: number;
    upperLimb: number;
    trunk: number;
    fineMotor: number;
    sensory: number;
    week: number;
}

export interface Exercise {
    id: number;
    name: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: number; // minutes
    target: string;
    instructions: string;
    emoji: string;
}

export interface Appointment {
    id: number;
    patientId: number;
    type: string;
    date: string;
    time: string;
    therapist: string;
    mode: 'In-Person' | 'Telehealth' | 'Home Visit';
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface EmergencyContact {
    id: number;
    patientId: number;
    name: string;
    phone: string;
    relationship: string;
}
