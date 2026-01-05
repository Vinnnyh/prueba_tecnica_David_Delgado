import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Define Permissions
  const permissions = [
    {
      name: 'movements:view',
      description: 'Can view the dashboard and transaction list',
    },
    { name: 'movements:create', description: 'Can create new movements' },
    {
      name: 'movements:export',
      description: 'Can export transactions to CSV/Excel',
    },
    {
      name: 'users:view',
      description: 'Can view the list of users and their basic info',
    },
    { name: 'users:edit', description: 'Can manage user details' },
    {
      name: 'roles:view',
      description: 'Can view the roles and permissions page',
    },
    { name: 'roles:edit', description: 'Can create, edit and delete roles' },
    {
      name: 'admin:view',
      description: 'Can access the global admin dashboard',
    },
    { name: 'profile:edit', description: 'Can edit own profile details' },
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

  const userPermissions = allPermissions.filter(
    (p: any) =>
      p.name === 'movements:view' ||
      p.name === 'movements:create' ||
      p.name === 'profile:edit'
  );

  for (const p of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: p.id,
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
