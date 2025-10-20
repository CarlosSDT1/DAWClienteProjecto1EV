import { renderLogin } from "./components/login";
import { iniciarJuego } from "./game/juego.js";

export { router }

const routes = new Map([
    ['', renderGame],
    ['#game', renderGame],
    ['#login', renderLogin]
]);

function renderGame() {
    // No crear nuevo contenedor, usar el que ya existe
    iniciarJuego();
    return document.createElement('div'); // Retornar elemento vacío
}

function router(route, container) {
    if (routes.has(route)) {
        if (route === '#game' || route === '') {
            renderGame();
        } else {
            container.replaceChildren(routes.get(route)());
        }
    } else {
        container.innerHTML = `<h2>404 - Página no encontrada</h2>`;
    }
}