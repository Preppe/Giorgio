import { useQuery } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList } from './useTodoLists';

export function useTodoList(listId: string | undefined) {
  return useQuery({
    queryKey: ['todoList', listId],
    queryFn: async (): Promise<TodoList> => {
      if (!listId) {
        throw new Error('List ID is required');
      }
      
      const response = await authenticatedFetch(`/todo-lists/${listId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo list not found');
        }
        throw new Error('Failed to fetch todo list');
      }
      
      return response.json();
    },
    enabled: !!listId,
    staleTime: 0,
    gcTime: 0,
  });
}