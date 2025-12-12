// components/header.js - COMPLETO CON ROLES
import { getUserRole } from "../services/supaservice.js";

export { renderHeader, setupHeaderEvents, updateHeader };

function renderHeader() {
    const role = getUserRole();
    
    let userInfo = "";
    let dropdownMenu = "";
    
    if (role === 'user') {
        userInfo = "Usuario";
        dropdownMenu = `
            <li><a class="dropdown-item" href="#stats">Estadísticas</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn">Cerrar Sesión</a></li>
        `;
    } else if (role === 'guest') {
        userInfo = "Invitado";
        dropdownMenu = `
            <li><a class="dropdown-item" href="#" id="exitGuestBtn">Salir del modo Invitado</a></li>
        `;
    } else {
        userInfo = "No autenticado";
        dropdownMenu = `
            <li><a class="dropdown-item" href="#login">Iniciar Sesión</a></li>
            <li><a class="dropdown-item" href="#register">Registrarse</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#game">Jugar como Invitado</a></li>
        `;
    }

    const currentHash = window.location.hash || '#game';
    
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
                        <a class="nav-link ${currentHash === '#game' || currentHash === '' ? 'active' : ''}" href="#game">
                            Juego
                        </a>
                    </li>
                    ${role === 'user' ? `
                        <li class="nav-item">
                            <a class="nav-link ${currentHash === '#stats' ? 'active' : ''}" href="#stats">
                                Estadísticas
                            </a>
                        </li>
                    ` : ''}
                    ${role === 'guest' ? `
                    ` : ''}
                    ${role === null ? `
                        <li class="nav-item">
                            <a class="nav-link ${currentHash === '#login' ? 'active' : ''}" href="#login">
                                Iniciar Sesión
                            </a>
                        </li>
                    ` : ''}
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
function setupHeaderEvents() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logoutBtn') {
            e.preventDefault();
            
            // Limpiar localStorage para usuario
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user');
            
            // Recargar página y redirigir al login
            window.location.href = window.location.origin + window.location.pathname + '#login';
            window.location.reload();
        }
        
        if (e.target.id === 'exitGuestBtn') {
            e.preventDefault();
            
            // Limpiar modo invitado
            localStorage.removeItem('guestMode');
            localStorage.removeItem('guest_since');
            
            // Recargar página y redirigir al login
            window.location.href = window.location.origin + window.location.pathname + '#login';
            window.location.reload();
        }
    });
}

// Función para actualizar el header dinámicamente
function updateHeader() {
    const headerElement = document.querySelector('game-header');
    if (headerElement) {
        headerElement.innerHTML = renderHeader();
        setupHeaderEvents();
    }
}

// Suscribirse a cambios en el usuario para actualizar el header
import { userSubject$ } from "../services/supaservice.js";
userSubject$.subscribe(() => {
    updateHeader();
});

// Componente web personalizado
class GameHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = renderHeader();
        setupHeaderEvents();
    }
}

customElements.define('game-header', GameHeader);