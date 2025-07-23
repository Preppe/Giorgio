import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/queryClient';
import { TodoList, Task } from './useTodoLists';

export interface CreateTaskInput {
  title: string;
  category?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listId, input }: { listId: string; input: CreateTaskInput }): Promise<TodoList> => {
      const response = await authenticatedFetch(`/todo-lists/${listId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo list not found');
        }
        throw new Error('Failed to create task');
      }
      
      return response.json();
    },
    onMutate: async ({ listId, input }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todoList', listId] });
      
      // Snapshot the previous value
      const previousList = queryClient.getQueryData<TodoList>(['todoList', listId]);
      
      // Optimistically update the cache
      if (previousList) {
        const optimisticTask: Task = {
          _id: `temp-${Date.now()}`,
          title: input.title,
          completed: false,
          category: input.category || null,
          dueDate: input.dueDate,
          priority: input.priority || null,
        };
        
        const updatedList = {
          ...previousList,
          tasks: [...previousList.tasks, optimisticTask],
        };
        
        queryClient.setQueryData(['todoList', listId], updatedList);
      }
      
      return { previousList };
    },
    onError: (_, { listId }, context) => {
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