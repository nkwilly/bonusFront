import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    // TODO: Implement actual API call
    set({
      user: {
        id: '1',
        email,
        name: 'John Doe',
      },
    });
  },
  register: async (email, password, name) => {
    // TODO: Implement actual API call
    set({
      user: {
        id: '1',
        email,
        name,
      },
    });
  },
  logout: () => set({ user: null }),
}));