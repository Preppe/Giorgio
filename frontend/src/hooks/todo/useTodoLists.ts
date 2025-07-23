import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/queryClient";

// Types aligned with backend schema
export interface TodoList {
  _id: string;
  name: string;
  emoji?: string;
  userId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  category: string | null;
  dueDate?: string;
  priority: "high" | "medium" | "low" | null;
}

export function useTodoLists() {
  return useQuery({
    queryKey: ["todoLists"],
    queryFn: async (): Promise<TodoList[]> => {
      const response = await authenticatedFetch("/todo-lists");

      if (!response.ok) {
        throw new Error("Failed to fetch todo lists");
      }

      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
  });
}
