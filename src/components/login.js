// components/login.js
import { login, register } from "../services/supaservice.js";

export { renderLogin };

const renderLogin = (method) => {
    const formHTML = `
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title text-center mb-4">${method === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                        <form id="${method}Form">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="password" name="password" required>
                            </div>
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">
                                    ${method === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                                </button>
                                <button type="button" class="btn btn-outline-secondary" id="guestBtn">
                                    Jugar como Invitado
                                </button>
                            </div>
                            <div id="message" class="mt-3"></div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = formHTML;

    const form = div.querySelector(`#${method}Form`);
    const messageDiv = div.querySelector("#message");
    const guestBtn = div.querySelector("#guestBtn");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        messageDiv.innerHTML = '<div class="alert alert-info">Procesando...</div>';
        
        try {
            if (method === "login") {
                await login(data);
                messageDiv.innerHTML = '<div class="alert alert-success">¡Inicio de sesión exitoso! Redirigiendo...</div>';
                setTimeout(() => {
                    // Redirigir directamente al juego y recargar
                    window.location.href = window.location.origin + window.location.pathname + '#game';
                    window.location.reload();
                }, 1000);
            } else {
                await register(data);
                messageDiv.innerHTML = '<div class="alert alert-success">¡Cuenta creada! Por favor inicia sesión.</div>';
                setTimeout(() => {
                    // Redirigir al login para que inicien sesión
                    window.location.href = window.location.origin + window.location.pathname + '#login';
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message || 'Error desconocido'}</div>`;
        }
    });

    guestBtn.addEventListener("click", () => {
        localStorage.setItem('guestMode', 'true');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        messageDiv.innerHTML = '<div class="alert alert-info">Modo invitado activado. Redirigiendo...</div>';
        setTimeout(() => {
            // Redirigir directamente al juego y recargar
            window.location.href = window.location.origin + window.location.pathname + '#game';
            window.location.reload();
        }, 1000);
    });

    return div;
}

// Función para verificar si ya está autenticado
export function checkIfAlreadyAuthenticated() {
    const userId = localStorage.getItem('user_id');
    const isGuest = localStorage.getItem('guestMode') === 'true';
    const partidaGuardada = localStorage.getItem('oca_game_state');
    
    // Si hay partida en curso, NO redirigir automáticamente
    // Dejar que el usuario decida en el juego
    if (partidaGuardada) {
        try {
            const estado = JSON.parse(partidaGuardada);
            if (estado.juegoActivo) {
                // Si hay partida activa, mostrar login normalmente
                return false;
            }
        } catch (e) {
            // Error parsing, continuar normal
        }
    }
    
    if (userId || isGuest) {
        // Si ya está autenticado, redirigir al juego
        window.location.hash = '#game';
        return true;
    }
    return false;
}

// Componentes web personalizados como en el ejemplo de tu profesor
class GameLogin extends HTMLElement {
    connectedCallback() {
        // Verificar si ya está autenticado antes de mostrar el login
        if (!checkIfAlreadyAuthenticated()) {
            this.appendChild(renderLogin('login'));
        }
    }
}

class GameRegister extends HTMLElement {
    connectedCallback() {
        // Verificar si ya está autenticado antes de mostrar el registro
        if (!checkIfAlreadyAuthenticated()) {
            this.appendChild(renderLogin('register'));
        }
    }
}

customElements.define('game-login', GameLogin);
customElements.define('game-register', GameRegister);