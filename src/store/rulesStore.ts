import { create } from 'zustand';
import { BonusRule } from '../types';
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {baseURLAPI} from "../constants.ts";

const jwtTokenTemp = sessionStorage.getItem("token");
const jwtToken = jwtTokenTemp == null ? "" : jwtTokenTemp.toString();

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
      const specialToken = sessionStorage.getItem("token")!.toString();
      const response = await fetch(`${baseURLAPI}/rules/${ruleId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${specialToken}`,
          'Content-Type': 'application/json'
        },
      });
    } catch (e) {
      return false;
    }
  },
  getBaseRule: async () => {
    try {
      const specialToken = sessionStorage.getItem("token")!.toString();
      const response = await fetch(`${baseURLAPI}/rules/rules-points/baseRule`, {
        method: "GET",
        headers: {
          'Authorization':`Bearer ${specialToken}`,
          'Content-Type': 'application/json'
        },
      });
      if(!response.ok)
        return 0;
      const data = await response.json();
      return data.amount;
    } catch (e) {
      return 0.0;
    }
  },
  setBaseRule: async (amount) => {
    try {
      const baseRule = {
        id: "1",
        amount: amount
      };
      const specialToken = sessionStorage.getItem("token")!.toString();
      const response = await fetch(`${baseURLAPI}/rules/rules-points/baseRule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${specialToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(baseRule)
      });
      if (!response.ok) {
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
      const specialToken = sessionStorage.getItem("token")!.toString();
      const response = await fetch(`${baseURLAPI}/rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${specialToken}`,
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
      return null;
    }
  },
  getRules : async (): Promise<BonusRule[]> => {
    try {
      const specialToken = sessionStorage.getItem("token")!.toString();
      const response = await fetch(`${baseURLAPI}/rules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${specialToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      set({
        rules: data,
      });
      return data;
    } catch (error) {
      return [];
    }
  },
}));
