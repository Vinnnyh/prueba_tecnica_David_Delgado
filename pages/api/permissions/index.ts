import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * @openapi
 * /api/permissions:
 *   get:
 *     summary: List all available permissions
 *     description: Returns a list of all permissions defined in the system. Requires roles:view permission.
 *     responses:
 *       200:
 *         description: List of permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       405:
 *         description: Method not allowed
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Only users with roles:view can see permissions
    if (!(await hasPermission(session.user.id, 'roles:view'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'GET') {
      const permissions = await prisma.permission.findMany({
        orderBy: { name: 'asc' },
      });

      return res.status(200).json(permissions);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
