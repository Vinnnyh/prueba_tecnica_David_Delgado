import { prisma } from '@/lib/prisma';

export const getAuthDetails = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const roleName = user?.role?.name || null;
  let permissions =
    user?.role?.permissions.map((rp) => rp.permission.name) || [];

  // If the role is ADMIN, ensure it has all permissions from the database
  if (roleName === 'ADMIN') {
    const allPermissions = await prisma.permission.findMany({
      select: { name: true },
    });
    permissions = allPermissions.map((p) => p.name);
  }

  return {
    role: roleName,
    permissions,
  };
};

export const getUserPermissions = async (userId: string) => {
  const { permissions } = await getAuthDetails(userId);
  return permissions;
};

export const hasPermission = async (userId: string, permissionName: string) => {
  const { permissions } = await getAuthDetails(userId);
  return permissions.includes(permissionName);
};

export const getRole = async (userId: string) => {
  const { role } = await getAuthDetails(userId);
  return role;
};
