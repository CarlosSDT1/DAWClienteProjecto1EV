// services/statsObservables.js
import { BehaviorSubject, from, of, merge } from 'rxjs';
import { map, tap, catchError, switchMap, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { getSession, SUPABASE_KEY, updateUserStats } from './supaservice.js';

// Subjects para eventos
export const statsEvents$ = new BehaviorSubject(null);

// Estado reactivo
export const userStats$ = new BehaviorSubject(null);
export const gamesList$ = new BehaviorSubject([]);
export const loadingStats$ = new BehaviorSubject(false);
export const statsError$ = new BehaviorSubject(null);

// Función para obtener estadísticas del usuario (reactiva)
export function loadUserStats$() {
    const userId = getSession();
    
    if (!userId) {
        return of(null);
    }
    
    loadingStats$.next(true);
    
    return from(
        fetch(`https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/player_stats?user_id=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY)
            }
        })
    ).pipe(
        switchMap(response => {
            if (response.ok) {
                return from(response.json());
            }
            throw new Error('Error cargando estadísticas');
        }),
        map(stats => stats[0] || null),
        tap(stats => {
            userStats$.next(stats);
            loadingStats$.next(false);
            statsEvents$.next({ type: 'STATS_LOADED', data: stats });
        }),
        catchError(error => {
            console.error('Error cargando estadísticas:', error);
            statsError$.next(error.message);
            loadingStats$.next(false);
            return of(null);
        })
    );
}

// Función para obtener lista de juegos (reactiva)
export function loadGamesList$() {
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    loadingStats$.next(true);
    
    if (isGuest) {
        // Cargar juegos locales
        const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
        gamesList$.next(games);
        loadingStats$.next(false);
        return of(games);
    }
    
    if (!userId) {
        gamesList$.next([]);
        loadingStats$.next(false);
        return of([]);
    }
    
    return from(
        fetch(`https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?user_id=eq.${userId}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY)
            }
        })
    ).pipe(
        switchMap(response => {
            if (response.ok) {
                return from(response.json());
            }
            throw new Error('Error cargando juegos');
        }),
        tap(games => {
            gamesList$.next(games || []);
            loadingStats$.next(false);
            statsEvents$.next({ type: 'GAMES_LOADED', count: games?.length || 0 });
        }),
        catchError(error => {
            console.error('Error cargando juegos:', error);
            statsError$.next(error.message);
            gamesList$.next([]);
            loadingStats$.next(false);
            return of([]);
        })
    );
}

// Función para eliminar juego (reactiva)
// services/statsObservables.js - FUNCIÓN deleteGame$ CORREGIDA
export function deleteGame$(gameId, isGuest) {
    const userId = getSession();
    
    statsEvents$.next({ type: 'DELETE_GAME_START', gameId });
    
    if (isGuest) {
        return from(Promise.resolve().then(() => {
            const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
            const gameIndex = games.findIndex(game => 
                game.local_id?.toString() === gameId.toString()
            );
            
            if (gameIndex !== -1) {
                const wasVictory = games[gameIndex].user_won === true;
                games.splice(gameIndex, 1);
                localStorage.setItem('oca_games', JSON.stringify(games));
                gamesList$.next([...games]);
                
                statsEvents$.next({ 
                    type: 'DELETE_GAME_SUCCESS', 
                    gameId, 
                    local: true,
                    wasVictory
                });
                
                return { success: true, local: true, wasVictory };
            }
            
            throw new Error('Juego no encontrado en localStorage');
        })).pipe(
            catchError(error => {
                console.error('Error eliminando juego local:', error);
                statsError$.next(error.message);
                statsEvents$.next({ type: 'DELETE_GAME_ERROR', gameId, error: error.message });
                return of({ success: false, error: error.message });
            })
        );
    }
    
    // Para Supabase - manejar DELETE que devuelve 204 No Content
    return from(
        fetch(`https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${gameId}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY),
                'Content-Type': 'application/json'
            }
        })
    ).pipe(
        switchMap(response => {
            if (response.ok) {
                // DELETE exitoso (204 No Content) - no intentar parsear JSON
                if (response.status === 204 || response.status === 200) {
                    // Primero necesitamos saber si era victoria para actualizar estadísticas
                    // Hacemos una consulta previa al DELETE para obtener esta info
                    return from(
                        fetch(`https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${gameId}&select=user_won`, {
                            headers: {
                                'apikey': SUPABASE_KEY,
                                'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY)
                            }
                        }).then(res => res.ok ? res.json() : Promise.resolve([]))
                    ).pipe(
                        map(gameData => {
                            const wasVictory = gameData[0]?.user_won === true;
                            return { success: true, wasVictory };
                        }),
                        catchError(() => of({ success: true, wasVictory: false }))
                    );
                }
                // Si no es 204, intentar parsear la respuesta normalmente
                return from(response.json()).pipe(
                    map(data => ({ success: true, wasVictory: false }))
                );
            }
            // Si hay error en la respuesta
            return from(response.text()).pipe(
                switchMap(text => {
                    let errorMessage = `Error ${response.status}`;
                    try {
                        const errorJson = JSON.parse(text);
                        errorMessage = errorJson.message || errorJson.error || errorMessage;
                    } catch {
                        errorMessage = text || errorMessage;
                    }
                    throw new Error(errorMessage);
                })
            );
        }),
        switchMap((result) => {
            // Primero actualizar la lista localmente
            const currentGames = gamesList$.value;
            const updatedGames = currentGames.filter(game => game.id?.toString() !== gameId.toString());
            gamesList$.next(updatedGames);
            
            // Emitir evento de éxito
            statsEvents$.next({ 
                type: 'DELETE_GAME_SUCCESS', 
                gameId, 
                local: false,
                wasVictory: result.wasVictory || false
            });
            
            // Si fue victoria, actualizar estadísticas
            if (result.wasVictory && userId) {
                return from(
                    updateUserStats({
                        games_played: -1,
                        games_won: -1,
                        total_turns: 0
                    }).then(() => {
                        // Recargar estadísticas después de actualizar
                        return loadUserStats$().toPromise();
                    }).then(() => result)
                );
            } else if (userId) {
                return from(
                    updateUserStats({
                        games_played: -1,
                        games_won: 0,
                        total_turns: 0
                    }).then(() => {
                        return loadUserStats$().toPromise();
                    }).then(() => result)
                );
            }
            
            return of(result);
        }),
        catchError(error => {
            console.error('Error eliminando juego:', error);
            statsError$.next(error.message);
            statsEvents$.next({ 
                type: 'DELETE_GAME_ERROR', 
                gameId, 
                error: error.message 
            });
            return of({ 
                success: false, 
                error: error.message 
            });
        })
    );
}

// Función para cambiar resultado de juego (reactiva)
// services/statsObservables.js - FUNCIÓN toggleGameResult$ CORREGIDA
export function toggleGameResult$(gameId, isGuest) {
    const userId = getSession();
    
    statsEvents$.next({ type: 'TOGGLE_GAME_START', gameId });
    
    if (isGuest) {
        return from(Promise.resolve().then(() => {
            const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
            const gameIndex = games.findIndex(game => 
                game.local_id?.toString() === gameId.toString()
            );
            
            if (gameIndex !== -1) {
                const game = games[gameIndex];
                const wasVictory = game.user_won === true;
                const nowVictory = !wasVictory;
                
                // Cambiar resultado
                game.user_won = nowVictory;
                if (game.game_state) {
                    game.game_state.user_won = nowVictory;
                }
                
                games[gameIndex] = game;
                localStorage.setItem('oca_games', JSON.stringify(games));
                gamesList$.next([...games]);
                
                statsEvents$.next({ 
                    type: 'TOGGLE_GAME_SUCCESS', 
                    gameId, 
                    wasVictory, 
                    nowVictory 
                });
                
                // Actualizar estadísticas
                if (userId) {
                    const statsChange = wasVictory ? -1 : 1;
                    updateUserStats({
                        games_played: 0,
                        games_won: statsChange,
                        total_turns: 0
                    }).then(() => {
                        loadUserStats$().subscribe();
                    });
                }
                
                return { 
                    success: true, 
                    wasVictory, 
                    nowVictory 
                };
            }
            
            throw new Error('Juego no encontrado');
        })).pipe(
            catchError(error => {
                console.error('Error cambiando resultado local:', error);
                statsError$.next(error.message);
                statsEvents$.next({ 
                    type: 'TOGGLE_GAME_ERROR', 
                    gameId, 
                    error: error.message 
                });
                return of({ success: false, error: error.message });
            })
        );
    }
    
    // Para Supabase - Primero obtener el estado actual
    return from(
        fetch(`https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${gameId}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY)
            }
        })
    ).pipe(
        switchMap(response => {
            if (response.ok) {
                return from(response.json()).pipe(
                    switchMap(gameData => {
                        if (!gameData || gameData.length === 0) {
                            throw new Error('Juego no encontrado en Supabase');
                        }
                        
                        const currentGame = gameData[0];
                        const wasVictory = currentGame.user_won === true;
                        const nowVictory = !wasVictory;
                        
                        // Actualizar en Supabase
                        return from(
                            fetch(`https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${gameId}`, {
                                method: 'PATCH',
                                headers: {
                                    'apikey': SUPABASE_KEY,
                                    'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY),
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=representation'
                                },
                                body: JSON.stringify({
                                    user_won: nowVictory,
                                    game_state: {
                                        ...currentGame.game_state,
                                        user_won: nowVictory
                                    },
                                    updated_at: new Date().toISOString()
                                })
                            })
                        ).pipe(
                            switchMap(updateResponse => {
                                if (updateResponse.ok) {
                                    return from(updateResponse.json()).pipe(
                                        map(() => ({ wasVictory, nowVictory, success: true }))
                                    );
                                }
                                throw new Error('Error actualizando resultado');
                            })
                        );
                    })
                );
            }
            throw new Error('Error obteniendo datos del juego');
        }),
        switchMap(({ wasVictory, nowVictory, success }) => {
            if (success) {
                // Actualizar lista localmente
                const currentGames = gamesList$.value;
                const updatedGames = currentGames.map(game => {
                    if (game.id?.toString() === gameId.toString()) {
                        return {
                            ...game,
                            user_won: nowVictory,
                            game_state: {
                                ...game.game_state,
                                user_won: nowVictory
                            }
                        };
                    }
                    return game;
                });
                gamesList$.next(updatedGames);
                
                statsEvents$.next({ 
                    type: 'TOGGLE_GAME_SUCCESS', 
                    gameId, 
                    wasVictory, 
                    nowVictory 
                });
                
                // Actualizar estadísticas
                if (userId) {
                    const statsChange = wasVictory ? -1 : 1;
                    return from(
                        updateUserStats({
                            games_played: 0,
                            games_won: statsChange,
                            total_turns: 0
                        }).then(() => {
                            return loadUserStats$().toPromise();
                        }).then(() => ({ success: true, wasVictory, nowVictory }))
                    );
                }
            }
            return of({ success: true, wasVictory, nowVictory });
        }),
        catchError(error => {
            console.error('Error cambiando resultado:', error);
            statsError$.next(error.message);
            statsEvents$.next({ 
                type: 'TOGGLE_GAME_ERROR', 
                gameId, 
                error: error.message 
            });
            return of({ 
                success: false, 
                error: error.message 
            });
        })
    );
}

// Observables combinados
export const allStats$ = merge(
    userStats$,
    gamesList$,
    loadingStats$,
    statsError$
).pipe(
    map(() => ({
        userStats: userStats$.value,
        games: gamesList$.value,
        loading: loadingStats$.value,
        error: statsError$.value
    })),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    shareReplay(1)
);