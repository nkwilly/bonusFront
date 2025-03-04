import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CoinsIcon } from 'lucide-react';
import { useRulesStore } from '../store/rulesStore';

const conversionSchema = z.object({
    pointValue: z.string()
        .min(1, 'La valeur est requise')
        .refine(
            (val) => !isNaN(parseFloat(val.replace(',', '.'))) && parseFloat(val.replace(',', '.')) > 0,
            'La valeur doit être un nombre positif'
        )
});

interface ConversionFormData {
    pointValue: string;
}

// Export par défaut ajouté ici
export default function Conversion() {
    const { setBaseRule, getBaseRule } = useRulesStore();
    const [baseRulePoint, setBaseRulePoint] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ConversionFormData>({
        resolver: zodResolver(conversionSchema),
        defaultValues: {
            pointValue: ''
        }
    });

    useEffect(() => {
        const loadBaseRule = async () => {
            try {
                const fetchedRule = await getBaseRule();
                setBaseRulePoint(fetchedRule || 0);
            } catch (error) {
                console.error('Erreur lors du chargement de la règle de base :', error);
                setBaseRulePoint(0);
            }
        };

        loadBaseRule();
    }, [getBaseRule]);

    const onSubmit = async (data: ConversionFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const numericPointValue = parseFloat(data.pointValue.replace(',', '.'));
            const result = await setBaseRule(numericPointValue);

            if (result) {
                setBaseRulePoint(numericPointValue);
                reset();
            } else {
                setSubmitError('Impossible de mettre à jour la valeur du point');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour :', error);
            setSubmitError('Une erreur est survenue lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <CoinsIcon className="h-8 w-8 text-indigo-600" />
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Valeur d'un point : {baseRulePoint.toFixed(2)} FCFA
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
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            {errors.pointValue && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.pointValue.message}
                                </p>
                            )}
                            {submitError && (
                                <p className="mt-1 text-sm text-red-600">
                                    {submitError}
                                </p>
                            )}
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                                    ${isSubmitting
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                } 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            >
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}