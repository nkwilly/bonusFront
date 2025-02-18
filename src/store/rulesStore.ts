import { create } from 'zustand';
import { BonusRule } from '../types';
import {jwtToken} from "../constants.ts";

interface RulesState {
  rules: BonusRule[];
  addRule: (rule: Omit<BonusRule, 'id'>) => void;
  getRules: () => Promise<void>;
}

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: [],
  addRule: async (rule) => {
    try {
      const newRule = {
        ...rule,
        id: Math.random().toString(36).substr(2, 9),
      };

      const response = await fetch('http://localhost:8080/api/rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRule),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      set({ rules: [...get().rules, data] });

      return data;
    } catch (error) {
      console.error('Error adding rule:', error);
      return null;
    }
  },
  getRules : async (): Promise<BonusRule[]> => {
    try {
      const response = await fetch('http://localhost:8080/api/rules', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      set({
        rules: data,
      });
      return data;
    } catch (error) {
      console.error('Error fetching rules:', error);
      return [];
    }
  },
}));