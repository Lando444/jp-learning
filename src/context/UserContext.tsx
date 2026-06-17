import { createContext, useContext } from 'react';
import type { UserProfile } from '../types/learning';

export type UserContextValue = {
  user: UserProfile;
  signOut: () => Promise<void>;
};

export const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const value = useContext(UserContext);

  if (!value) {
    throw new Error('useUser must be used inside UserContext.Provider');
  }

  return value;
}
