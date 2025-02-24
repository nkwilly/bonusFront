import create from 'zustand';
import { persist } from 'zustand/middleware';
import { ConversionSettings, AVAILABLE_CURRENCIES } from '../types';

interface ConversionState {
    value: number;
    settings: ConversionSettings;
    setValue: (value: number) => void;
    updateSettings: (settings: ConversionSettings) => void;
    convertTo: (conversionRate: number) => number;
}

export const useConversionStore = create<ConversionState>()(

    persist(
        (set, get) => ({
            value: 0,
            settings: {
                amount: 100,
                currency: 'XOF',
                currencySymbol: 'FCFA',
            },
            setValue: (value: number) => set({ value }),
            updateSettings: (settings: ConversionSettings) => set({ settings }),
            convertTo: (conversionRate: number) => {
                return get().value * conversionRate;
            },
        }),
        {
            name: 'conversion-settings',
        }
    )
);

export default useConversionStore;