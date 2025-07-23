import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch } from "../../lib/queryClient";
import type { UpdateProfileRequest, User } from "../../services/types";
import { useAuthStore } from "../../stores/authStore";

export const useUpdateProfile = () => {
  const { setError, clearError } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfileRequest>({
    mutationFn: async (profileData: UpdateProfileRequest) => {
      const response = await authenticatedFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Profile update failed");
      }

      return response.json();
    },
    onMutate: () => {
      // Clear any previous errors
      clearError();
    },
    onSuccess: (updatedUser) => {
      // Update the current user query cache
      queryClient.setQueryData(["auth", "me"], updatedUser);

      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      // Update auth store with error
      setError(error.message || "Profile update failed");
    },
  });
};
