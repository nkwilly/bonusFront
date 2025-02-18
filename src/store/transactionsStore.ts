import { create } from 'zustand';
import { Transaction } from '../types';
import {jwtToken} from "../constants.ts";

interface TransactionsState {
  transactions: Transaction[];
  getTransactions: () => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  getTransactions:   async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8080/api/transactions/all-transaction', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      set({
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  },
}));