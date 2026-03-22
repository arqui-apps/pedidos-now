import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seed placeholder for business-service');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed finished');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
