import React, { ReactNode } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole, UserProfile } from '../shared/types/app';

interface UserContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  phoneNumber: string | null;
  setPhoneNumber: (phoneNumber: string | null) => void;
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  walletBalance: number;
  setWalletBalance: (v: number) => void;
  hasHydrated: boolean;
  resetSession: () => void;
}

const initialState = {
  role: null as UserRole | null,
  phoneNumber: null as string | null,
  isOnline: true,
  currentUser: null as UserProfile | null,
  isAuthenticated: false,
  walletBalance: 500,
  hasHydrated: false,
};

const useUserStore = create<UserContextType>()(
  persist(
    set => ({
      ...initialState,
      setRole: role => set({ role }),
      setPhoneNumber: phoneNumber => set({ phoneNumber }),
      setIsOnline: isOnline => set({ isOnline }),
      setCurrentUser: currentUser => set({ currentUser }),
      setIsAuthenticated: isAuthenticated => set({ isAuthenticated }),
      setWalletBalance: walletBalance => set({ walletBalance }),
      resetSession: () =>
        set({
          ...initialState,
          hasHydrated: true,
        }),
    }),
    {
      name: 'connecto-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        role: state.role,
        phoneNumber: state.phoneNumber,
        isOnline: state.isOnline,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        walletBalance: state.walletBalance,
      }),
      onRehydrateStorage: () => () => {
        useUserStore.setState({ hasHydrated: true });
      },
    },
  ),
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useUser = () => useUserStore();
