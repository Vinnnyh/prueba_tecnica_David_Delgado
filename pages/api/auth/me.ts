import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';
import { getAuthDetails } from '@/lib/auth/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role, permissions } = await getAuthDetails(session.user.id);

    return res.status(200).json({
      user: session.user,
      role,
      permissions,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
