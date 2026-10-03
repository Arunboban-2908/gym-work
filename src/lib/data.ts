import { Appointment, EmergencyContact, Exercise, Patient } from './types';

export const INITIAL_PATIENTS: Patient[] = [
    {
        id: 1, firstName: 'James', lastName: 'Mitchell', dob: '1978-04-12', gender: 'Male', phone: '+1-555-0101', email: 'james@email.com',
        injuryLevel: 'C5-C8', ais: 'AIS D', therapist: 'Dr. Sarah Chen', program: 'Outpatient PT', notes: 'Good voluntary motor control. Autonomic dysreflexia risk.',
        status: 'Active', recoveryPct: 68, upperLimb: 68, trunk: 54, fineMotor: 41, sensory: 35, week: 14
    },
    {
        id: 2, firstName: 'Maria', lastName: 'Santos', dob: '1985-09-23', gender: 'Female', phone: '+1-555-0202', email: 'maria@email.com',
        injuryLevel: 'T1-T6', ais: 'AIS C', therapist: 'Mark Rivera, PT', program: 'Acute Inpatient', notes: 'Improving trunk control. Neurogenic bowel program.',
        status: 'Active', recoveryPct: 52, upperLimb: 45, trunk: 52, fineMotor: 28, sensory: 22, week: 10
    },
    {
        id: 3, firstName: 'Robert', lastName: 'Kim', dob: '1962-11-30', gender: 'Male', phone: '+1-555-0303', email: 'robert@email.com',
        injuryLevel: 'L1-L5', ais: 'AIS B', therapist: 'Dr. Priya Nair', program: 'Sub-acute Rehab', notes: 'Partial lower limb sensation. Cauda equina involvement.',
        status: 'Active', recoveryPct: 74, upperLimb: 78, trunk: 70, fineMotor: 62, sensory: 50, week: 8
    },
    {
        id: 4, firstName: 'Aisha', lastName: 'Okonkwo', dob: '1991-06-14', gender: 'Female', phone: '+1-555-0404', email: 'aisha@email.com',
        injuryLevel: 'C1-C4', ais: 'AIS A', therapist: 'Dr. Sarah Chen', program: 'Acute Inpatient', notes: 'Ventilator-dependent. Sip-and-puff chair. Pressure injury watch.',
        status: 'Critical', recoveryPct: 22, upperLimb: 18, trunk: 15, fineMotor: 12, sensory: 8, week: 20
    },
    {
        id: 5, firstName: 'David', lastName: 'Chen', dob: '1975-03-08', gender: 'Male', phone: '+1-555-0505', email: 'david@email.com',
        injuryLevel: 'T7-T12', ais: 'AIS D', therapist: 'James Wong, OT', program: 'Outpatient PT', notes: 'Strong recovery. Independent manual wheelchair. KAFO standing.',
        status: 'Active', recoveryPct: 61, upperLimb: 58, trunk: 63, fineMotor: 45, sensory: 38, week: 6
    },
    {
        id: 6, firstName: 'Sarah', lastName: 'Park', dob: '1988-12-02', gender: 'Female', phone: '+1-555-0606', email: 'sarah@email.com',
        injuryLevel: 'L1-L5', ais: 'AIS C', therapist: 'Mark Rivera, PT', program: 'Home-based', notes: 'Discharged. Functional ambulation with walker.',
        status: 'Discharged', recoveryPct: 85, upperLimb: 88, trunk: 82, fineMotor: 78, sensory: 70, week: 18
    },
];

export const INITIAL_EXERCISES: Exercise[] = [
    { id: 1, name: 'Biceps Curl — Gravity Assisted', category: 'Upper Limb — Cervical', difficulty: 'Beginner', duration: 12, target: 'Biceps brachii (C5)', instructions: 'Seated in wheelchair. Support wrist if needed. Flex elbow through available range using gravity. This is the foundational C5 movement. Perform slowly, control both directions. Rest 30s between sets.', emoji: '💪' },
    { id: 2, name: 'Shoulder Depression — Pressure Relief', category: 'Upper Limb — Cervical', difficulty: 'Beginner', duration: 8, target: 'Trapezius, Serratus anterior', instructions: 'CRITICAL for SCI patients. Hands on armrests, push down to lift hips 2-3 inches. Hold 30 seconds. Must be done every 30 minutes to prevent pressure injuries. 10 reps per session.', emoji: '🙌' },
    { id: 3, name: 'Diaphragmatic Breathing', category: 'Respiratory — Breathing', difficulty: 'Beginner', duration: 10, target: 'Diaphragm (C3-C5)', instructions: 'Supine or seated. Place hand on abdomen. Inhale through nose 4 seconds, feeling belly rise. Exhale pursed lips 6 seconds. For cervical SCI patients this maintains respiratory capacity. 3 sets of 10.', emoji: '🫁' },
    { id: 4, name: 'Seated Trunk Balance', category: 'Trunk — Thoracic', difficulty: 'Beginner', duration: 12, target: 'Core stabilizers, erector spinae', instructions: 'Sit without backrest support. Hold 30s, progress to 60s. Reach forward then sideways while maintaining upright trunk. Use mirror for feedback. Foundation of all upper limb activity.', emoji: '⚖️' },
    { id: 5, name: 'Wrist Extension — Tenodesis Prep', category: 'Fine Motor — Hand', difficulty: 'Beginner', duration: 10, target: 'Wrist extensors (C6)', instructions: 'Critical for C6 functional grip. Lay forearm on surface. Extend wrist lifting hand. Release and repeat. This motion drives tenodesis grip — pinching objects when wrist extends. 3×15.', emoji: '✋' },
    { id: 6, name: 'Triceps Strengthening — Table Push', category: 'Upper Limb — Cervical', difficulty: 'Intermediate', duration: 15, target: 'Triceps brachii (C7)', instructions: 'Hands on table surface. Push to extend elbows, shifting weight onto arms. Enables independent transfers, wheelchair push-ups. Gravity-assisted first, progress to elastic band. 3×10.', emoji: '💪' },
    { id: 7, name: 'Wheelchair Propulsion Technique', category: 'Wheelchair Skills', difficulty: 'Intermediate', duration: 20, target: 'Rotator cuff, Triceps, Deltoids', instructions: 'Long smooth arc strokes — do NOT slap the rim. Semi-circular propulsion pattern. Practice on flat then slopes. Proper technique prevents 80% of shoulder overuse injuries common in SCI. 15 min continuous.', emoji: '🚀' },
    { id: 8, name: 'Mat Transfer — Lateral Slide', category: 'Transfer Training', difficulty: 'Intermediate', duration: 20, target: 'Full upper extremity, core', instructions: 'Lateral transfer from wheelchair to mat with transfer board. Even surface first. Swing-through motion. Head forward, push up and slide. 10 supervised transfers. Builds independence.', emoji: '🔄' },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
    { id: 1, patientId: 1, type: 'Physiotherapy', date: '2026-03-04', time: '10:30', therapist: 'Mark Rivera, PT', mode: 'In-Person', status: 'Scheduled' },
    { id: 2, patientId: 1, type: 'Neurology Review', date: '2026-03-08', time: '14:00', therapist: 'Dr. Sarah Chen', mode: 'Telehealth', status: 'Scheduled' },
    { id: 3, patientId: 1, type: 'Seating & Mobility Clinic', date: '2026-03-15', time: '09:00', therapist: 'James Wong, OT', mode: 'In-Person', status: 'Scheduled' },
    { id: 4, patientId: 2, type: 'ASIA Assessment', date: '2026-02-25', time: '09:00', therapist: 'Dr. Priya Nair', mode: 'In-Person', status: 'Scheduled' },
    { id: 5, patientId: 4, type: 'Respiratory Therapy', date: '2026-02-22', time: '13:00', therapist: 'Dr. Sarah Chen', mode: 'In-Person', status: 'Scheduled' },
];

export const INITIAL_CONTACTS: EmergencyContact[] = [
    { id: 1, patientId: 1, name: 'Linda Mitchell', phone: '+1-555-1001', relationship: 'Spouse' },
    { id: 2, patientId: 2, name: 'Carlos Santos', phone: '+1-555-2002', relationship: 'Brother' },
    { id: 3, patientId: 3, name: 'Ji-Young Kim', phone: '+1-555-3003', relationship: 'Daughter' },
    { id: 4, patientId: 4, name: 'Emeka Okonkwo', phone: '+1-555-4004', relationship: 'Father' },
    { id: 5, patientId: 5, name: 'Min Chen', phone: '+1-555-5005', relationship: 'Spouse' },
];
