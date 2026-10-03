import { create } from 'zustand';
import { Appointment, Exercise, Patient } from '@/lib/types';
import { INITIAL_PATIENTS, INITIAL_EXERCISES, INITIAL_APPOINTMENTS } from '@/lib/data';

interface AppState {
    patients: Patient[];
    exercises: Exercise[];
    appointments: Appointment[];
    activePatientId: number;

    // Actions
    addPatient: (patient: Omit<Patient, 'id' | 'week' | 'recoveryPct' | 'upperLimb' | 'trunk' | 'fineMotor' | 'sensory' | 'status'>) => void;
    updatePatientStatus: (id: number, status: Patient['status']) => void;
    addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
}

export const useAppStore = create<AppState>((set) => ({
    patients: INITIAL_PATIENTS,
    exercises: INITIAL_EXERCISES,
    appointments: INITIAL_APPOINTMENTS,
    activePatientId: 1, // Defaulting to James Mitchell

    addPatient: (patientData) => set((state) => {
        const newId = Math.max(0, ...state.patients.map(p => p.id)) + 1;
        const newPatient: Patient = {
            ...patientData,
            id: newId,
            status: 'Active',
            week: 1,
            recoveryPct: 30, // Starting default
            upperLimb: 25,
            trunk: 20,
            fineMotor: 15,
            sensory: 10,
        };
        return { patients: [...state.patients, newPatient] };
    }),

    updatePatientStatus: (id, status) => set((state) => ({
        patients: state.patients.map(p => p.id === id ? { ...p, status } : p)
    })),

    addAppointment: (appData) => set((state) => {
        const newId = Math.max(0, ...state.appointments.map(a => a.id)) + 1;
        return { appointments: [...state.appointments, { ...appData, id: newId }] };
    }),
}));
