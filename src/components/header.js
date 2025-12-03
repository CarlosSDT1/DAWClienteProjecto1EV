// components/header.js
import { userSubject$, getSession } from "../services/supaservice.js";

export { renderHeader };

function renderHeader() {
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    let userInfo = "🎮 Invitado";
    let dropdownMenu = `
        <li><a class="dropdown-item" href="#login">Iniciar Sesión</a></li>
        <li><a class="dropdown-item" href="#register">Crear Cuenta</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#game">Jugar como Invitado</a></li>
    `;
    
    if (userId) {
        userInfo = "👤 Jugador";
        dropdownMenu = `
            <li><a class="dropdown-item" href="#profile">Mi Perfil</a></li>
            <li><a class="dropdown-item" href="#stats">Estadísticas</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn">Cerrar Sesión</a></li>
        `;
    } else if (isGuest) {
        dropdownMenu = `
            <li><a class="dropdown-item" href="#login">Iniciar Sesión</a></li>
            <li><a class="dropdown-item" href="#register">Crear Cuenta</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn">Salir del modo Invitado</a></li>
        `;
    }

    return `
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand" href="#game">Juego de la Oca</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link ${window.location.hash === '#game' || window.location.hash === '' ? 'active' : ''}" href="#game">Juego</a>
                    </li>
                    ${userId || isGuest ? '' : `
                        <li class="nav-item">
                            <a class="nav-link ${window.location.hash === '#login' ? 'active' : ''}" href="#login">Iniciar Sesión</a>
                        </li>
                    `}
                    <li class="nav-item">
                        <a class="nav-link ${window.location.hash === '#stats' ? 'active' : ''}" href="#stats">Estadísticas</a>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <span>${userInfo}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            ${dropdownMenu}
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `;
}

// Función para manejar eventos del header
export function setupHeaderEvents() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logoutBtn') {
            e.preventDefault();
            
            // Limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user');
            localStorage.removeItem('guestMode');
            
            // Recargar página
            window.location.hash = '#game';
            window.location.reload();
        }
    });
}

// Componente web personalizado
class GameHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = renderHeader();
        setupHeaderEvents();
    }
}

customElements.define('game-header', GameHeader);