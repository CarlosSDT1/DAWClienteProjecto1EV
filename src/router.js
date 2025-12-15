// router.js - VERSIÓN CORREGIDA CON MANEJO DE TRANSICIONES
import { iniciarJuego, limpiarJuego } from "./game/juego.js";
import { getUserRole } from "./services/supaservice.js";
import "./components/login.js";
import "./components/stats.js";

export { router };

const routes = new Map([
    ['', 'game-content'],
    ['#game', 'game-content'],
    ['#login', 'game-login'],
    ['#register', 'game-register'],
    ['#stats', 'game-stats']
]);

let currentRoute = '';
let gameInitialized = false;

function renderGame() {
    if (gameInitialized) {
        limpiarJuego();
        gameInitialized = false;
    }
    
    iniciarJuego();
    gameInitialized = true;
    
}

function checkAccess(route) {
    const role = getUserRole();
    const partidaGuardada = localStorage.getItem('oca_game_state');
    
    switch(route) {
        case '#game':
            return role === 'user' || role === 'guest' || partidaGuardada;
            
        case '#stats':

            return role === 'user';
            
        case '#login':
        case '#register':
            return role === null;
            
        default:
            return true;
    }
}

function router(route, container) {
    if (route === '') {
        route = '#game';
    }
    
    // Si es la misma ruta, no hacer nada
    if (route === currentRoute) {
        return;
    }
    
    currentRoute = route;
    
    const role = getUserRole();
    
    // Verificar acceso
    if (!checkAccess(route)) {
        // Redirigir según rol
        if (role === null) {
            // NO AUTENTICADO -> siempre a login
            window.location.hash = '#login';
            return;
        } else if (role === 'guest') {
            // Invitado intentando acceder a stats/login/register -> juego
            if (route === '#stats' || route === '#login' || route === '#register') {
                window.location.hash = '#game';
                return;
            }
        } else if (role === 'user') {
            // Usuario intentando acceder a login/register -> juego
            if (route === '#login' || route === '#register') {
                window.location.hash = '#game';
                return;
            }
        }
        
        // Por defecto, redirigir según rol
        window.location.hash = role === 'user' || role === 'guest' ? '#game' : '#login';
        return;
    }
    
    // Limpiar container
    container.innerHTML = '';
    
    if (routes.has(route)) {
        if (route === '#game') {
            // Para el juego, usar renderGame que maneja la inicialización
            renderGame(container);
        } else {
            const elementName = routes.get(route);
            if (customElements.get(elementName)) {
                container.replaceChildren(document.createElement(elementName));
            } else {
                console.error(`Componente ${elementName} no registrado`);
                container.innerHTML = `<h2>Error: Componente no cargado</h2>`;
            }
        }
    } else {
        container.innerHTML = `<h2>404 - Página no encontrada</h2>`;
    }
}

// Exportar para limpiar al salir
export function cleanupRouter() {
    if (gameInitialized) {
        limpiarJuego();
        gameInitialized = false;
    }
}