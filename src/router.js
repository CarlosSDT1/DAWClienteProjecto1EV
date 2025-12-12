// router.js - VERSIÓN SIMPLIFICADA
import { iniciarJuego } from "./game/juego.js";
import { getUserRole, canAccessStats, canAccessGame } from "./services/supaservice.js";
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

function renderGame() {
    iniciarJuego();
    return document.createElement('div');
}

function checkAccess(route) {
    const role = getUserRole();
    const partidaGuardada = localStorage.getItem('oca_game_state');
    
    // Reglas de acceso
    switch(route) {
        case '#game':
            // Juego: usuarios e invitados
            return role === 'user' || role === 'guest' || partidaGuardada;
            
        case '#stats':
            // Estadísticas: solo usuarios
            return role === 'user';
            
        case '#login':
            // Login: invitados y no autenticados pueden acceder
            return role === 'guest' || role === null;
            
        case '#register':
            // Register: solo no autenticados
            return role === null;
            
        default:
            return true;
    }
}

function router(route, container) {
    if (route === '') {
        route = '#game';
    }
    
    // Verificar acceso
    if (!checkAccess(route)) {
        // Redirigir según rol
        const role = getUserRole();
        
        if (role === 'guest') {
            // Invitado intentando acceder a stats -> redirigir a juego
            if (route === '#stats') {
                window.location.hash = '#game';
                return;
            }
        } else if (role === null) {
            // No autenticado -> redirigir a login
            window.location.hash = '#login';
            return;
        }
        
        // Por defecto, redirigir a juego
        window.location.hash = '#game';
        return;
    }
    
    if (routes.has(route)) {
        if (route === '#game') {
            renderGame();
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