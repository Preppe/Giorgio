import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/authStore";
import { authenticatedFetch } from "../../lib/queryClient";
import type { User } from "../../services/types";

export const useCurrentUser = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery<User | null, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      if (!token || !isAuthenticated) {
        return null;
      }

      try {
        const response = await authenticatedFetch("/auth/me");

        if (!response.ok) {
          throw new Error("Failed to fetch current user");
        }

        const data = await response.json();

        // Transform backend response to frontend User interface
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          preferences: data.preferences,
        };
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        return null;
      }
    },
    enabled: !!token && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an authentication error
      if (error instanceof Error && error.message.includes("Session expired")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
