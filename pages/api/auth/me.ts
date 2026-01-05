import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { getAuthDetails } from '@/lib/auth/permissions';

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user auth details
 *     description: Returns the current user session, role, and permissions.
 *     responses:
 *       200:
 *         description: Auth details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role, permissions } = await getAuthDetails(session.user.id);

    // Fetch fresh user data from DB to ensure name/phone changes are reflected
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        roleId: true,
      }
    });

    return res.status(200).json({
      user: dbUser || session.user,
      role,
      permissions,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
