import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  user: {
    additionalFields: {
      roleId: {
        type: 'string',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Requirement: All new users must be ADMIN for testing purposes
          const adminRole = await prisma.role.findUnique({
            where: { name: 'ADMIN' },
          });
          return {
            data: {
              ...user,
              roleId: adminRole?.id,
            },
          };
        },
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
