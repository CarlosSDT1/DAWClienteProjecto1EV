// src/services/supaservice.js - CORREGIDO CON IMPORT FALTANTE
import { BehaviorSubject, from, of, throwError } from "rxjs";
import { map, catchError, switchMap, tap, shareReplay, distinctUntilChanged } from "rxjs/operators"; // ← AÑADIR distinctUntilChanged
import { SUPABASE_KEY, SUPABASE_URL } from "../env.js";

// Declarar las variables/funciones primero
const userSubject$ = new BehaviorSubject(
  localStorage.getItem('user_id') 
    ? { 
        id: localStorage.getItem('user_id'),
        email: localStorage.getItem('user'),
        isGuest: false,
        lastLogin: localStorage.getItem('last_login')
      }
    : localStorage.getItem('guestMode') === 'true'
    ? { isGuest: true, since: localStorage.getItem('guest_since') }
    : null
);

// Observable para cambios en la autenticación
const authChanges$ = userSubject$.pipe(
  distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
  shareReplay(1)
);

const getBearer = () => {
  let bearer = localStorage.getItem('access_token');
  bearer = bearer ? `Bearer ${bearer}` : `Bearer ${SUPABASE_KEY}`;
  return bearer;
}

const headerFactory = ({
  apikey = SUPABASE_KEY,
  Authorization = getBearer(),
  contentType = "application/json",
  Prefer = null
} = {}) => {
  const headers = new Headers();
  apikey && headers.append("apikey", apikey);
  Authorization && headers.append("Authorization", Authorization);
  contentType && headers.append("Content-Type", contentType);
  Prefer && headers.append("Prefer", Prefer);
  return headers;
}

const fetchSupabase = async (url, options) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

// Versión con Observable
const fetchSupabaseObservable = (url, options) => {
  return from(fetch(url, options)).pipe(
    switchMap(response => {
      if (response.ok) {
        return from(response.json());
      } else {
        return from(response.json()).pipe(
          switchMap(error => {
            return throwError(() => new Error(error.message || `Error ${response.status}`));
          })
        );
      }
    }),
    catchError(error => {
      console.error('Error en petición a Supabase:', error);
      return throwError(() => error);
    })
  );
}

const loginSupabase = (dataLogin) => {
  return fetchSupabaseObservable(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "post",
      headers: headerFactory({ Authorization: null }),
      body: JSON.stringify(dataLogin)
    });
}

const registerSupabase = (dataRegister) => {
  return fetchSupabaseObservable(
    `${SUPABASE_URL}/auth/v1/signup`,
    {
      method: "POST",
      headers: headerFactory({ Authorization: null }),
      body: JSON.stringify(dataRegister)
    }
  );
}

// Versión con Observable
const login = (dataLogin) => {
  return loginSupabase(dataLogin).pipe(
    tap(loginResponse => {
      localStorage.setItem('access_token', loginResponse.access_token);
      localStorage.setItem('refresh_token', loginResponse.refresh_token);
      localStorage.setItem('expires_in', loginResponse.expires_in);
      localStorage.setItem('user', loginResponse.user.email);
      localStorage.setItem('user_id', loginResponse.user.id);
      localStorage.setItem('last_login', new Date().toISOString());
      
      // Emitir cambio en el subject
      userSubject$.next({
        id: loginResponse.user.id,
        email: loginResponse.user.email,
        isGuest: false,
        lastLogin: new Date().toISOString()
      });
    }),
    catchError(error => {
      console.error('Error en login:', error);
      return throwError(() => error);
    })
  );
}

const getSession = () => {
  return localStorage.getItem('user_id');
}

// Versión con Observable
const register = (dataRegister) => {
  return registerSupabase(dataRegister).pipe(
    tap(registerResponse => {
      console.log('Registro exitoso via rxjs:', registerResponse.email);
    }),
    catchError(error => {
      console.error('Error en registro:', error);
      return throwError(() => error);
    })
  );
}

const getData = async (table, query = {}) => {
  let queryString = Object.entries(query)
    .map(([key, value]) => `${key}=eq.${value}`)
    .join('&');
  queryString = queryString ? `?${queryString}` : '';
  
  const data = await fetchSupabase(`${SUPABASE_URL}/rest/v1/${table}${queryString}`, {
    method: "get",
    headers: headerFactory({}),
  });
  return data;
}

// Versión con Observable
const getDataObservable = (table, query = {}) => {
  let queryString = Object.entries(query)
    .map(([key, value]) => `${key}=eq.${value}`)
    .join('&');
  queryString = queryString ? `?${queryString}` : '';
  
  return fetchSupabaseObservable(`${SUPABASE_URL}/rest/v1/${table}${queryString}`, {
    method: "get",
    headers: headerFactory({}),
  }).pipe(
    catchError(error => {
      console.error(`Error obteniendo datos de ${table}:`, error);
      return of([]);
    })
  );
}

const updateData = async (table, id, data) => {
  const result = await fetchSupabase(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: headerFactory({ Prefer: "return=representation" }),
    body: JSON.stringify(data)
  });
  return result;
}

// Funciones específicas para el Juego de la Oca
const saveGameState = async (gameState) => {
  const userId = getSession();
  if (!userId) {
    console.log("Usuario no autenticado, guardando localmente");
    localStorage.setItem('last_game_state', JSON.stringify(gameState));
    return null;
  }
  
  const result = await fetchSupabase(`${SUPABASE_URL}/rest/v1/oca_games`, {
    method: "POST",
    headers: headerFactory({ Prefer: "return=representation" }),
    body: JSON.stringify({
      user_id: userId,
      game_state: gameState.game_state, // Solo el objeto game_state
      user_won: gameState.user_won || false, // ← NUEVO campo
      created_at: new Date().toISOString()
      // Quitamos 'finished' porque siempre es true
    })
  });
  return result;
};

export const createManualGame = async (gameData) => {
  const userId = getSession();
  if (!userId) {
    // Guardar localmente
    const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
    gameData.local_id = Date.now();
    games.push(gameData);
    localStorage.setItem('oca_games', JSON.stringify(games));
    return { success: true, local: true };
  }
  
  try {
    const result = await fetchSupabase(`${SUPABASE_URL}/rest/v1/oca_games`, {
      method: "POST",
      headers: headerFactory({ Prefer: "return=representation" }),
      body: JSON.stringify({
        user_id: userId,
        game_state: gameData.game_state,
        user_won: gameData.user_won || false,
        created_at: new Date().toISOString()
      })
    });
    return { success: true, result };
  } catch (error) {
    console.log('Error creando partida:', error);
    throw error;
  }
};

// Versión con Observable
const saveGameStateObservable = (gameState) => {
  const userId = getSession();
  
  if (!userId) {
    localStorage.setItem('oca_game_state', JSON.stringify(gameState));
    console.log('Juego guardado localmente (sin usuario)');
    return of({ success: true, local: true });
  }
  
  return fetchSupabaseObservable(`${SUPABASE_URL}/rest/v1/oca_games`, {
    method: "POST",
    headers: headerFactory({ Prefer: "return=representation" }),
    body: JSON.stringify({
      user_id: userId,
      game_state: gameState,
      finished: false,
      created_at: new Date().toISOString()
    })
  }).pipe(
    map(result => ({ 
      success: true, 
      result, 
      local: false,
      timestamp: new Date().toISOString()
    })),
    catchError(error => {
      console.error('Error guardando en Supabase, guardando localmente:', error);
      localStorage.setItem('oca_game_state', JSON.stringify(gameState));
      return of({ 
        success: true, 
        local: true, 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    })
  );
}

const getGames = async () => {
  const userId = getSession();
  const query = userId ? `?user_id=eq.${userId}` : '';
  
  const data = await fetchSupabase(`${SUPABASE_URL}/rest/v1/oca_games${query}`, {
    method: "get",
    headers: headerFactory({}),
  });
  return data;
}

// Versión con Observable
const getGamesObservable = () => {
  const userId = getSession();
  const query = userId ? `?user_id=eq.${userId}` : '';
  
  return fetchSupabaseObservable(`${SUPABASE_URL}/rest/v1/oca_games${query}`, {
    method: "get",
    headers: headerFactory({}),
  }).pipe(
    map(games => games || []),
    catchError(error => {
      console.error('Error obteniendo juegos:', error);
      return of([]);
    })
  );
}

const createGame = async (data) => {
  const result = await fetchSupabase(`${SUPABASE_URL}/rest/v1/oca_games`, {
    method: "POST",
    headers: headerFactory({ Prefer: "return=representation" }),
    body: JSON.stringify(data)
  });
  return result;
}

const getUserStats = async () => {
  const userId = getSession();
  if (!userId) return null;
  
  const stats = await getData("player_stats", { user_id: userId });
  return stats[0] || null;
}

// Versión con Observable
const getUserStatsObservable = () => {
  const userId = getSession();
  if (!userId) return of(null);
  
  return getDataObservable("player_stats", { user_id: userId }).pipe(
    map(stats => stats[0] || null),
    catchError(error => {
      console.error('Error obteniendo estadísticas:', error);
      return of(null);
    })
  );
}

const incrementUserStats = async (statsToUpdate) => {
  const userId = getSession();
  if (!userId) return null;
  
  // Obtener estadísticas actuales
  const currentStats = await getUserStats();
  
  if (currentStats) {
    // Incrementar valores existentes
    const updatedStats = {
      games_played: (currentStats.games_played || 0) + (statsToUpdate.games_played || 0),
      games_won: (currentStats.games_won || 0) + (statsToUpdate.games_won || 0),
      total_turns: (currentStats.total_turns || 0) + (statsToUpdate.total_turns || 0),
      last_played: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return await updateData("player_stats", currentStats.id, updatedStats);
  } else {
    // Crear nuevas estadísticas
    const newStats = {
      user_id: userId,
      games_played: statsToUpdate.games_played || 0,
      games_won: statsToUpdate.games_won || 0,
      total_turns: statsToUpdate.total_turns || 0,
      last_played: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return await fetchSupabase(`${SUPABASE_URL}/rest/v1/player_stats`, {
      method: "POST",
      headers: headerFactory({ Prefer: "return=representation" }),
      body: JSON.stringify(newStats)
    });
  }
}

// Versión con Observable
export const updateUserStats = async (stats) => {
  const userId = getSession();
  if (!userId) {
    console.log('No hay usuario');
    return { success: false, reason: 'no_user' };
  }
  
  try {
    // Obtener estadísticas actuales
    const currentStats = await getUserStats();
    
    if (currentStats && currentStats.id) {
      // Calcular nuevos valores
      const updatedStats = {
        games_played: Math.max(0, (currentStats.games_played || 0) + (stats.games_played || 0)),
        games_won: Math.max(0, (currentStats.games_won || 0) + (stats.games_won || 0)),
        total_turns: Math.max(0, (currentStats.total_turns || 0) + (stats.total_turns || 0)),
        last_played: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Actualizar en Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/player_stats?id=eq.${currentStats.id}`, {
        method: "PATCH",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${localStorage.getItem('access_token') || SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updatedStats)
      });
      
      if (response.ok) {
        const result = await response.json();
        return { success: true, result, updated: true };
      } else {
        throw new Error('Error en la respuesta de Supabase');
      }
      
    } else {
      // Crear nuevas estadísticas
      const newStats = {
        user_id: userId,
        games_played: Math.max(0, stats.games_played || 0),
        games_won: Math.max(0, stats.games_won || 0),
        total_turns: Math.max(0, stats.total_turns || 0),
        last_played: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/player_stats`, {
        method: "POST",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${localStorage.getItem('access_token') || SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newStats)
      });
      
      if (response.ok) {
        const result = await response.json();
        return { success: true, result, created: true };
      } else {
        throw new Error('Error creando estadísticas');
      }
    }
  } catch (error) {
    console.log('Error actualizando estadísticas:', error);
    return { success: false, error: error.message };
  }
};

// services/supaservice.js - AÑADIR AL FINAL
export const ROLES = {
    USER: 'user',
    GUEST: 'guest'
};

export function getUserRole() {
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    if (userId) return ROLES.USER;
    if (isGuest) return ROLES.GUEST;
    return null; // No autenticado
}

export function canAccessStats() {
    const role = getUserRole();
    return role === ROLES.USER; // Solo usuarios pueden ver estadísticas
}

export function canAccessGame() {
    const role = getUserRole();
    return role === ROLES.USER || role === ROLES.GUEST; // Ambos pueden jugar
}

// UN SOLO EXPORT AL FINAL
export { 
  getBearer, 
  headerFactory, 
  fetchSupabase, 
  loginSupabase, 
  registerSupabase, 
  login, 
  register, 
  getData, 
  updateData, 
  getSession,
  getGames, 
  createGame, 
  saveGameState, 
  getUserStats,
  userSubject$,
  authChanges$,
  SUPABASE_KEY,
  
  // Nuevas funciones con Observables
  fetchSupabaseObservable,
  getDataObservable,
  getGamesObservable,
  saveGameStateObservable,
  getUserStatsObservable
};