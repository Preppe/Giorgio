import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { getAuthToken, getRefreshToken, useAuthStore } from '../stores/authStore';
import { isTokenExpiringSoon } from './jwt';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Funzione per il refresh del token
async function refreshTokens(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Funzione per gestire le richieste autenticate
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let token = getAuthToken();

  // Controllo proattivo del token
  if (token && isTokenExpiringSoon(token, 5)) {
    console.log('Token expiring soon, refreshing...');
    const tokens = await refreshTokens();
    if (tokens) {
      useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
      token = tokens.accessToken;
    } else {
      // Se il refresh fallisce, effettua logout
      useAuthStore.getState().logout();
      throw new Error('Session expired');
    }
  }

  // Aggiungi il token all'header
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Gestione errori 401
  if (response.status === 401) {
    console.log('Received 401, attempting token refresh...');
    const tokens = await refreshTokens();
    if (tokens) {
      useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
      
      // Retry la richiesta con il nuovo token
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      };
      
      return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      // Se il refresh fallisce, effettua logout
      useAuthStore.getState().logout();
      throw new Error('Session expired');
    }
  }

  return response;
}

// Configurazione del QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minuti
      gcTime: 10 * 60 * 1000, // 10 minuti
      retry: (failureCount, error) => {
        // Non fare retry per errori di autenticazione
        if (error instanceof Error && error.message === 'Session expired') {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Non fare retry per errori di autenticazione
        if (error instanceof Error && error.message === 'Session expired') {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query error:', error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  }),
});
