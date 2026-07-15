import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { medicineApi } from '@services/api';
import { Pill, Search, AlertTriangle, CheckCircle2, BookOpen, Barcode, Shield, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export function MedicinePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicinesList, setMedicinesList] = useState<string[]>(['', '']);
  const [interactionResult, setInteractionResult] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>(null);

  const { data: commonMeds, isLoading: commonLoading } = useQuery({
    queryKey: ['common-medicines'],
    queryFn: () => medicineApi.listCommon().then(r => r.data),
  });

  const searchMutation = useMutation({
    mutationFn: (name: string) => medicineApi.search(name),
    onSuccess: (res) => setSearchResult(res.data),
    onError: () => toast.error('Search failed'),
  });

  const interactionMutation = useMutation({
    mutationFn: (meds: string[]) => medicineApi.checkInteractions(meds),
    onSuccess: (res) => setInteractionResult(res.data),
    onError: () => toast.error('Interaction check failed'),
  });

  const addMedicineField = () => setMedicinesList([...medicinesList, '']);

  const updateMedicine = (index: number, value: string) => {
    const updated = [...medicinesList];
    updated[index] = value;
    setMedicinesList(updated);
  };

  const removeMedicine = (index: number) => {
    if (medicinesList.length > 2) {
      setMedicinesList(medicinesList.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <Header title="Medicine Scanner" subtitle="Search medicines, check interactions, and identify drugs" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary-500" />
                <CardTitle>Search Medicine</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by generic or brand name..."
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && searchQuery && searchMutation.mutate(searchQuery)}
                />
                <Button
                  onClick={() => searchMutation.mutate(searchQuery)}
                  isLoading={searchMutation.isPending}
                  disabled={!searchQuery}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searchResult && (
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 space-y-3">
                  {searchResult.status === 'found' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-semibold text-surface-900 dark:text-white">{searchResult.medicine.generic_name}</span>
                        <Badge variant="success">Found</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-surface-500">Category</p>
                          <p className="font-medium text-surface-900 dark:text-white capitalize">{searchResult.medicine.category.replace(/_/g, ' ')}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Common Dosage</p>
                          <p className="font-medium text-surface-900 dark:text-white">{searchResult.medicine.common_dosage}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Uses</p>
                        <div className="flex flex-wrap gap-1">
                          {searchResult.medicine.uses.map((use: string, i: number) => (
                            <Badge key={i} variant="info">{use}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Side Effects</p>
                        <div className="flex flex-wrap gap-1">
                          {searchResult.medicine.side_effects.map((se: string, i: number) => (
                            <Badge key={i} variant="warning">{se}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Brand Names</p>
                        <p className="text-sm text-surface-700 dark:text-surface-300">{searchResult.medicine.brand_names.join(', ')}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-surface-500">
                      <p>Medicine "{searchQuery}" not found in database</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <CardTitle>Drug Interaction Check</CardTitle>
              </div>
              <Badge variant="warning">Safety Tool</Badge>
            </CardHeader>
            <div className="space-y-4">
              {medicinesList.map((med, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={med}
                    onChange={(e) => updateMedicine(index, e.target.value)}
                    placeholder={`Medicine ${index + 1} name...`}
                    className="input-field flex-1"
                  />
                  {medicinesList.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedicine(index)}
                      className="text-red-500"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={addMedicineField}>
                  + Add Medicine
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const validMeds = medicinesList.filter(m => m.trim());
                    if (validMeds.length < 2) {
                      toast.error('Need at least 2 medicines');
                      return;
                    }
                    interactionMutation.mutate(validMeds);
                  }}
                  isLoading={interactionMutation.isPending}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Check
                </Button>
              </div>

              {interactionResult && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl ${
                    interactionResult.safe
                      ? 'bg-emerald-500/5 border border-emerald-500/20'
                      : 'bg-red-500/5 border border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      {interactionResult.safe ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`font-medium ${interactionResult.safe ? 'text-emerald-500' : 'text-red-500'}`}>
                        {interactionResult.safe ? 'No interactions found' : `${interactionResult.interactions_found} interaction(s) found`}
                      </span>
                    </div>
                  </div>
                  {interactionResult.interactions?.map((interaction: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-surface-900 dark:text-white">
                          {interaction.medicines.join(' + ')}
                        </span>
                        <Badge variant={interaction.severity === 'high' ? 'danger' : interaction.severity === 'moderate' ? 'warning' : 'info'}>
                          {interaction.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">{interaction.effect}</p>
                      <p className="text-xs text-surface-500 mt-1">
                        <strong>Recommendation:</strong> {interaction.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              <CardTitle>Common Medicines Database</CardTitle>
            </div>
            <span className="text-xs text-surface-500">{commonMeds?.total || 0} entries</span>
          </CardHeader>
          {commonLoading ? (
            <LoadingSpinner size="sm" className="py-8" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {commonMeds?.medicines?.map((med: any, i: number) => (
                <motion.div
                  key={med.generic_name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSearchQuery(med.generic_name);
                    searchMutation.mutate(med.generic_name);
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-primary-500" />
                    <span className="font-medium text-surface-900 dark:text-white text-sm">{med.generic_name}</span>
                  </div>
                  <p className="text-xs text-surface-500 mb-1 capitalize">{med.category.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-surface-400">{med.brand_names.slice(0, 3).join(', ')}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {med.uses.slice(0, 2).map((use: string, j: number) => (
                      <Badge key={j} variant="info" size="sm">{use}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
