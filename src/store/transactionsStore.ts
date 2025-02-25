import { create } from 'zustand';
import { Transaction } from '../types';
import {baseURLAPI} from "../constants.ts";

interface TransactionsState {
  transactions: Transaction[];
  getTransactions: () => Promise<Transaction[]>;
}

const jwtToken = sessionStorage.getItem("token");

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  getTransactions:   async (): Promise<Transaction[]> => {
    try {
      const response = await fetch(`${baseURLAPI}/transactions/all-transaction`, {
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
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },
}));