import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address. Example: npx tsx scripts/set-admin.ts user@example.com');
        process.exit(1);
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
    }

    await prisma.user.update({
        where: { email },
        data: { role: 'admin' }
    });

    console.log(`Successfully elevated ${email} to admin.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });




//Promote an Admin User
// Run the setup script we created against an existing user's email:

// bash
// # Example user:
// npx tsx scripts/set-admin.ts [EMAIL_ADDRESS]