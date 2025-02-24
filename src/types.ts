export interface User {
  id: string;
  email: string;
  name: string;
}

export interface BonusRule {
  id: string;
  description: string;
  amountMin: number;
  amountMax: number;
  points: number;
  minDaysForIrregularClients: number;
  alwaysCredit: boolean;
  pointsValue: number; // Valeur en FCFA pour la conversion des points
  requiredPoints: number; // Nombre de points nécessaires pour obtenir la réduction
}

export interface Transaction {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  clientLogin: string;
  isDebit: boolean;
  date: string;
  points: number;
}

export interface ConversionSettings {
  amount: number;
  currency: string;
  currencySymbol: string;
}

export const AVAILABLE_CURRENCIES = [
  { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar US' },
  { code: 'GBP', symbol: '£', name: 'Livre Sterling' },
] as const;