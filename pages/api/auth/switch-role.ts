import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * @openapi
 * /api/auth/switch-role:
 *   post:
 *     summary: Switch current user role
 *     description: Switches the current user's role between ADMIN and USER for demo purposes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetRole:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *     responses:
 *       200:
 *         description: Role switched successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetRole } = req.body; // 'ADMIN' or 'USER'

    if (!['ADMIN', 'USER'].includes(targetRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const role = await prisma.role.findUnique({
      where: { name: targetRole },
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { roleId: role.id },
    });

    return res.status(200).json({ message: `Role switched to ${targetRole}` });
  } catch (error) {
    console.error('Error switching role:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
