import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { getTokenExpirationTime } from '../../lib/jwt';
import type { RegisterRequest, AuthResponse } from '../../services/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const useRegister = () => {
  const { setError, clearError } = useAuthStore();

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      return response.json();
    },
    onMutate: () => {
      // Clear any previous errors
      clearError();
    },
    onSuccess: (data) => {
      // Update auth store with successful registration data
      const tokenExpiration = getTokenExpirationTime(data.accessToken);
      
      useAuthStore.setState({
        user: data.user,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiration,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    },
    onError: (error) => {
      // Update auth store with error
      setError(error.message || 'Registration failed');
      
      // Clear auth state on error
      useAuthStore.setState({
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiration: null,
        isAuthenticated: false,
      });
    },
  });
};
