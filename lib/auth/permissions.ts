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

  return {
    role: user?.role?.name || null,
    permissions: user?.role?.permissions.map((rp) => rp.permission.name) || [],
  };
}

export async function getUserPermissions(userId: string) {
  const { permissions } = await getAuthDetails(userId);
  return permissions;
}

export async function hasPermission(userId: string, permissionName: string) {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionName);
}

export async function getRole(userId: string) {
  const { role } = await getAuthDetails(userId);
  return role;
}
