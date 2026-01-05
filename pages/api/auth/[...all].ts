import { toNodeHandler } from 'better-auth/node';
import { auth } from '@/lib/auth';

// Disallow body parsing, we will parse it manually
export const config = { api: { bodyParser: false } };

const handler = toNodeHandler(auth.handler);

export default handler;
