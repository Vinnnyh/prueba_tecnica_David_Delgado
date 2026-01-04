import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as any),
  });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    if (!(await hasPermission(session.user.id, 'users:edit'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: { roleId },
    });

    return res.status(200).json(updatedUser);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
