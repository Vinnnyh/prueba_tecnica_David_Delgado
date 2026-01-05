import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Returns a list of all users with their roles. Requires users:view permission.
 *     responses:
 *       200:
 *         description: List of users
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
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as unknown as HeadersInit),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      if (!(await hasPermission(session.user.id, 'users:view'))) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const users = await prisma.user.findMany({
        include: {
          role: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(users);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: String(error) });
  }
}
