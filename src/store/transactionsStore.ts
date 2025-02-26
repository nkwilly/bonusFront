import { create } from 'zustand';
import { Transaction } from '../types';
import {baseURLAPI} from "../constants.ts";

interface TransactionsState {
  transactions: Transaction[];
  getTransactions: () => Promise<Transaction[]>;
}

const jwtTokenTemp = sessionStorage.getItem("token");
const jwtToken = jwtTokenTemp == null ? "" : jwtTokenTemp.toString();

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  getTransactions:   async (): Promise<Transaction[]> => {
    try {
      const specialToken = sessionStorage.getItem("token")!.toString();
      const response = await fetch(`${baseURLAPI}/transactions/all-transaction`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${specialToken}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      set({
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
      });
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },
}));