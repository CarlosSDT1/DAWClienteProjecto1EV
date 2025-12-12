// main.js - REDIRECCIÓN MEJORADA CON ACCESO RESTRINGIDO
import "./scss/style.scss";
import { router } from "./router";
import { getUserRole } from "./services/supaservice.js";

// eslint-disable-next-line
import * as bootstrap from 'bootstrap';

import "./components/header.js";
import { renderFooter } from "./components/footer";

document.addEventListener("DOMContentLoaded", () => {
    const appDiv = document.querySelector('#app');
    const headerDiv = document.querySelector('#header');
    const footerDiv = document.querySelector('#footer');

    headerDiv.innerHTML = `<game-header></game-header>`;
    footerDiv.innerHTML = renderFooter();

    // Decidir ruta inicial según autenticación
    if (!window.location.hash || window.location.hash === '') {
        const role = getUserRole();
        const hasSavedGame = localStorage.getItem('oca_game_state');
        
        // REGLAS DE REDIRECCIÓN INICIAL:
        if (role === 'user' || role === 'guest' || hasSavedGame) {
            window.location.hash = '#game';
        } else {
            // NO AUTENTICADO -> siempre a login
            window.location.hash = '#login';
        }
    }
    
    router(window.location.hash, appDiv);
    
    window.addEventListener("hashchange", () => {
        router(window.location.hash, appDiv);
    });
});