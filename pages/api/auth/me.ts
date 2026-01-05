import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { getAuthDetails } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

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

    // Fetch user with role and permissions in ONE query to avoid multiple DB hits
    const userWithAuth = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        roleId: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      }
    });

    if (!userWithAuth) {
      return res.status(404).json({ message: 'User not found' });
    }

    let role = userWithAuth.role?.name || null;
    let permissions = userWithAuth.role?.permissions.map((rp) => rp.permission.name) || [];

    // Requirement: New users should be ADMIN by default for demo purposes
    if (!role) {
      console.log(`User ${session.user.id} has no role. Assigning ADMIN by default.`);
      const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' },
      });
      
      if (adminRole) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { roleId: adminRole.id },
        });
        
        // For ADMIN, we always want all permissions
        const allPermissions = await prisma.permission.findMany({
          select: { name: true }
        });
        role = 'ADMIN';
        permissions = allPermissions.map(p => p.name);
      }
    } else if (role === 'ADMIN') {
      // Optimization: If ADMIN, fetch all permissions once
      const allPermissions = await prisma.permission.findMany({
        select: { name: true }
      });
      permissions = allPermissions.map(p => p.name);
    }

    console.log(`Auth details for ${session.user.id}: role=${role}, permissions=${permissions.length}`);

    // Clean up the user object to match expected format
    const { role: _, ...userData } = userWithAuth;

    return res.status(200).json({
      user: userData,
      role,
      permissions,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
