import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList } from './useTodoLists';

export interface UpdateTaskInput {
  title?: string;
  category?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      listId, 
      taskId, 
      input 
    }: { 
      listId: string; 
      taskId: string; 
      input: UpdateTaskInput 
    }): Promise<TodoList> => {
      const response = await authenticatedFetch(`/todo-lists/${listId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo list or task not found');
        }
        throw new Error('Failed to update task');
      }
      
      return response.json();
    },
    onSuccess: (updatedList) => {
      // Update both caches with the updated data
      queryClient.setQueryData(['todoList', updatedList._id], updatedList);
      
      queryClient.setQueryData(['todoLists'], (oldLists: TodoList[] | undefined) => {
        return oldLists?.map(list => 
          list._id === updatedList._id ? updatedList : list
        );
      });
    },
  });
}