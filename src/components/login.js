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
                    window.location.hash = '#game';
                }, 1500);
            } else {
                await register(data);
                messageDiv.innerHTML = '<div class="alert alert-success">¡Cuenta creada! Por favor inicia sesión.</div>';
                setTimeout(() => {
                    window.location.hash = '#login';
                }, 1500);
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
            window.location.hash = '#game';
        }, 1000);
    });

    return div;
}

// Componentes web personalizados como en el ejemplo de tu profesor
class GameLogin extends HTMLElement {
    connectedCallback() {
        this.appendChild(renderLogin('login'));
    }
}

class GameRegister extends HTMLElement {
    connectedCallback() {
        this.appendChild(renderLogin('register'));
    }
}

customElements.define('game-login', GameLogin);
customElements.define('game-register', GameRegister);