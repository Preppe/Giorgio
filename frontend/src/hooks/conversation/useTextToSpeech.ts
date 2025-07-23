import { useMutation } from '@tanstack/react-query';
import { authenticatedFetch } from '../../lib/queryClient';
import { useAuthStore } from '../../stores/authStore';

export const useTextToSpeech = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation<Blob, Error, string>({
    mutationFn: async (text: string) => {
      const voicePreferences = user?.preferences?.voice;
      
      if (!voicePreferences?.modelId) {
        throw new Error('ModelId non configurato nelle preferenze utente');
      }

      const response = await authenticatedFetch('/voice/text-to-speech', {
        method: 'POST',
        body: JSON.stringify({
          text,
          modelId: voicePreferences.modelId,
          voiceId: voicePreferences.voice,
          outputFormat: 'mp3_44100_128', // Default format
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      return response.blob();
    },
    retry: 2, // Retry fino a 2 volte per problemi di rete
  });
};