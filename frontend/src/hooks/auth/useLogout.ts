import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { authenticatedFetch } from '../../lib/queryClient';

export const useLogout = () => {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        // Optional: Call backend logout endpoint if needed
        await authenticatedFetch('/auth/logout', {
          method: 'POST',
        });
      } catch (error) {
        // Handle logout error silently, but still clear local state
        console.warn('Logout request failed:', error);
      }
    },
    onSuccess: () => {
      // Clear auth state
      useAuthStore.setState({
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiration: null,
        isAuthenticated: false,
        error: null,
      });
    },
    onError: (error) => {
      // Even if logout fails, clear local state
      console.error('Logout failed:', error);
      useAuthStore.setState({
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiration: null,
        isAuthenticated: false,
        error: null,
      });
    },
  });
};
