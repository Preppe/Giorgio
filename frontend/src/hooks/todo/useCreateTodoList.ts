import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList } from './useTodoLists';

export interface CreateTodoListInput {
  name: string;
  emoji?: string;
}

export function useCreateTodoList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateTodoListInput): Promise<TodoList> => {
      const response = await authenticatedFetch('/todo-lists', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create todo list');
      }
      
      return response.json();
    },
    onSuccess: (newList) => {
      // Update the todoLists cache with the new list
      queryClient.setQueryData(['todoLists'], (oldLists: TodoList[] | undefined) => {
        return oldLists ? [...oldLists, newList] : [newList];
      });
    },
  });
}