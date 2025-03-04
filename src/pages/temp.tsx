import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useRulesStore} from '../store/rulesStore';
import {BonusRule} from "../types.ts";

// Le schéma Zod est correctement défini avec tous les champs nécessaires
const ruleSchema = z.object({
    description: z.string().min(1, 'La description est requise'),
    amountMin: z.number().min(0, 'Le montant minimum doit être positif'),
    amountMax: z.number().min(0, 'Le montant maximum doit être positif'),
    points: z.number().min(0, 'Les points doivent être au moins 1'),
    minDaysForIrregularClients: z.number().min(0, "Le nombre de jours ne peut être négatif"),
    // requiredPoints: z.number().min(1, 'Le nombre de points nécessaires doit être au moins 1'),
    //pointsValue: z.number().min(1, 'La valeur en  doit être au moins 1'),
    alwaysAdd: z.boolean(),
    amount: z.number().min(0, "Le montant minimum est doit être supérieur à 0")
});

// Type inference pour TypeScript
type RuleForm = z.infer<typeof ruleSchema>;

export function RulesPage() {
    const {rules, addRule, getRules, setBaseRule} = useRulesStore();
    const [sortedRules, setSortedRules] = useState([]);
    const [disabled, setDisabled] : boolean= useState(true);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: {errors},
    } = useForm<RuleForm>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            alwaysAdd: false,
            requiredPoints: 10,
            pointsValue: 1000,
            // Ajout des autres valeurs par défaut pour éviter les champs undefined
            description: '',
            minAmount: 0,
            points: 1,
        },
    });

    useEffect(() => {
        const loadRules = async () => {
            try {
                const fetchedRules = await getRules();
                const sortedRulesTemp = [...fetchedRules].sort((a, b) => a.amountMin - b.amountMin);
                setSortedRules(sortedRulesTemp);
            } catch (error) {
                console.error('Erreur lors du chargement des règles:', error);
            }
        };
        loadRules();
    }, [getRules, addRule]);

    const onSubmit = async (data: RuleForm) => {
        console.log("bonjour le monde");
        try {
            console.log(data);
            const ruleData : BonusRule = {
                description: data.description,
                amountMin: data.amountMin,
                amountMax: data.amountMax,
                points: data.points,
                alwaysCredit: data.alwaysAdd,
                minDaysForIrregularClients: data.minDaysForIrregularClients,
            };
            console.log(ruleData);
            await addRule(ruleData);
            reset();
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la règle:', error);
        }
    };
    return (
        <div className="space-y-8">

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Créer une nouvelle règle de bonification
                    </h3>
                    {/* Le formulaire reste identique mais avec une meilleure gestion des erreurs */}
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <input
                                type="text"
                                {...register('description')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="amountMin" className="block text-sm font-medium text-gray-700">
                                Montant minimum
                            </label>
                            <input
                                type="number"
                                {...register('amountMin', {valueAsNumber: true})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.amountMin && (
                                <p className="mt-1 text-sm text-red-600">{errors.amountMin.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="amountMin" className="block text-sm font-medium text-gray-700">
                                Montant maximum
                            </label>
                            <input
                                type="number"
                                {...register('amountMax', {valueAsNumber: true})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.amountMax && (
                                <p className="mt-1 text-sm text-red-600">{errors.amountMax.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                                Points
                            </label>
                            <input
                                type="number"
                                {...register('points', {valueAsNumber: true})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.points && (
                                <p className="mt-1 text-sm text-red-600">{errors.points.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="minDaysForIrregularClients"
                                   className="block text-sm font-medium text-gray-700">
                                Jours d'inactivité
                            </label>
                            <input
                                type="number"
                                {...register('minDaysForIrregularClients', {valueAsNumber: true})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.minDaysForIrregularClients && (
                                <p className="mt-1 text-sm text-red-600">{errors.minDaysForIrregularClients.message}</p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                {...register("alwaysCredit")}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="alwaysCredit" className="ml-2 block text-sm text-gray-900">
                                Toujours ajouter les points (même lors de l'utilisation des points)
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Créer la règle
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Section d'affichage des règles */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Règles de bonification
                    </h3>
                    {sortedRules.length === 0 ? (
                        <p className="text-gray-500">Aucune règle disponible pour le moment.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Montant minimum
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Montant maximum
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Points
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Inactivité
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Toujours ajouter
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {sortedRules.map((rule: BonusRule) => (
                                <tr key={rule.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {rule.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {`${rule.amountMin} `}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {`${rule.amountMax} `}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {rule.points || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {rule.minDaysForIrregularClients || '0'} jours
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {rule.alwaysCredit ? 'Oui' : 'Non'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}