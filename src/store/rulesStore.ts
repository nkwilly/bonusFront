import { create } from 'zustand';
import { BonusRule } from '../types';
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

const jwtToken = sessionStorage.getItem("token");
interface RulesState {
  rules: BonusRule[];
  addRule: (rule: Omit<BonusRule, 'id'>) => void;
  getRules: () => Promise<void>;
  setBaseRule: (amount: number) => boolean;
  getBaseRule: () => number;
  deleteRule: (ruleId: string) => void;
}

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: [],
  deleteRule: async(ruleId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/rules/${ruleId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
      });
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  getBaseRule: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/rules/rules-points/baseRule', {
        method: "GET",
        headers: {
          'Authorization':`Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
      });
      if(!response.ok)
        return 0;
      const data = await response.json();
      return data.amount;
    } catch (e) {
      console.log(`Error : ${e}`);
      return 0.0;
    }
  },
  setBaseRule: async (amount) => {
    try {
      const baseRule = {
        id: "1",
        amount: amount
      };
      const response = await fetch('http://localhost:8080/api/rules/rules-points/baseRule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(baseRule)
      });
      if (!response.ok) {
        console.log(`response status ${response}`);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },
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