import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User, UserSettings } from "../services/types";
import { getTokenExpirationTime } from "../lib/jwt";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiration: number | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  ttsEnabled: boolean;
}

interface AuthActions {
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setTtsEnabled: (enabled: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      tokenExpiration: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      ttsEnabled: false,

      // Actions
      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      setTokens: (accessToken: string, refreshToken: string) => {
        const tokenExpiration = getTokenExpirationTime(accessToken);
        set({
          token: accessToken,
          refreshToken: refreshToken,
          tokenExpiration,
          isAuthenticated: true,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiration: null,
          isAuthenticated: false,
          error: null,
          ttsEnabled: false,
        });
      },

      setTtsEnabled: (enabled: boolean) => {
        set({ ttsEnabled: enabled });
      },
    }),
    {
      name: "authToken-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpiration: state.tokenExpiration,
        isAuthenticated: state.isAuthenticated,
        ttsEnabled: state.ttsEnabled,
      }),
    },
  ),
);

// Utility functions that access the store directly
export const getAuthToken = (): string | null => {
  return useAuthStore.getState().token;
};

export const getRefreshToken = (): string | null => {
  return useAuthStore.getState().refreshToken;
};

export const updateTokensInStore = (accessToken: string, refreshToken: string): void => {
  const tokenExpiration = getTokenExpirationTime(accessToken);

  useAuthStore.setState({
    token: accessToken,
    refreshToken: refreshToken,
    tokenExpiration,
  });
};

export const isAuthenticated = (): boolean => {
  return !!useAuthStore.getState().token;
};
