import { atom } from 'jotai';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  phone?: string;
  roleId?: string;
}

export const userAtom = atom<User | null>(null);
export const roleAtom = atom<string | null>(null);
export const permissionsAtom = atom<string[]>([]);
export const isAuthLoadingAtom = atom<boolean>(false);
export const isSessionLoadingAtom = atom<boolean>(true);

// Derived atoms for convenience
export const isAdminAtom = atom((get) => get(roleAtom) === 'ADMIN');
