import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { voiceApi } from '@services/api';
import { Mic, StopCircle, Play, Download, Languages, Volume2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [language, setLanguage] = useState('en');
  const [text, setText] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const { data: languagesData } = useQuery({
    queryKey: ['voice-languages'],
    queryFn: () => voiceApi.getLanguages().then(r => r.data),
  });

  const transcribeMutation = useMutation({
    mutationFn: (blob: Blob) => voiceApi.speechToText(blob, language),
    onSuccess: (res) => {
      setTranscribedText(res.data.text);
      if (res.data.text) {
        toast.success('Speech transcribed successfully');
      } else {
        toast.error('No speech detected');
      }
    },
    onError: () => toast.error('Transcription failed'),
  });

  const ttsMutation = useMutation({
    mutationFn: () => voiceApi.textToSpeech(text, language),
    onSuccess: (res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const audio = new Audio(url);
      audio.play();
      toast.success('Playing audio');
    },
    onError: () => toast.error('Text-to-speech failed'),
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const languages = languagesData?.languages || {};

  return (
    <div>
      <Header title="Voice" subtitle="Speech-to-Text and Text-to-Speech in multiple languages" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary-500" />
                <CardTitle>Speech to Text</CardTitle>
              </div>
              <Badge variant="primary">Multi-language</Badge>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                      : 'bg-primary-500 shadow-lg shadow-primary-500/25'
                  }`}
                >
                  {isRecording ? (
                    <StopCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </motion.button>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  <Languages className="w-4 h-4 inline mr-1" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>{name as string} ({code})</option>
                  ))}
                </select>
              </div>

              {audioBlob && (
                <Button
                  onClick={() => transcribeMutation.mutate(audioBlob)}
                  isLoading={transcribeMutation.isPending}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transcribe Recording
                </Button>
              )}

              {transcribedText && (
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">Transcribed Text:</p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">{transcribedText}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-accent-500" />
                <CardTitle>Text to Speech</CardTitle>
              </div>
              <Badge variant="success">AI Voice</Badge>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Text to speak
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to convert to speech..."
                  className="input-field min-h-[150px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  <Languages className="w-4 h-4 inline mr-1" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>{name as string} ({code})</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => ttsMutation.mutate()}
                isLoading={ttsMutation.isPending}
                disabled={!text.trim()}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Speak Text
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supported Languages</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(languages).map(([code, name]) => (
              <div
                key={code}
                className={`p-3 rounded-xl text-center transition-all ${
                  language === code
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-400'
                }`}
                onClick={() => setLanguage(code)}
              >
                <p className="text-lg font-bold">{code.toUpperCase()}</p>
                <p className="text-xs mt-1">{name as string}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
