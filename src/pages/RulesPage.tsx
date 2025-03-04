import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRulesStore } from '../store/rulesStore';
import { BonusRule } from "../types";
import Conversion from '../components/Conversion'; // Assumed path to Conversion component

const ruleSchema = z.object({
    description: z.string().min(1, 'La description est requise'),
    amountMin: z.number().min(0, 'Le montant minimum doit être positif'),
    amountMax: z.number().min(0, 'Le montant maximum doit être positif'),
    points: z.number().min(0, 'Les points doivent être au moins 1'),
    minDaysForIrregularClients: z.number().min(0, "Le nombre de jours ne peut être négatif"),
    alwaysCredit: z.boolean(),
});

type RuleForm = z.infer<typeof ruleSchema>;

const Modal = ({ isOpen, onClose, onConfirm, title, children, isSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
                <h2 className={`text-xl font-semibold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {title}
                </h2>
                <div className="mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Fermer
                    </button>
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-md hover:bg-opacity-90 ${isSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                        >
                            {onConfirm ? 'Supprimer' : 'OK'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export function RulesPage() {
    const { rules, addRule, getRules, deleteRule } = useRulesStore();
    const [sortedRules, setSortedRules] = useState<BonusRule[]>([]);
    const [ruleToDelete, setRuleToDelete] = useState<BonusRule | null>();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RuleForm>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            description: '',
            amountMin: 0,
            amountMax: 0,
            points: 1,
            minDaysForIrregularClients: 0,
            alwaysCredit: false,
        },
    });

    const loadRules = async () => {
        try {
            const fetchedRules = await getRules();
            setSortedRules([...fetchedRules].sort((a, b) => a.amountMin - b.amountMin));
        } catch (error) {
            console.error('Erreur lors du chargement des règles:', error);
        }
    };

    useEffect(() => {
        loadRules();
    }, [getRules]);

    const onSubmit = async (data: RuleForm) => {
        try {
            const ruleData: BonusRule = {
                description: data.description,
                amountMin: data.amountMin,
                amountMax: data.amountMax,
                points: data.points,
                alwaysCredit: data.alwaysCredit,
                minDaysForIrregularClients: data.minDaysForIrregularClients,
            };

            await addRule(ruleData);
            await loadRules();
            reset();
            setSuccessMessage('Règle créée avec succès!');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la règle:', error);
            setErrorMessage('Erreur lors de la création de la règle.');
            setShowErrorModal(true);
        }
    };

    const handleDelete = async () => {
        if (!ruleToDelete?.id) return;

        try {
            await deleteRule(ruleToDelete.id);
            await loadRules();
            setRuleToDelete(null);
        } catch (error) {
            console.error('Erreur lors de la suppression de la règle:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Créer une nouvelle règle de bonification
                    </h3>
                    <div className="flex items-center">
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

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="amountMin" className="block text-xs font-medium text-gray-700">
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
                            </div>

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="amountMax" className="block text-xs font-medium text-gray-700">
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
                                    {...register('alwaysCredit')}
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
                        <Conversion/>
                    </div>

                </div>
            </div>

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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
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
                                        {rule.amountMin}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {rule.amountMax}
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
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <button
                                            onClick={() => setRuleToDelete(rule)}
                                            className="text-red-600 hover:text-red-900 font-medium"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal
                isOpen={!!ruleToDelete}
                onClose={() => setRuleToDelete(null)}
                onConfirm={handleDelete}
                title="Confirmer la suppression"
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer la règle "{ruleToDelete?.description}" ?
                    Cette action ne peut pas être annulée.
                </p>
            </Modal>

            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Succès"
                isSuccess={true}
            >
                <p>{successMessage}</p>
            </Modal>

            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Erreur"
                isSuccess={false}
            >
                <p>{errorMessage}</p>
            </Modal>
        </div>
    );
}
