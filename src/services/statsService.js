// services/statsService.js - SIN ESTADÍSTICAS DE TURNOS
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { 
    getSession, 
    SUPABASE_KEY
} from './supaservice.js';

// Estado centralizado
const _gamesList$ = new BehaviorSubject([]);
const _error$ = new BehaviorSubject(null);

// Observables públicos
export const gamesList$ = _gamesList$.asObservable();
export const error$ = _error$.asObservable();

// Calcular estadísticas desde el historial (solo básicas)
export const userStats$ = _gamesList$.pipe(
    map(games => {
        const total = games.length;
        const won = games.filter(g => g.user_won === true).length;
        const lost = total - won;
        const percentage = total > 0 ? Math.round((won / total) * 100) : 0;
        
        return {
            games_played: total,
            games_won: won,
            games_lost: lost,
            win_percentage: percentage
        };
    }),
    distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
    ),
    shareReplay(1)
);

// Cargar lista de juegos
export async function loadGamesList() {
    try {
        const userId = getSession();
        const isGuest = localStorage.getItem('guestMode') === 'true';
        
        if (isGuest) {
            const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
            _gamesList$.next(games);
            return games;
        }
        
        if (!userId) {
            _gamesList$.next([]);
            return [];
        }
        
        const response = await fetch(
            `https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?user_id=eq.${userId}&order=created_at.desc`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY)
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const games = await response.json();
        _gamesList$.next(games || []);
        _error$.next(null);
        return games;
        
    } catch (error) {
        console.error('Error cargando juegos:', error);
        _error$.next(error.message);
        _gamesList$.next([]);
        return [];
    }
}

// Eliminar juego
export async function deleteGame(gameId, isGuest) {
    try {
        if (isGuest) {
            const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
            const filteredGames = games.filter(game => 
                game.local_id?.toString() !== gameId.toString()
            );
            localStorage.setItem('oca_games', JSON.stringify(filteredGames));
            _gamesList$.next(filteredGames);
            return { success: true };
            
        } else {
            const response = await fetch(
                `https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${gameId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY),
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            // Recargar lista
            await loadGamesList();
            return { success: true };
        }
        
    } catch (error) {
        console.error('Error eliminando juego:', error);
        _error$.next(error.message);
        return { success: false, error: error.message };
    }
}

// Cambiar resultado de juego
export async function toggleGameResult(gameId, isGuest) {
    try {
        if (isGuest) {
            const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
            const gameIndex = games.findIndex(game => 
                game.local_id?.toString() === gameId.toString()
            );
            
            if (gameIndex !== -1) {
                games[gameIndex].user_won = !games[gameIndex].user_won;
                if (games[gameIndex].game_state) {
                    games[gameIndex].game_state.user_won = games[gameIndex].user_won;
                }
                
                localStorage.setItem('oca_games', JSON.stringify(games));
                _gamesList$.next([...games]);
                return { success: true };
            }
            throw new Error('Juego no encontrado');
            
        } else {
            // Obtener juego actual
            const getResponse = await fetch(
                `https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${gameId}`,
                {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY)
                    }
                }
            );
            
            if (!getResponse.ok) {
                throw new Error(`Error ${getResponse.status}`);
            }
            
            const gameData = await getResponse.json();
            if (!gameData || gameData.length === 0) {
                throw new Error('Juego no encontrado');
            }
            
            const currentGame = gameData[0];
            const newResult = !currentGame.user_won;
            
            // Actualizar en Supabase
            const updateResponse = await fetch(
                `https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${gameId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY),
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        user_won: newResult,
                        game_state: {
                            ...currentGame.game_state,
                            user_won: newResult
                        },
                        updated_at: new Date().toISOString()
                    })
                }
            );
            
            if (!updateResponse.ok) {
                throw new Error(`Error ${updateResponse.status}`);
            }
            
            // Recargar lista
            await loadGamesList();
            return { success: true };
        }
        
    } catch (error) {
        console.error('Error cambiando resultado:', error);
        _error$.next(error.message);
        return { success: false, error: error.message };
    }
}

// Añadir partida manual
export async function addManualGame(userWon) {
    try {
        const userId = getSession();
        const isGuest = localStorage.getItem('guestMode') === 'true';
        
        if (!userId && !isGuest) {
            throw new Error('Inicia sesión o juega como invitado');
        }
        
        const newGame = {
            game_state: {
                fecha: new Date().toISOString(),
                user_won: userWon
            },
            user_won: userWon,
            created_at: new Date().toISOString(),
            local_id: Date.now()
        };
        
        if (userId) {
            const response = await fetch(
                'https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games',
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY),
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        game_state: newGame.game_state,
                        user_won: newGame.user_won,
                        created_at: newGame.created_at
                    })
                }
            );
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            // Recargar lista
            await loadGamesList();
            
        } else if (isGuest) {
            const games = JSON.parse(localStorage.getItem('oca_games') || '[]');
            games.push(newGame);
            localStorage.setItem('oca_games', JSON.stringify(games));
            _gamesList$.next([...games]);
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Error añadiendo partida:', error);
        _error$.next(error.message);
        return { success: false, error: error.message };
    }
}

// Resetear todo el historial
export async function resetAllStats() {
    if (!confirm('¿ESTÁS SEGURO?\n\nSe borrará TODO el historial de partidas.\n\nEsta acción NO se puede deshacer.')) {
        return { success: false, cancelled: true };
    }
    
    try {
        const userId = getSession();
        const isGuest = localStorage.getItem('guestMode') === 'true';
        
        if (!userId && !isGuest) {
            throw new Error('Inicia sesión o juega como invitado');
        }
        
        if (userId) {
            // Obtener todas las partidas
            const getResponse = await fetch(
                `https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?user_id=eq.${userId}&select=id`,
                {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY)
                    }
                }
            );
            
            if (getResponse.ok) {
                const games = await getResponse.json();
                
                // Borrar cada partida
                for (const game of games) {
                    await fetch(
                        `https://yeiuyxfgdfqdwabbokzd.supabase.co/rest/v1/oca_games?id=eq.${game.id}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'apikey': SUPABASE_KEY,
                                'Authorization': 'Bearer ' + (localStorage.getItem('access_token') || SUPABASE_KEY),
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            }
            
        } else if (isGuest) {
            localStorage.removeItem('oca_games');
        }
        
        // Limpiar estado
        _gamesList$.next([]);
        return { success: true };
        
    } catch (error) {
        console.error('Error reiniciando historial:', error);
        _error$.next(error.message);
        return { success: false, error: error.message };
    }
}

// Estado combinado para UI
export const statsState$ = gamesList$.pipe(
    map(games => {
        const total = games.length;
        const won = games.filter(g => g.user_won === true).length;
        const lost = total - won;
        const percentage = total > 0 ? Math.round((won / total) * 100) : 0;
        
        return {
            games,
            stats: {
                total,
                won,
                lost,
                percentage
            },
            error: _error$.value
        };
    }),
    distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
    ),
    shareReplay(1)
);

// Inicializar
export function initStats() {
    loadGamesList().catch(err => console.log('Error inicial:', err));
}