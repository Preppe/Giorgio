import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '../../lib/queryClient';

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (threadId: string) => {
      const response = await authenticatedFetch(`/giorgio/conversations/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      return response.json();
    },
    onSuccess: (_, threadId) => {
      // Rimuovi la conversazione dalla cache
      queryClient.removeQueries({ queryKey: ['conversation', threadId] });
      
      // Invalida la lista conversazioni per riflettere la rimozione
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};