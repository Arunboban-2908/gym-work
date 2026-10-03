require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const INITIAL_EXERCISES = [
  {
    name: 'Biceps Curl — Gravity Assisted',
    category: 'Upper Limb — Cervical',
    difficulty: 'BEGINNER',
    duration: 12,
    target: 'Biceps brachii (C5)',
    instructions: 'Seated in wheelchair. Support wrist if needed. Flex elbow through available range using gravity. Foundational C5 movement. Perform slowly, control both directions. Rest 30s between sets.',
    emoji: '💪',
    youtubeUrl: 'https://www.youtube.com/watch?v=in7PaeYlhrM'
  },
  {
    name: 'Shoulder Depression — Pressure Relief',
    category: 'Upper Limb — Cervical',
    difficulty: 'BEGINNER',
    duration: 8,
    target: 'Trapezius, Serratus anterior',
    instructions: 'CRITICAL for SCI patients. Hands on armrests, push down to lift hips 2-3 inches. Hold 30 seconds. Must be done every 30 minutes to prevent pressure injuries. 10 reps per session.',
    emoji: '🙌',
    youtubeUrl: 'https://www.youtube.com/watch?v=kGgD_rG3wF4'
  },
  {
    name: 'Diaphragmatic Breathing',
    category: 'Respiratory — Breathing',
    difficulty: 'BEGINNER',
    duration: 10,
    target: 'Diaphragm (C3-C5)',
    instructions: 'Supine or seated. Place hand on abdomen. Inhale through nose 4 seconds, feeling belly rise. Exhale pursed lips 6 seconds. For cervical SCI patients this maintains respiratory capacity. 3 sets of 10.',
    emoji: '🫁',
    youtubeUrl: 'https://www.youtube.com/watch?v=g2wf_dE0n58'
  },
  {
    name: 'Seated Trunk Balance',
    category: 'Trunk — Thoracic',
    difficulty: 'BEGINNER',
    duration: 12,
    target: 'Core stabilizers, erector spinae',
    instructions: 'Sit without backrest support. Hold 30s, progress to 60s. Reach forward then sideways while maintaining upright trunk. Use mirror for feedback. Foundation of all upper limb activity.',
    emoji: '⚖️',
    youtubeUrl: 'https://www.youtube.com/watch?v=vV_X1Z_0y_M'
  },
  {
    name: 'Wrist Extension — Tenodesis Prep',
    category: 'Fine Motor — Hand',
    difficulty: 'BEGINNER',
    duration: 10,
    target: 'Wrist extensors (C6)',
    instructions: 'Critical for C6 functional grip. Lay forearm on surface. Extend wrist lifting hand. Release and repeat. This motion drives tenodesis grip — pinching objects when wrist extends. 3×15.',
    emoji: '✋',
    youtubeUrl: 'https://www.youtube.com/watch?v=8V3-o8vEsmA'
  },
  {
    name: 'Triceps Strengthening — Table Push',
    category: 'Upper Limb — Cervical',
    difficulty: 'INTERMEDIATE',
    duration: 15,
    target: 'Triceps brachii (C7)',
    instructions: 'Hands on table surface. Push to extend elbows, shifting weight onto arms. Enables independent transfers, wheelchair push-ups. Gravity-assisted first, progress to elastic band. 3×10.',
    emoji: '💪',
    youtubeUrl: 'https://www.youtube.com/watch?v=2-LzWbXmS7w'
  },
  {
    name: 'Wheelchair Propulsion Technique',
    category: 'Wheelchair Skills',
    difficulty: 'INTERMEDIATE',
    duration: 20,
    target: 'Rotator cuff, Triceps, Deltoids',
    instructions: 'Long smooth arc strokes — do NOT slap the rim. Semi-circular propulsion pattern. Practice on flat then slopes. Proper technique prevents 80% of shoulder overuse injuries common in SCI. 15 min continuous.',
    emoji: '🚀',
    youtubeUrl: 'https://www.youtube.com/watch?v=Vz8D8W-aJ40'
  },
  {
    name: 'Mat Transfer — Lateral Slide',
    category: 'Transfer Training',
    difficulty: 'INTERMEDIATE',
    duration: 20,
    target: 'Full upper extremity, core',
    instructions: 'Lateral transfer from wheelchair to mat with transfer board. Even surface first. Swing-through motion. Head forward, push up and slide. 10 supervised transfers. Builds independence.',
    emoji: '🔄',
    youtubeUrl: 'https://www.youtube.com/watch?v=rW_kL9_q7ZM'
  }
];

const INITIAL_PATIENTS = [
  {
    firstName: 'James',
    lastName: 'Mitchell',
    dob: new Date('1978-04-12'),
    gender: 'Male',
    phone: '+1-555-0101',
    email: 'james@email.com',
    injuryLevel: 'C5-C8',
    ais: 'AIS D',
    therapist: 'Dr. Sarah Chen',
    program: 'Outpatient PT',
    notes: 'Good voluntary motor control. Autonomic dysreflexia risk.',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 14 * 7 * 24 * 3600 * 1000)
  },
  {
    firstName: 'Maria',
    lastName: 'Santos',
    dob: new Date('1985-09-23'),
    gender: 'Female',
    phone: '+1-555-0202',
    email: 'maria@email.com',
    injuryLevel: 'T1-T6',
    ais: 'AIS C',
    therapist: 'Mark Rivera, PT',
    program: 'Acute Inpatient',
    notes: 'Improving trunk control. Neurogenic bowel program.',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 10 * 7 * 24 * 3600 * 1000)
  },
  {
    firstName: 'Robert',
    lastName: 'Kim',
    dob: new Date('1962-11-30'),
    gender: 'Male',
    phone: '+1-555-0303',
    email: 'robert@email.com',
    injuryLevel: 'L1-L5',
    ais: 'AIS B',
    therapist: 'Dr. Priya Nair',
    program: 'Sub-acute Rehab',
    notes: 'Partial lower limb sensation. Cauda equina involvement.',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 8 * 7 * 24 * 3600 * 1000)
  },
  {
    firstName: 'Aisha',
    lastName: 'Okonkwo',
    dob: new Date('1991-06-14'),
    gender: 'Female',
    phone: '+1-555-0404',
    email: 'aisha@email.com',
    injuryLevel: 'C1-C4',
    ais: 'AIS A',
    therapist: 'Dr. Sarah Chen',
    program: 'Acute Inpatient',
    notes: 'Ventilator-dependent. Sip-and-puff chair. Pressure injury watch.',
    status: 'CRITICAL',
    isVerified: false,
    verifiedAt: null
  },
  {
    firstName: 'David',
    lastName: 'Chen',
    dob: new Date('1975-03-08'),
    gender: 'Male',
    phone: '+1-555-0505',
    email: 'david@email.com',
    injuryLevel: 'T7-T12',
    ais: 'AIS D',
    therapist: 'James Wong, OT',
    program: 'Outpatient PT',
    notes: 'Strong recovery. Independent manual wheelchair. KAFO standing.',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 6 * 7 * 24 * 3600 * 1000)
  },
  {
    firstName: 'Sarah',
    lastName: 'Park',
    dob: new Date('1988-12-02'),
    gender: 'Female',
    phone: '+1-555-0606',
    email: 'sarah@email.com',
    injuryLevel: 'L1-L5',
    ais: 'AIS C',
    therapist: 'Mark Rivera, PT',
    program: 'Home-based',
    notes: 'Discharged. Functional ambulation with walker.',
    status: 'DISCHARGED',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 18 * 7 * 24 * 3600 * 1000)
  }
];

async function main() {
  console.log('--- Starting Complete Seed ---');

  // 1. Elevate bob@gmail.com to admin
  const bob = await prisma.user.findUnique({ where: { email: 'bob@gmail.com' } });
  if (bob) {
    await prisma.user.update({
      where: { email: 'bob@gmail.com' },
      data: { role: 'admin' }
    });
    console.log('✅ User bob@gmail.com elevated to role: admin');
  }

  // 2. Seed exercises if empty
  const exCount = await prisma.exerciseLibrary.count();
  let createdExercises = [];
  if (exCount === 0) {
    console.log('Seeding Exercise Library...');
    for (const ex of INITIAL_EXERCISES) {
      const created = await prisma.exerciseLibrary.create({ data: ex });
      createdExercises.push(created);
    }
    console.log(`✅ Created ${createdExercises.length} exercises in library.`);
  } else {
    createdExercises = await prisma.exerciseLibrary.findMany();
    console.log(`Exercise library already has ${createdExercises.length} exercises.`);
  }

  // 3. Seed patients
  const patCount = await prisma.patient.count();
  if (patCount === 0) {
    console.log('Seeding Patients...');
    for (const p of INITIAL_PATIENTS) {
      const userId = crypto.randomUUID();
      const user = await prisma.user.create({
        data: {
          id: userId,
          name: `${p.firstName} ${p.lastName}`,
          email: p.email,
          role: 'patient'
        }
      });

      const patient = await prisma.patient.create({
        data: {
          firstName: p.firstName,
          lastName: p.lastName,
          dob: p.dob,
          gender: p.gender,
          phone: p.phone,
          email: p.email,
          injuryLevel: p.injuryLevel,
          ais: p.ais,
          therapist: p.therapist,
          program: p.program,
          notes: p.notes,
          status: p.status,
          isVerified: p.isVerified,
          verifiedAt: p.verifiedAt,
          userId: user.id
        }
      });

      // Add emergency contact
      await prisma.emergencyContact.create({
        data: {
          patientId: patient.id,
          name: `Family of ${p.firstName}`,
          phone: '+1-555-9999',
          relationship: 'Next of Kin'
        }
      });

      // Add assessments (weeks 1 to 8)
      const numWeeks = p.status === 'CRITICAL' ? 3 : 8;
      const baseRec = p.status === 'CRITICAL' ? 15 : 40;
      for (let w = 1; w <= numWeeks; w++) {
        const assessmentDate = new Date();
        assessmentDate.setDate(assessmentDate.getDate() - ((numWeeks - w) * 7));
        const recoveryPct = Math.min(95, baseRec + w * 4);
        await prisma.assessment.create({
          data: {
            patientId: patient.id,
            date: assessmentDate,
            week: w,
            recoveryPct,
            upperLimb: Math.min(90, 35 + w * 4),
            trunk: Math.min(85, 30 + w * 3),
            fineMotor: Math.min(80, 25 + w * 3),
            sensory: Math.min(75, 20 + w * 2),
            therapist: p.therapist || 'Dr. Sarah Chen',
            notes: `Week ${w} clinical evaluation`
          }
        });
      }

      // Assign 3-4 exercises
      const exToAssign = createdExercises.slice(0, 4);
      for (const ex of exToAssign) {
        await prisma.assignedExercise.create({
          data: {
            patientId: patient.id,
            exerciseId: ex.id,
            durationMins: ex.duration || 15,
            frequencyPerWeek: 4
          }
        });
      }

      // Medications
      await prisma.medication.createMany({
        data: [
          { patientId: patient.id, name: 'Gabapentin', dosage: '300mg', time: '8:00 AM', taken: true },
          { patientId: patient.id, name: 'Baclofen', dosage: '10mg', time: '2:00 PM', taken: false },
          { patientId: patient.id, name: 'Vitamin D3', dosage: '1000 IU', time: '8:00 PM', taken: false }
        ]
      });

      // Daily check in for today
      const todayStr = new Date().toISOString().split('T')[0];
      await prisma.dailyCheckIn.upsert({
        where: { patientId_dateString: { patientId: patient.id, dateString: todayStr } },
        update: { water: 5, pain: 3, mood: 'Good' },
        create: { patientId: patient.id, dateString: todayStr, water: 5, pain: 3, mood: 'Good' }
      });

      // Notifications
      await prisma.notification.createMany({
        data: [
          { patientId: patient.id, title: 'Welcome to NeuroPath', message: 'Your personalized rehab program is ready.' },
          { patientId: patient.id, title: 'Upcoming Assessment', message: 'Evaluation scheduled with your therapist.' }
        ]
      });

      // Appointments
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          type: 'Physiotherapy',
          date: new Date(Date.now() + 2 * 24 * 3600 * 1000),
          time: '10:30 AM',
          therapist: p.therapist || 'Dr. Sarah Chen',
          mode: 'In-Person',
          status: 'SCHEDULED'
        }
      });

      // Activity log
      await prisma.activityLog.create({
        data: {
          patientId: patient.id,
          message: `Patient ${p.firstName} ${p.lastName} verified and program assigned`,
          color: '#3fb950'
        }
      });

      console.log(`✅ Seeded patient: ${p.firstName} ${p.lastName}`);
    }
  } else {
    console.log(`Patients table already has ${patCount} patients.`);
  }

  console.log('--- Seeding Complete ---');
}

main()
  .catch(e => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
