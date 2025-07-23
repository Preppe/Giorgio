import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from '../../stores/authStore';
import type { TranscribeAudioResponse } from '../../services/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const useTranscribeAudio = () => {
  return useMutation<TranscribeAudioResponse, Error, Blob>({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const token = getAuthToken();
      const headers: Record<string, string> = {};
      
      // Aggiungi il token di autenticazione se disponibile
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/voice/speech-to-text`, {
        method: 'POST',
        body: formData,
        headers,
        // Non specificare Content-Type per FormData - il browser lo gestirà automaticamente
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      return response.json();
    },
    retry: 2, // Retry fino a 2 volte per problemi di rete
  });
};