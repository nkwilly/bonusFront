import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRulesStore } from '../store/rulesStore';
import { BonusRule } from "../types";
import Conversion from '../components/Conversion';

const ruleSchema = z.object({
    description: z.string().min(1, 'La description est requise'),
    amountMin: z.number().min(0, 'Le montant minimum doit être positif'),
    amountMax: z.number().min(0, 'Le montant maximum doit être positif'),
    points: z.number().min(0, 'Les points doivent être au moins 1'),
    minDaysForIrregularClients: z.number().min(0, "Le nombre de jours ne peut être négatif"),
    alwaysCredit: z.boolean(),
});

type RuleForm = z.infer<typeof ruleSchema>;

// Modal générique pour les messages
const MessageModal = ({
                          isOpen,
                          onClose,
                          title,
                          message,
                          type = 'success'
                      }: {
    isOpen: boolean,
    onClose: () => void,
    title: string,
    message: string,
    type?: 'success' | 'error'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
                <h2 className={`text-xl font-semibold mb-4 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {title}
                </h2>
                <div className="mb-6">
                    <p className={type === 'success' ? 'text-green-800' : 'text-red-800'}>{message}</p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal de confirmation de suppression (inchangé)
const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <div className="mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export function RulesPage() {
    const { rules, addRule, getRules, deleteRule } = useRulesStore();
    const [sortedRules, setSortedRules] = useState<BonusRule[]>([]);
    const [ruleToDelete, setRuleToDelete] = useState<BonusRule | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            setErrorMessage('Impossible de charger les règles');
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
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la règle:', error);
            setErrorMessage('Impossible de créer la règle');
        }
    };

    const handleDelete = async () => {
        if (!ruleToDelete?.id) return;

        try {
            await deleteRule(ruleToDelete.id);
            await loadRules();
            setRuleToDelete(null);
            setSuccessMessage('Règle supprimée avec succès!');
        } catch (error) {
            console.error('Erreur lors de la suppression de la règle:', error);
            setErrorMessage('Impossible de supprimer la règle');
        }
    };

    return (
        <div className="space-y-8">
            {/* Le reste du code reste identique */}

            {/* Modals de succès et d'erreur */}
            <MessageModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                title="Succès"
                message={successMessage || ''}
                type="success"
            />

            <MessageModal
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                title="Erreur"
                message={errorMessage || ''}
                type="error"
            />

            {/* Modals existants */}
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
        </div>
    );
}