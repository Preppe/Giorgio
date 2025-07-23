import { useQuery } from '@tanstack/react-query';
import { authenticatedFetch } from '../../lib/queryClient';
import type { ConversationSummary } from '../../services/types';

export const useConversations = () => {
  return useQuery<ConversationSummary[], Error>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await authenticatedFetch('/giorgio/conversations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minuti
    gcTime: 10 * 60 * 1000, // 10 minuti
  });
};