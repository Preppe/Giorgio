import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList } from './useTodoLists';

export function useToggleTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      listId, 
      taskId 
    }: { 
      listId: string; 
      taskId: string; 
    }): Promise<TodoList> => {
      const response = await authenticatedFetch(`/todo-lists/${listId}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo list or task not found');
        }
        throw new Error('Failed to toggle task');
      }
      
      return response.json();
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
          tasks: previousList.tasks.map(task =>
            task._id === taskId ? { ...task, completed: !task.completed } : task
          ),
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
    onSuccess: (updatedList) => {
      // Update both caches with the real data from server
      queryClient.setQueryData(['todoList', updatedList._id], updatedList);
      
      queryClient.setQueryData(['todoLists'], (oldLists: TodoList[] | undefined) => {
        return oldLists?.map(list => 
          list._id === updatedList._id ? updatedList : list
        );
      });
    },
  });
}