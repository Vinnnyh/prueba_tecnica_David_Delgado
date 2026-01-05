import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function list() {
  const permissions = await prisma.permission.findMany();
  console.log('Current Permissions in DB:');
  console.log(JSON.stringify(permissions, null, 2));
}

list()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
