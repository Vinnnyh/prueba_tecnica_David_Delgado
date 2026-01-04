import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Define Permissions
  const permissions = [
    { name: 'movements:view', description: 'Can view movements' },
    { name: 'movements:create', description: 'Can create new movements' },
    { name: 'users:view', description: 'Can view user list' },
    { name: 'users:edit', description: 'Can edit users and roles' },
    { name: 'reports:view', description: 'Can view financial reports' },
  ];

  console.log('Seeding permissions...');
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  // 2. Define Roles
  console.log('Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard user with limited access',
    },
  });

  // 3. Assign Permissions to Roles
  console.log('Assigning permissions to roles...');
  const allPermissions = await prisma.permission.findMany();

  // Admin gets everything
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id,
      },
    });
  }

  // User only gets movements:view
  const viewMovementsPerm = allPermissions.find((p: any) => p.name === 'movements:view');
  if (viewMovementsPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: viewMovementsPerm.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: viewMovementsPerm.id,
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
