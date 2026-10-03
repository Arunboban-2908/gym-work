import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching patients to add mock assessments...");
  
  const patients = await prisma.patient.findMany({
    include: {
      assessments: true
    }
  });

  console.log(`Found ${patients.length} patients.`);

  let addedCount = 0;

  for (const patient of patients) {
    if (patient.assessments.length > 0) {
      console.log(`⏩ Patient ${patient.firstName} ${patient.lastName} already has assessments. Skipping.`);
      continue;
    }

    // Add 4-8 weeks of mock assessments
    const numWeeks = Math.floor(Math.random() * 5) + 4; // 4 to 8 weeks
    const assessments = [];
    
    let baseRecovery = Math.floor(Math.random() * 20) + 10; // Start at 10-30%
    let baseUpperLimb = Math.floor(Math.random() * 20) + 30;
    let baseTrunk = Math.floor(Math.random() * 20) + 30;
    let baseFineMotor = Math.floor(Math.random() * 20) + 20;
    let baseSensory = Math.floor(Math.random() * 20) + 40;

    for (let week = 1; week <= numWeeks; week++) {
      // Simulate progress
      baseRecovery = Math.min(100, baseRecovery + Math.floor(Math.random() * 10) + 2);
      baseUpperLimb = Math.min(100, baseUpperLimb + Math.floor(Math.random() * 8));
      baseTrunk = Math.min(100, baseTrunk + Math.floor(Math.random() * 8));
      baseFineMotor = Math.min(100, baseFineMotor + Math.floor(Math.random() * 10));
      baseSensory = Math.min(100, baseSensory + Math.floor(Math.random() * 5));

      // Calculate date based on week
      const date = new Date();
      date.setDate(date.getDate() - ((numWeeks - week) * 7));

      assessments.push({
        patientId: patient.id,
        date: date,
        week: week,
        recoveryPct: baseRecovery,
        upperLimb: baseUpperLimb,
        trunk: baseTrunk,
        fineMotor: baseFineMotor,
        sensory: baseSensory,
        therapist: "Dr. Smith",
        notes: `Mock assessment for week ${week}`
      });
    }

    try {
      await prisma.assessment.createMany({
        data: assessments
      });
      addedCount++;
      console.log(`✅ Added ${numWeeks} mock assessments for patient: ${patient.firstName} ${patient.lastName}`);
    } catch (error) {
      console.error(`❌ Error adding assessments for patient ${patient.firstName}:`, error);
    }
  }

  console.log(`Done adding mock assessments for ${addedCount} patients.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
