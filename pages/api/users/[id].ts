import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user
 *     description: Updates user details including role, name, and phone. Requires users:edit permission.
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
 *               roleId:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       405:
 *         description: Method not allowed
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as unknown as HeadersInit),
  });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    if (!(await hasPermission(session.user.id, 'users:edit'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { roleId, name, phone } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: String(id) },
        data: {
          ...(roleId && { roleId }),
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Failed to update user', error: String(error) });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
