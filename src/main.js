// main.js - VERSIÓN CORREGIDA Y SIMPLIFICADA
import "./scss/style.scss";
import { router } from "./router";
import { getSession } from "./services/supaservice.js";

// eslint-disable-next-line
import * as bootstrap from 'bootstrap';

import "./components/header.js";
import { renderFooter } from "./components/footer";

document.addEventListener("DOMContentLoaded", () => {
    const appDiv = document.querySelector('#app');
    const headerDiv = document.querySelector('#header');
    const footerDiv = document.querySelector('#footer');

    // Usar el componente web para el header
    headerDiv.innerHTML = `<game-header></game-header>`;
    footerDiv.innerHTML = renderFooter();

    // Si no hay hash, decidir a dónde ir
    if (!window.location.hash || window.location.hash === '') {
        const userId = getSession();
        const isGuest = localStorage.getItem('guestMode') === 'true';
        const hasSavedGame = localStorage.getItem('oca_game_state');
        
        if (userId || isGuest || hasSavedGame) {
            window.location.hash = '#game';
        } else {
            window.location.hash = '#login';
        }
    }
    
    router(window.location.hash, appDiv);
    
    // Configurar router
    window.addEventListener("hashchange", () => {
        router(window.location.hash, appDiv);
    });
});