import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {number, z} from 'zod';
import { AVAILABLE_CURRENCIES } from '../types';
import { useConversionStore } from '../store/conversionStore';
import { CoinsIcon } from 'lucide-react';
import {useRulesStore} from "../store/rulesStore.ts";
import {useEffect, useState} from "react";
import {Simulate} from "react-dom/test-utils";
import reset = Simulate.reset;

const conversionSchema = z.object({
    pointValue: z.string()
        .min(1, 'La valeur est requise')
        .refine(
            (val) => !isNaN(parseFloat(val.replace(',', '.'))) && parseFloat(val.replace(',', '.')) > 0,
            'La valeur doit être un nombre positif'
        ),
    currency: z.string().min(1, 'Veuillez sélectionner une devise'),
    currencySymbol: z.string(),
});

type ConversionFormData = {
    pointValue: string;
    currency: string;
    currencySymbol: string;
};

export function ConversionPage() {
    const { settings, updateSettings } = useConversionStore();
    const {setBaseRule, getBaseRule} = useRulesStore();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ConversionFormData>({
        resolver: zodResolver(conversionSchema),
        defaultValues: {
            currency: settings.currency,
            currencySymbol: settings.currencySymbol,
        },
    });
    const [baseRulePoint, setBaseRulePoint]:number = useState(0);
    const [result, setResult] : boolean = useState(false);

    useEffect (() => {
        const loadBaseRule = async () => {
            try {
                const fetchRule = await getBaseRule();
                setBaseRulePoint(fetchRule);
            } catch(error) {
                setBaseRulePoint(0);
                console.error(error);
            }
        }
        loadBaseRule();
    }, [getBaseRule, result]);

    const onSubmit = async (data: ConversionFormData) => {
        const numericPointValue = parseFloat(data.pointValue.replace(',', '.'));
        let res  = await setBaseRule(numericPointValue);
        setResult(res);
        reset();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <CoinsIcon className="h-8 w-8 text-indigo-600" />
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Valeur d'un point : {baseRulePoint} FCFA
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="pointValue" className="block text-sm font-medium text-gray-700">
                                Modifier la valeur d'un point
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="text"
                                    {...register('pointValue')}
                                    placeholder="0,00"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            {errors.pointValue && (
                                <p className="mt-1 text-sm text-red-600">{errors.pointValue.message}</p>
                            )}
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Enregistrer les paramètres
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
