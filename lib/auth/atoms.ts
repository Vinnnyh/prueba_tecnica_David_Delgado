import { atom } from 'jotai';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: {
    name: string;
  };
}

export const userAtom = atom<User | null>(null);
export const isAuthLoadingAtom = atom<boolean>(true);
export const isSessionLoadingAtom = atom<boolean>(true);
