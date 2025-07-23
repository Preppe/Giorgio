import { useCallback, useRef, useState } from 'react';
import { useTranscribeAudio } from './conversation/useTranscribeAudio';

export interface VoiceRecordingState {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
}

interface UseVoiceRecordingReturn extends VoiceRecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearError: () => void;
}

interface VoiceRecordingOptions {
  onTranscript?: (text: string) => void;
}

export const useVoiceRecording = (
  options: VoiceRecordingOptions = {}
): UseVoiceRecordingReturn => {
  const { onTranscript } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const transcribeAudioMutation = useTranscribeAudio();

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Impossibile accedere al microfono.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    }
  }, [isRecording]);

  const handleStop = useCallback(async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });

    try {
      // Speech-to-text using TanStack Query mutation
      transcribeAudioMutation.mutate(audioBlob, {
        onSuccess: (data) => {
          if (onTranscript) {
            onTranscript(data.text);
          }
        },
        onError: (error) => {
          setError(error.message || 'Errore sconosciuto');
        },
      });
    } catch (err: any) {
      setError(err.message || 'Errore sconosciuto');
    }
  }, [onTranscript, transcribeAudioMutation]);

  const clearError = useCallback(() => {
    setError(null);
    transcribeAudioMutation.reset(); // Reset mutation error
  }, [transcribeAudioMutation]);

  return {
    isRecording,
    isTranscribing: transcribeAudioMutation.isPending,
    error: error || transcribeAudioMutation.error?.message || null,
    startRecording,
    stopRecording,
    clearError,
  };
};
