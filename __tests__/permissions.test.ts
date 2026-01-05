import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasPermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    permission: {
      findMany: vi.fn(),
    },
  },
}));

describe('Permissions Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true if user has the specific permission', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      role: {
        name: 'USER',
        permissions: [
          { permission: { name: 'users:view' } }
        ]
      }
    });

    const result = await hasPermission('user-1', 'users:view');
    expect(result).toBe(true);
  });

  it('should return false if user does not have the specific permission', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      role: {
        name: 'USER',
        permissions: [
          { permission: { name: 'users:view' } }
        ]
      }
    });

    const result = await hasPermission('user-1', 'admin:view');
    expect(result).toBe(false);
  });

  it('should return true for any permission if user is ADMIN', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      role: {
        name: 'ADMIN',
        permissions: [] // Even if empty in DB for this user
      }
    });

    (prisma.permission.findMany as any).mockResolvedValue([
      { name: 'admin:view' },
      { name: 'users:edit' }
    ]);

    const result = await hasPermission('admin-1', 'admin:view');
    expect(result).toBe(true);
    
    const result2 = await hasPermission('admin-1', 'users:edit');
    expect(result2).toBe(true);
  });
});
