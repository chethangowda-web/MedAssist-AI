import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { ocrApi } from '@services/api';
import { Upload, FileText, ScanLine, Sparkles, ClipboardList, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function OcrPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  const extractMutation = useMutation({
    mutationFn: (file: File) => ocrApi.extractText(file),
    onSuccess: (res) => {
      setExtractedData(res.data);
      toast.success('Text extracted successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Extraction failed'),
  });

  const prescriptionMutation = useMutation({
    mutationFn: (file: File) => ocrApi.extractPrescription(file),
    onSuccess: (res) => {
      setExtractedData(res.data);
      toast.success('Prescription parsed');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Parsing failed'),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setExtractedData(null);
  };

  return (
    <div>
      <Header title="OCR Scanner" subtitle="Extract text from medical documents and prescriptions" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-500" />
                <CardTitle>Upload Document</CardTitle>
              </div>
              <Badge variant="primary">AI OCR</Badge>
            </CardHeader>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
                ) : (
                  <div className="py-8">
                    <ImageIcon className="w-12 h-12 mx-auto text-surface-400 mb-4" />
                    <p className="text-sm text-surface-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      JPG, PNG, WebP, TIFF, PDF (max 10MB)
                    </p>
                  </div>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-surface-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => selectedFile && extractMutation.mutate(selectedFile)}
                  isLoading={extractMutation.isPending}
                  disabled={!selectedFile}
                  className="flex-1"
                >
                  <ScanLine className="w-4 h-4 mr-2" />
                  Extract Text
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => selectedFile && prescriptionMutation.mutate(selectedFile)}
                  isLoading={prescriptionMutation.isPending}
                  disabled={!selectedFile}
                  className="flex-1"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Parse Prescription
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-500" />
                <CardTitle>Extracted Data</CardTitle>
              </div>
              {(extractMutation.isPending || prescriptionMutation.isPending) && (
                <LoadingSpinner size="sm" />
              )}
            </CardHeader>
            {extractedData ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {extractedData.extracted_text && (
                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2 block">
                      Raw Extracted Text
                    </label>
                    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap font-mono">
                      {extractedData.extracted_text}
                    </div>
                  </div>
                )}

                {extractedData.result?.vital_signs && Object.keys(extractedData.result.vital_signs).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2 block">
                      Vital Signs
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(extractedData.result.vital_signs).map(([key, value]) => (
                        <div key={key} className="p-2 rounded-lg bg-primary-500/5">
                          <p className="text-xs text-surface-500 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-bold text-surface-900 dark:text-white">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {extractedData.result?.lab_values && Object.keys(extractedData.result.lab_values).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2 block">
                      Lab Values
                    </label>
                    <div className="space-y-1">
                      {Object.entries(extractedData.result.lab_values).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                          <span className="text-sm text-surface-600 dark:text-surface-400 capitalize">{key}</span>
                          <span className="text-sm font-bold text-surface-900 dark:text-white">
                            {val.value} {val.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {extractedData.result?.medications?.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2 block">
                      Medications Found
                    </label>
                    {extractedData.result.medications.map((med: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent-500/5 mb-1">
                        <Sparkles className="w-4 h-4 text-accent-500" />
                        <span className="text-sm text-surface-700 dark:text-surface-300">{med.name}</span>
                        {med.dosage && (
                          <Badge variant="info">{med.dosage}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-surface-400">
                <Upload className="w-12 h-12 mb-4" />
                <p className="text-sm">Upload a document to extract text</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
