import { create } from 'zustand';
import { User } from '../types';
import {baseURLAPI} from "../constants.ts";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  login: async (login, password) => {
    try {

      console.log(JSON.stringify({login, password}));
      const response = await fetch(`${baseURLAPI}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({login, password}),
      });

      console.log("response");

      if (!response.ok)
        throw new Error('Login failed');

      const data = await response.json();

      console.log(data);
      console.log(data.token);
      sessionStorage.setItem("token", `${data.token.toString()}`);

      set({
        user: {
          id: data.id,
          username: data.username,
          email: data.email,
          token: data.token,
          refreshToken: data.refreshToken,
          roles: data.roles,
        },
      });
    } catch (error) {
      console.error(error);
    }
  },

  register: async (username, password, email) => {
    try {
      const response = await fetch(`${baseURLAPI}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Automatically log in after registration
      await useAuthStore.getState().login(username, password);
    } catch (error) {
      console.error(error);
    }
  },

  logout: () => localStorage.removeItem("token"),
}));