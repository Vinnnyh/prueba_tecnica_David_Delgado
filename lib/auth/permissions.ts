import prisma from '@/lib/prisma';

export async function getAuthDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: {
        select: {
          name: true,
          permissions: {
            select: {
              permission: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const roleName = user?.role?.name || null;
  let permissions = user?.role?.permissions.map((rp) => rp.permission.name) || [];

  // If the role is ADMIN, ensure it has all permissions from the database
  if (roleName === 'ADMIN') {
    const allPermissions = await prisma.permission.findMany({
      select: { name: true }
    });
    permissions = allPermissions.map(p => p.name);
  }

  return {
    role: roleName,
    permissions,
  };
}

export async function getUserPermissions(userId: string) {
  const { permissions } = await getAuthDetails(userId);
  return permissions;
}

export async function hasPermission(userId: string, permissionName: string) {
  const { permissions } = await getAuthDetails(userId);
  return permissions.includes(permissionName);
}

export async function getRole(userId: string) {
  const { role } = await getAuthDetails(userId);
  return role;
}
