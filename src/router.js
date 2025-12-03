// router.js
import { iniciarJuego } from "./game/juego.js";

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

function router(route, container) {
    if (routes.has(route)) {
        if (route === '#game' || route === '') {
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