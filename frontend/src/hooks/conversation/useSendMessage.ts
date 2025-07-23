import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { authenticatedFetch } from '../../lib/queryClient';
import type { SendMessageRequest, SendMessageResponse, ConversationDetail } from '../../services/types';

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const [isAiResponding, setIsAiResponding] = useState(false);

  const mutation = useMutation<SendMessageResponse, Error, SendMessageRequest>({
    mutationFn: async ({ message, threadId }: SendMessageRequest) => {
      const data: SendMessageRequest = { message };
      if (threadId) data.threadId = threadId;

      const response = await authenticatedFetch('/giorgio/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onMutate: async ({ message, threadId }) => {
      // Imposta lo stato AI response e aggiungi il messaggio utente immediatamente
      setIsAiResponding(true);
      
      if (threadId) {
        await queryClient.cancelQueries({ queryKey: ['conversation', threadId] });
        
        const previousConversation = queryClient.getQueryData<ConversationDetail>(['conversation', threadId]);
        
        if (previousConversation) {
          const userMessage = {
            content: message,
            role: 'user' as const,
          };
          
          queryClient.setQueryData<ConversationDetail>(['conversation', threadId], {
            ...previousConversation,
            messages: [...previousConversation.messages, userMessage],
          });
        }
        
        return { previousConversation };
      }
      return {};
    },
    onSuccess: (data, { threadId }) => {
      // Reset stato AI response e aggiorna la cache con la risposta dell'assistente
      setIsAiResponding(false);
      
      const finalThreadId = threadId || data.threadId;
      
      if (finalThreadId) {
        queryClient.setQueryData<ConversationDetail>(['conversation', finalThreadId], (old) => {
          if (old) {
            const assistantMessage = {
              content: data.reply,
              role: 'assistant' as const,
            };
            
            return {
              ...old,
              threadId: finalThreadId,
              messages: [...old.messages, assistantMessage],
              lastUpdated: new Date().toISOString(),
            };
          }
          return old;
        });
        
        // Invalida la lista conversazioni per aggiornare con la nuova conversazione
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
    onError: (error, { threadId }, context) => {
      // Reset stato AI response e rollback dell'optimistic update in caso di errore
      setIsAiResponding(false);
      
      if (threadId && context?.previousConversation) {
        queryClient.setQueryData(['conversation', threadId], context.previousConversation);
      }
    },
  });

  return {
    ...mutation,
    isAiResponding,
  };
};