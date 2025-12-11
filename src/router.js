// router.js - VERSIÓN SIMPLIFICADA
import { iniciarJuego } from "./game/juego.js";
import { getSession } from "./services/supaservice.js";

// Importar los componentes
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

function checkAuth(route) {
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    const partidaGuardada = localStorage.getItem('oca_game_state');
    
    // Si hay partida guardada, permitir siempre ir al juego
    if (route === '#game' && partidaGuardada) {
        return true;
    }
    
    // Rutas que requieren autenticación
    const protectedRoutes = ['#game', '#stats'];
    const authRoutes = ['#login', '#register'];
    
    // Si está en ruta protegida y no está autenticado
    if (protectedRoutes.includes(route) && !userId && !isGuest && !partidaGuardada) {
        window.location.hash = '#login';
        return false;
    }
    
    // Si está en ruta de auth y ya está autenticado
    if (authRoutes.includes(route) && (userId || isGuest)) {
        window.location.hash = '#game';
        return false;
    }
    
    return true;
}

function router(route, container) {
    // Si no hay hash, usar '#game'
    if (route === '') {
        route = '#game';
    }
    
    // Verificar autenticación
    if (!checkAuth(route)) {
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