// main.js
import "./scss/style.scss";
import { router } from "./router";
import { userSubject$ } from "./services/supaservice.js";

// eslint-disable-next-line
import * as bootstrap from 'bootstrap';

import "./components/header.js"; // Importa el componente header
import { renderFooter } from "./components/footer";

document.addEventListener("DOMContentLoaded", () => {
    const appDiv = document.querySelector('#app');
    const headerDiv = document.querySelector('#header');
    const footerDiv = document.querySelector('#footer');

    // Usar el componente web para el header
    headerDiv.innerHTML = `<game-header></game-header>`;
    footerDiv.innerHTML = renderFooter();

    // Suscribirse a cambios en el usuario
    userSubject$.subscribe(user => {
        // Actualizar el header si es necesario
        const header = document.querySelector('game-header');
        if (header) {
            header.innerHTML = header.renderHeader();
        }
    });

    router(window.location.hash, appDiv);
    
    window.addEventListener("hashchange", () => {
        router(window.location.hash, appDiv);
    });
});