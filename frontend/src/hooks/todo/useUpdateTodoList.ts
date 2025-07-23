import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList } from './useTodoLists';

export interface UpdateTodoListInput {
  name?: string;
  emoji?: string;
}

export function useUpdateTodoList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listId, input }: { listId: string; input: UpdateTodoListInput }): Promise<TodoList> => {
      const response = await authenticatedFetch(`/todo-lists/${listId}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo list not found');
        }
        throw new Error('Failed to update todo list');
      }
      
      return response.json();
    },
    onSuccess: (updatedList) => {
      // Update the specific todoList cache
      queryClient.setQueryData(['todoList', updatedList._id], updatedList);
      
      // Update the todoLists cache
      queryClient.setQueryData(['todoLists'], (oldLists: TodoList[] | undefined) => {
        return oldLists?.map(list => 
          list._id === updatedList._id ? updatedList : list
        );
      });
    },
  });
}