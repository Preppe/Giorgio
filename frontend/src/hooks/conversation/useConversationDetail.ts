import { useQuery } from '@tanstack/react-query';
import { authenticatedFetch } from '../../lib/queryClient';
import type { ConversationDetail } from '../../services/types';

export const useConversationDetail = (threadId?: string) => {
  return useQuery<ConversationDetail | null, Error>({
    queryKey: ['conversation', threadId],
    queryFn: async () => {
      if (!threadId) return null;
      
      const response = await authenticatedFetch(`/giorgio/conversations/${threadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch conversation');
      }
      
      return response.json();
    },
    enabled: !!threadId, // Solo se threadId è disponibile
    staleTime: 2 * 60 * 1000, // 2 minuti per dettagli più aggiornati
    gcTime: 10 * 60 * 1000, // 10 minuti
  });
};