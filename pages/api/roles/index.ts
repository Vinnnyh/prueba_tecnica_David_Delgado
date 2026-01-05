import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: List all roles
 *     description: Returns a list of all roles with their permissions. Requires roles:view permission.
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role with specified permissions. Requires roles:edit permission.
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
 *       201:
 *         description: Role created
 *       400:
 *         description: Name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      if (!(await hasPermission(session.user.id, 'roles:view'))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      // Flatten permissions for easier consumption
      const formattedRoles = roles.map((role) => ({
        ...role,
        permissions: role.permissions.map((rp) => rp.permission),
      }));

      return res.status(200).json(formattedRoles);
    }

    if (req.method === 'POST') {
      if (!(await hasPermission(session.user.id, 'roles:edit'))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const { name, description, permissionIds } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const role = await prisma.role.create({
        data: {
          name,
          description,
          permissions: {
            create: permissionIds?.map((id: string) => ({
              permissionId: id,
            })),
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return res.status(201).json({
        ...role,
        permissions: role.permissions.map((rp) => rp.permission),
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: String(error) });
  }
}
