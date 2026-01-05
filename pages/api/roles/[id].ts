import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * @openapi
 * /api/roles/{id}:
 *   patch:
 *     summary: Update a role
 *     description: Updates role details and its associated permissions. Requires roles:edit permission.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Delete a role
 *     description: Deletes a role. Requires roles:edit permission.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Only users with roles:edit can manage roles/permissions
    if (!(await hasPermission(session.user.id, 'roles:edit'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'PATCH') {
      const { name, description, permissionIds } = req.body;

      // Update role and its permissions
      // We use a transaction to ensure consistency
      const updatedRole = await prisma.$transaction(async (tx) => {
        // 1. Update basic info
        const role = await tx.role.update({
          where: { id },
          data: {
            name,
            description,
          },
        });

        // 2. If permissionIds are provided, sync them
        if (permissionIds) {
          // If it's the ADMIN role, always assign ALL permissions regardless of what was sent
          let finalPermissionIds = permissionIds;
          if (role.name === 'ADMIN') {
            const allPerms = await tx.permission.findMany({
              select: { id: true },
            });
            finalPermissionIds = allPerms.map((p) => p.id);
          }

          // Delete existing relations
          await tx.rolePermission.deleteMany({
            where: { roleId: id },
          });

          // Create new relations
          await tx.rolePermission.createMany({
            data: finalPermissionIds.map((pId: string) => ({
              roleId: id,
              permissionId: pId,
            })),
          });
        }

        return tx.role.findUnique({
          where: { id },
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      });

      if (!updatedRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      return res.status(200).json({
        ...updatedRole,
        permissions: updatedRole.permissions.map((rp) => rp.permission),
      });
    }

    if (req.method === 'DELETE') {
      // Check if role is in use by users
      const usersWithRole = await prisma.user.count({
        where: { roleId: id },
      });

      if (usersWithRole > 0) {
        return res.status(400).json({
          message:
            'Cannot delete role because it is assigned to users. Reassign users first.',
        });
      }

      // Check if it's a protected role (optional, but good practice)
      const role = await prisma.role.findUnique({ where: { id } });
      if (role?.name === 'ADMIN') {
        return res
          .status(400)
          .json({ message: 'Cannot delete the ADMIN role.' });
      }

      await prisma.role.delete({
        where: { id },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: String(error) });
  }
}
