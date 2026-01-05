import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * @openapi
 * /api/auth/update-profile:
 *   patch:
 *     summary: Update current user profile
 *     description: Updates the name and phone of the currently authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!(await hasPermission(session.user.id, 'profile:edit'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
