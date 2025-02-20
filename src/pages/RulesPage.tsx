import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRulesStore } from '../store/rulesStore';
import { useConversionStore } from '../store/conversionStore';
import { RuleDTO } from '../types';
import { AlertTriangle } from 'lucide-react';

const positiveNumberSchema = z.number()
  .min(0, 'La valeur doit être positive')
  .nonnegative('La valeur ne peut pas être négative');

const ruleSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  amountMin: positiveNumberSchema.min(0, 'Le montant minimum doit être positif'),
  amountMax: positiveNumberSchema.nullable(),
  points: positiveNumberSchema.min(1, 'Les points doivent être au moins 1'),
  minDaysForIrregularClients: positiveNumberSchema.min(1, 'Les jours d\'inactivité doivent être au moins 1'),
  alwaysCredit: z.boolean(),
}).refine((data) => {
  if (data.amountMax === null) return true;
  return data.amountMax > data.amountMin;
}, {
  message: "Le montant maximum doit être supérieur au montant minimum",
  path: ["amountMax"],
});

type RuleForm = z.infer<typeof ruleSchema>;

export function RulesPage() {
  const { rules, addRule, getRules } = useRulesStore();
  const { settings: conversionSettings } = useConversionStore();
  const [gapWarning, setGapWarning] = useState<string | null>(null);
  const [suggestedMin, setSuggestedMin] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RuleForm>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      alwaysCredit: false,
      amountMax: null,
    },
  });

  const amountMin = watch('amountMin');
  const amountMax = watch('amountMax');

  useEffect(() => {
    getRules();
  }, [getRules]);

  useEffect(() => {
    if (amountMin && amountMax) {
      const sortedRules = [...rules].sort((a, b) => a.amountMin - b.amountMin);
      const gaps = [];

      // Vérifier les intervalles non continus
      for (let i = 0; i < sortedRules.length; i++) {
        const currentRule = sortedRules[i];
        const nextRule = sortedRules[i + 1];

        if (nextRule) {
          const currentMax = currentRule.amountMax || currentRule.amountMin;
          if (currentMax < nextRule.amountMin - 1) {
            gaps.push({
              start: currentMax + 1,
              end: nextRule.amountMin - 1,
            });
          }
        }
      }

      // Vérifier si la nouvelle règle crée un gap
      const existingRules = rules.filter(
        (r) => r.amountMin <= amountMax && (r.amountMax || r.amountMin) >= amountMin
      );

      if (existingRules.length > 0) {
        setGapWarning("Cette règle chevauche des règles existantes.");
      } else {
        const previousRule = rules
          .filter((r) => r.amountMax !== null && r.amountMax < amountMin)
          .sort((a, b) => (b.amountMax || 0) - (a.amountMax || 0))[0];

        const nextRule = rules
          .filter((r) => r.amountMin > (amountMax || 0))
          .sort((a, b) => a.amountMin - b.amountMin)[0];

        if (previousRule && previousRule.amountMax! < amountMin - 1) {
          setGapWarning(
            `Attention : Aucun bonus ne sera appliqué entre ${previousRule.amountMax!.toLocaleString()} et ${(amountMin - 1).toLocaleString()} ${conversionSettings.currencySymbol}`
          );
          setSuggestedMin(previousRule.amountMax! + 1);
        } else if (nextRule && (amountMax || amountMin) < nextRule.amountMin - 1) {
          setGapWarning(
            `Attention : Aucun bonus ne sera appliqué entre ${(amountMax || amountMin).toLocaleString()} et ${(nextRule.amountMin - 1).toLocaleString()} ${conversionSettings.currencySymbol}`
          );
        } else {
          setGapWarning(null);
          setSuggestedMin(null);
        }
      }
    } else {
      setGapWarning(null);
      setSuggestedMin(null);
    }
  }, [amountMin, amountMax, rules, conversionSettings.currencySymbol]);

  const onSubmit = (data: RuleForm) => {
    addRule(data);
    reset();
    setGapWarning(null);
    setSuggestedMin(null);
  };

  const sortedRules = [...rules].sort((a, b) => a.amountMin - b.amountMin);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Créer une nouvelle règle de bonification
          </h3>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amountMin" className="block text-sm font-medium text-gray-700">
                  Montant minimum ({conversionSettings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('amountMin', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.amountMin && (
                  <p className="mt-1 text-sm text-red-600">{errors.amountMin.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="amountMax" className="block text-sm font-medium text-gray-700">
                  Montant maximum ({conversionSettings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('amountMax', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.amountMax && (
                  <p className="mt-1 text-sm text-red-600">{errors.amountMax.message}</p>
                )}
              </div>
            </div>

            {gapWarning && (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Attention aux intervalles
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>{gapWarning}</p>
                      {suggestedMin && (
                        <button
                          type="button"
                          onClick={() => setValue('amountMin', suggestedMin)}
                          className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Utiliser {suggestedMin.toLocaleString()} {conversionSettings.currencySymbol} comme montant minimum
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                Points
              </label>
              <input
                type="number"
                min="1"
                step="1"
                {...register('points', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.points && (
                <p className="mt-1 text-sm text-red-600">{errors.points.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="minDaysForIrregularClients" className="block text-sm font-medium text-gray-700">
                Jours d'inactivité
              </label>
              <input
                type="number"
                min="1"
                step="1"
                {...register('minDaysForIrregularClients', { valueAsNumber: true })}
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
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Règles de bonification
          </h3>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plage de montant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valeur des points
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jours d'inactivité
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toujours ajouter
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedRules.map((rule) => (
                        <tr key={rule.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rule.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rule.amountMax
                              ? `${rule.amountMin.toLocaleString()} - ${rule.amountMax.toLocaleString()} ${conversionSettings.currencySymbol}`
                              : `≥ ${rule.amountMin.toLocaleString()} ${conversionSettings.currencySymbol}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rule.points}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(rule.points * conversionSettings.pointValue).toLocaleString()} {conversionSettings.currencySymbol}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rule.minDaysForIrregularClients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rule.alwaysCredit ? 'Oui' : 'Non'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}