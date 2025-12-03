// src/services/supaservice.js
import { BehaviorSubject } from "rxjs";
import { SUPABASE_KEY, SUPABASE_URL } from "../env.js";

// Declarar las variables/funciones primero
const userSubject$ = new BehaviorSubject({});

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

const loginSupabase = (dataLogin) => {
    return fetchSupabase(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
            method: "post",
            headers: headerFactory({ Authorization: null }),
            body: JSON.stringify(dataLogin)
        });
}

const registerSupabase = (dataRegister) => {
    return fetchSupabase(
        `${SUPABASE_URL}/auth/v1/signup`,
        {
            method: "POST",
            headers: headerFactory({ Authorization: null }),
            body: JSON.stringify(dataRegister)
        }
    );
}

const login = async (dataLogin) => {
    const loginResponse = await loginSupabase(dataLogin);
    localStorage.setItem('access_token', loginResponse.access_token);
    localStorage.setItem('refresh_token', loginResponse.refresh_token);
    localStorage.setItem('expires_in', loginResponse.expires_in);
    localStorage.setItem('user', loginResponse.user.email);
    localStorage.setItem('user_id', loginResponse.user.id);
    
    // Obtener perfil del usuario
    const userData = (await getData("profiles", { id: loginResponse.user.id }))[0] || {};
    userData.loginData = loginResponse;
    userSubject$.next(userData);
    
    return loginResponse;
}

const getSession = () => {
    return localStorage.getItem('user_id');
}

const register = async (dataRegister) => {
    const registerResponse = await registerSupabase(dataRegister);
    return registerResponse;
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
            game_state: gameState,
            finished: false,
            created_at: new Date().toISOString()
        })
    });
    return result;
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

const updateUserStats = async (stats) => {
    const userId = getSession();
    if (!userId) return null;
    
    const existingStats = await getUserStats();
    
    if (existingStats) {
        return await updateData("player_stats", existingStats.id, stats);
    } else {
        return await createGame({
            user_id: userId,
            ...stats
        });
    }
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
    updateUserStats,
    userSubject$  // ← Solo una vez aquí
};