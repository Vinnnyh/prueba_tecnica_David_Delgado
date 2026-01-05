import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from '@/components/atoms/permission-guard';
import { useAtomValue } from 'jotai';
import {
  userAtom,
  permissionsAtom,
  isAdminAtom,
  isSessionLoadingAtom,
} from '@/lib/auth/atoms';
import React from 'react';

// Mock jotai
vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>();
  return {
    ...actual,
    useAtomValue: vi.fn(),
  };
});

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    query: {},
    asPath: '',
    pathname: '',
    isReady: true,
  }),
}));

describe('PermissionGuard Component', () => {
  it('should render children if user has permission', () => {
    (useAtomValue as any).mockImplementation((atom: any) => {
      if (atom === userAtom) return { id: '1' };
      if (atom === permissionsAtom) return ['users:view'];
      if (atom === isAdminAtom) return false;
      if (atom === isSessionLoadingAtom) return false;
      return null;
    });

    render(
      <PermissionGuard permission='users:view'>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show access denied if user lacks permission', () => {
    (useAtomValue as any).mockImplementation((atom: any) => {
      if (atom === userAtom) return { id: '1' };
      if (atom === permissionsAtom) return ['other:permission'];
      if (atom === isAdminAtom) return false;
      if (atom === isSessionLoadingAtom) return false;
      return null;
    });

    render(
      <PermissionGuard permission='users:view'>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children if user is ADMIN regardless of permissions', () => {
    (useAtomValue as any).mockImplementation((atom: any) => {
      if (atom === userAtom) return { id: '1' };
      if (atom === permissionsAtom) return [];
      if (atom === isAdminAtom) return true;
      if (atom === isSessionLoadingAtom) return false;
      return null;
    });

    render(
      <PermissionGuard permission='any:permission'>
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render fallback if provided and permission is denied', () => {
    (useAtomValue as any).mockImplementation((atom: any) => {
      if (atom === userAtom) return { id: '1' };
      if (atom === permissionsAtom) return [];
      if (atom === isAdminAtom) return false;
      if (atom === isSessionLoadingAtom) return false;
      return null;
    });

    render(
      <PermissionGuard
        permission='secret:view'
        fallback={<div>Custom Fallback</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
