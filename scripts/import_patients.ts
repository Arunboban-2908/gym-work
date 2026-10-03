import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
// npx tsx scripts/import_patients.ts


async function main() {
  console.log("Reading chatSQLite.json...");
  const data = JSON.parse(fs.readFileSync('./chatSQLite.json', 'utf8'));
  
  // A "good" client has first name, phone, diagnosis, treatment and a package type
  const goodClients = data.tbl_patients.filter((p: any) => 
    p.Firstname && p.Phone && p.Diagonosis && p.treatment && p.Package_Type
  );
  
  let addedCount = 0;
  console.log(`Found ${goodClients.length} good clients with rich data. Looking to insert 5 new ones...`);

  for (const client of goodClients) {
    if (addedCount >= 5) {
      break;
    }

    const email = client.Email ? client.Email : `patient_${client.id}@example.com`;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    // Check if patient already exists by phone
    const existingPatient = await prisma.patient.findFirst({ 
      where: { phone: client.Phone } 
    });

    if (existingUser || existingPatient) {
      console.log(`⏩ Patient ${client.Firstname} ${client.Lastname || ''} (Phone: ${client.Phone}) already exists. Skipping.`);
      continue;
    }

    const userId = randomUUID();
    
    // Format package info for notes
    const packageInfo = [
      client.Package_Type ? `Package: ${client.Package_Type}` : '',
      client.Package_price ? `Price: ${client.Package_price}` : '',
      client.Package_start_date ? `Start: ${client.Package_start_date}` : '',
      client.Package_end_date ? `End: ${client.Package_end_date}` : ''
    ].filter(Boolean).join(' | ');

    const finalNotes = [
      client.Notes,
      packageInfo ? `[Package Details] ${packageInfo}` : ''
    ].filter(Boolean).join('\n');

    try {
      await prisma.user.create({
        data: {
          id: userId,
          name: `${client.Firstname} ${client.Lastname || ''}`.trim(),
          email: email,
          role: "patient",
          patient: {
            create: {
              firstName: client.Firstname,
              lastName: client.Lastname || "Unknown",
              dob: new Date("1990-01-01"), // Placeholder as chatSQLite doesn't have dob
              gender: "Unknown",           // Placeholder
              phone: client.Phone,
              email: email,
              injuryLevel: client.Diagonosis || "Unknown", 
              ais: "Unknown",              // Placeholder
              program: client.treatment || null,
              notes: finalNotes || null,
              isVerified: false,           // Explicitly set to false so we can verify later
            }
          }
        }
      });
      addedCount++;
      console.log(`✅ [${addedCount}/5] Added patient: ${client.Firstname} ${client.Lastname || ''} (Phone: ${client.Phone})`);
    } catch (error) {
      console.error(`❌ Error adding patient ${client.Firstname}:`, error);
    }
  }

  console.log(`Done inserting ${addedCount} patients.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
