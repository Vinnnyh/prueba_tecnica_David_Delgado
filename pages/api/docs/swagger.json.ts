import { NextApiRequest, NextApiResponse } from 'next';
import { spec } from '@/lib/swagger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.send(spec);
}
