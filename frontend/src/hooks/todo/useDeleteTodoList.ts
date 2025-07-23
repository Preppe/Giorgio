import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList } from './useTodoLists';

export function useDeleteTodoList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listId: string): Promise<void> => {
      const response = await authenticatedFetch(`/todo-lists/${listId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok && response.status !== 204) {
        if (response.status === 404) {
          throw new Error('Todo list not found');
        }
        throw new Error('Failed to delete todo list');
      }
    },
    onSuccess: (_, listId) => {
      // Remove from todoLists cache
      queryClient.setQueryData(['todoLists'], (oldLists: TodoList[] | undefined) => {
        return oldLists?.filter(list => list._id !== listId);
      });
      
      // Remove specific todoList cache
      queryClient.removeQueries({ queryKey: ['todoList', listId] });
    },
  });
}