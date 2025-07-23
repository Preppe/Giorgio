import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList } from './useTodoLists';

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      listId, 
      taskId 
    }: { 
      listId: string; 
      taskId: string; 
    }): Promise<void> => {
      const response = await authenticatedFetch(`/todo-lists/${listId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok && response.status !== 204) {
        if (response.status === 404) {
          throw new Error('Todo list or task not found');
        }
        throw new Error('Failed to delete task');
      }
    },
    onMutate: async ({ listId, taskId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todoList', listId] });
      
      // Snapshot the previous value
      const previousList = queryClient.getQueryData<TodoList>(['todoList', listId]);
      
      // Optimistically update the cache
      if (previousList) {
        const updatedList = {
          ...previousList,
          tasks: previousList.tasks.filter(task => task._id !== taskId),
        };
        
        queryClient.setQueryData(['todoList', listId], updatedList);
      }
      
      return { previousList };
    },
    onError: (err, { listId }, context) => {
      // Rollback on error
      if (context?.previousList) {
        queryClient.setQueryData(['todoList', listId], context.previousList);
      }
    },
    onSettled: (_, __, { listId }) => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['todoList', listId] });
      queryClient.invalidateQueries({ queryKey: ['todoLists'] });
    },
  });
}