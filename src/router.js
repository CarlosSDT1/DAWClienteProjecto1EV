// router.js
import { iniciarJuego } from "./game/juego.js";
import { getSession } from "./services/supaservice.js";

// Importar los componentes para que se registren
import "./components/login.js";      // game-login, game-register
import "./components/profile.js";    // game-profile
import "./components/stats.js";      // game-stats

export { router };

const routes = new Map([
    ['', 'game-content'],
    ['#game', 'game-content'],
    ['#login', 'game-login'],
    ['#register', 'game-register'],
    ['#profile', 'game-profile'],
    ['#stats', 'game-stats']
]);

function renderGame() {
    iniciarJuego();
    return document.createElement('div');
}

function checkAuth(route) {
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    // Rutas que requieren autenticación
    const protectedRoutes = ['#game', '#profile', '#stats'];
    const authRoutes = ['#login', '#register'];
    
    // Si está en ruta protegida y no está autenticado
    if (protectedRoutes.includes(route) && !userId && !isGuest) {
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
            // IMPORTANTE: Verificar si el elemento existe
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