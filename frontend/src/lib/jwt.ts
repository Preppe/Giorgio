/**
 * Utility per la gestione e parsing dei JWT tokens
 */

interface JwtPayload {
  exp: number; // Expiration time (timestamp Unix)
  iat: number; // Issued at time
  sub: string; // Subject (user ID)
  [key: string]: any; // Altri claims
}

/**
 * Parsa un JWT token e restituisce il payload decodificato
 * NOTA: Questa funzione NON verifica la signature del token
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    // Rimuovi "Bearer " se presente
    const cleanToken = token.replace('Bearer ', '');
    
    // Split del token nelle sue tre parti: header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decodifica la parte payload (base64url)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Errore nel parsing del JWT:', error);
    return null;
  }
}

/**
 * Verifica se il token scadrà entro i secondi specificati
 */
export function isTokenExpiringSoon(token: string, thresholdSeconds: number = 5): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    return true; // Se non riusciamo a parsare, consideriamo scaduto
  }

  const now = Math.floor(Date.now() / 1000); // Timestamp Unix corrente
  const expirationTime = payload.exp;
  
  // Verifica se il token scadrà entro la soglia specificata
  return (expirationTime - now) <= thresholdSeconds;
}

/**
 * Ottiene il timestamp di scadenza del token
 */
export function getTokenExpirationTime(token: string): number | null {
  const payload = parseJwt(token);
  return payload?.exp || null;
}

/**
 * Verifica se il token è già scaduto
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Ottiene i secondi rimanenti prima della scadenza
 */
export function getSecondsUntilExpiration(token: string): number {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}