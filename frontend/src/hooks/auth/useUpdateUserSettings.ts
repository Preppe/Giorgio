import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch } from "../../lib/queryClient";
import type { UpdateUserSettingsRequest, User } from "../../services/types";

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserSettingsRequest>({
    mutationFn: async (updateData: UpdateUserSettingsRequest) => {
      const response = await authenticatedFetch("/users/preferences", {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user settings");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update the user cache with the full updated user data
      queryClient.setQueryData(["auth", "me"], data);

      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Failed to update user settings:", error);
    },
  });
};
