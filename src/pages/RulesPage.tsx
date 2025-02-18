import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRulesStore } from '../store/rulesStore';

// Le schéma Zod est correctement défini avec tous les champs nécessaires
const ruleSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  minAmount: z.number().min(0, 'Le montant minimum doit être positif'),
  points: z.number().min(1, 'Les points doivent être au moins 1'),
  // Suppression des champs non utilisés dans votre interface
  requiredPoints: z.number().min(1, 'Le nombre de points nécessaires doit être au moins 1'),
  pointsValue: z.number().min(1, 'La valeur en FCFA doit être au moins 1'),
  alwaysAdd: z.boolean(),
});

// Type inference pour TypeScript
type RuleForm = z.infer<typeof ruleSchema>;

export function RulesPage() {
  // Utilisation du store avec déstructuration des méthodes nécessaires
  const { rules, addRule, getRules } = useRulesStore();
  const [sortedRules, setSortedRules] = useState([]);

  // Configuration du formulaire avec react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
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

  // Effet pour charger et trier les règles
  useEffect(() => {
    const loadRules = async () => {
      try {
        const fetchedRules = await getRules();
        // Tri des règles par montant minimum
        const sortedRulesTemp = [...fetchedRules].sort((a, b) => a.amountMin - b.amountMin);
        setSortedRules(sortedRulesTemp);
      } catch (error) {
        console.error('Erreur lors du chargement des règles:', error);
      }
    };

    loadRules();
  }, [getRules, addRule]);

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (data: RuleForm) => {
    try {
      const ruleData = {
        description: data.description,
        amountMin: data.minAmount,
        points: data.points,
        alwaysCredit: data.alwaysAdd,
        minDaysForIrregularClients: 0,
      };

      await addRule(ruleData);
      reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la règle:', error);
    }
  };

  // Surveillance des champs pour le calcul dynamique
  const requiredPoints = watch('requiredPoints') || 1;
  const pointsValue = watch('pointsValue') || 1;

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
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                    type="text"
                    {...register('description')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
                {errors.description && (
                    <p className="text-red-600 text-sm">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Montant minimum (FCFA)
                </label>
                <input
                    type="number"
                    {...register('minAmount', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
                {errors.minAmount && (
                    <p className="text-red-600 text-sm">{errors.minAmount.message}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Conversion des points en bonus
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de points nécessaires
                  </label>
                  <input
                      type="number"
                      {...register('requiredPoints', { valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  />
                  {errors.requiredPoints && (
                      <p className="text-red-600 text-sm">{errors.requiredPoints.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valeur en FCFA
                  </label>
                  <input
                      type="number"
                      {...register('pointsValue', { valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  />
                  {errors.pointsValue && (
                      <p className="text-red-600 text-sm">{errors.pointsValue.message}</p>
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700">
                    {requiredPoints} points = {pointsValue.toLocaleString()} FCFA de réduction
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    (1 point = {(pointsValue / requiredPoints).toFixed(2)} FCFA)
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                    type="checkbox"
                    {...register('alwaysAdd')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Toujours ajouter les points (même lors de l'utilisation des points)
                </label>
              </div>

              <div>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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
                      Montant
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
                  {sortedRules.map((rule, index) => (
                      <tr key={rule.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {rule.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {index === sortedRules.length - 1
                              ? `≥ ${rule.amountMin.toLocaleString()} FCFA`
                              : `${rule.amountMin.toLocaleString()} - ${(
                                  sortedRules[index + 1].amountMin - 1
                              ).toLocaleString()} FCFA`}
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