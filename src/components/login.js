// components/login.js - MODIFICADO CON RXJS
import { login, register } from "../services/supaservice.js";
import { fromEvent, combineLatest, of, merge } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap, filter, switchMap, catchError, startWith } from 'rxjs/operators';

export { renderLogin, checkIfAlreadyAuthenticated };

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
                                <div class="form-text" id="email-help"></div>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="password" name="password" required>
                                <div class="form-text" id="password-help"></div>
                            </div>
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary" id="submit-btn" disabled>
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
    const submitBtn = div.querySelector("#submit-btn");
    const emailInput = div.querySelector("#email");
    const passwordInput = div.querySelector("#password");

    // Crear FormData y convertirlo a JSON
    const getFormData = () => {
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries()); // Transforma FormData a JSON
    };

    // Observable para validación de email
    const emailValidation$ = fromEvent(emailInput, 'input').pipe(
        debounceTime(300),
        map(event => event.target.value.trim()),
        map(email => ({
            value: email,
            isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            message: email === '' ? '' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) 
                ? '✅ Email válido' 
                : '❌ Email no válido'
        })),
        startWith({ value: '', isValid: false, message: '' }),
        distinctUntilChanged((a, b) => 
            a.value === b.value && a.isValid === b.isValid
        ),
        tap(({ message, isValid }) => {
            const emailHelp = div.querySelector("#email-help");
            emailHelp.textContent = message;
            emailHelp.className = `form-text ${isValid ? 'text-success' : 'text-danger'}`;
            
            // Efecto visual
            emailInput.classList.toggle('is-valid', isValid && emailInput.value !== '');
            emailInput.classList.toggle('is-invalid', !isValid && emailInput.value !== '');
        })
    );

    // Observable para validación de password
    const passwordValidation$ = fromEvent(passwordInput, 'input').pipe(
        debounceTime(300),
        map(event => event.target.value),
        map(password => ({
            value: password,
            isValid: password.length >= 6,
            message: password === '' ? '' : password.length >= 6 
                ? '✅ Contraseña válida' 
                : `❌ Mínimo 6 caracteres (${password.length}/6)`
        })),
        startWith({ value: '', isValid: false, message: '' }),
        distinctUntilChanged((a, b) => 
            a.value === b.value && a.isValid === b.isValid
        ),
        tap(({ message, isValid }) => {
            const passwordHelp = div.querySelector("#password-help");
            passwordHelp.textContent = message;
            passwordHelp.className = `form-text ${isValid ? 'text-success' : 'text-danger'}`;
            
            // Efecto visual
            passwordInput.classList.toggle('is-valid', isValid && passwordInput.value !== '');
            passwordInput.classList.toggle('is-invalid', !isValid && passwordInput.value !== '');
        })
    );

    // Combinar validaciones para habilitar/deshabilitar botón
    const formValidity$ = combineLatest([
        emailValidation$,
        passwordValidation$
    ]).pipe(
        map(([email, password]) => email.isValid && password.isValid),
        distinctUntilChanged(),
        tap(isValid => {
            submitBtn.disabled = !isValid;
            submitBtn.title = isValid ? '' : 'Completa todos los campos correctamente';
            submitBtn.classList.toggle('btn-success', isValid);
            submitBtn.classList.toggle('btn-primary', !isValid);
        })
    );

    // Observable para submit del formulario
    const formSubmit$ = fromEvent(form, 'submit').pipe(
        tap(event => event.preventDefault()),
        map(() => getFormData()),
        tap(() => {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
            messageDiv.innerHTML = '<div class="alert alert-info">Procesando...</div>';
        }),
        switchMap(formData => {
            const authObservable = method === "login" 
                ? login(formData) 
                : register(formData);
            
            return authObservable.pipe(
                map(response => ({ success: true, response })),
                catchError(error => of({ 
                    success: false, 
                    error: error.message || 'Error desconocido' 
                }))
            );
        }),
        tap(({ success, response, error }) => {
            if (success) {
                if (method === "login") {
                    messageDiv.innerHTML = '<div class="alert alert-success">¡Inicio de sesión exitoso! Redirigiendo...</div>';
                    submitBtn.innerHTML = '✅ ¡Éxito!';
                    setTimeout(() => {
                        window.location.href = window.location.origin + window.location.pathname + '#game';
                        window.location.reload();
                    }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="alert alert-success">¡Cuenta creada! Por favor inicia sesión.</div>';
                    submitBtn.innerHTML = '✅ Registrado';
                    setTimeout(() => {
                        window.location.href = window.location.origin + window.location.pathname + '#login';
                        window.location.reload();
                    }, 1500);
                }
            } else {
                messageDiv.innerHTML = `<div class="alert alert-danger">Error: ${error}</div>`;
                submitBtn.disabled = false;
                submitBtn.innerHTML = method === 'login' ? 'Iniciar Sesión' : 'Registrarse';
                
                // Efecto de error
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 500);
            }
        }),
        catchError(error => {
            console.error('Error en auth:', error);
            messageDiv.innerHTML = '<div class="alert alert-danger">Error inesperado. Inténtalo de nuevo.</div>';
            submitBtn.disabled = false;
            submitBtn.innerHTML = method === 'login' ? 'Iniciar Sesión' : 'Registrarse';
            return of(null);
        })
    );

    // Observable para botón de invitado
    const guestClick$ = fromEvent(guestBtn, 'click').pipe(
        tap(() => {
            guestBtn.disabled = true;
            guestBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Activando...';
            messageDiv.innerHTML = '<div class="alert alert-info">Activando modo invitado...</div>';
        }),
        tap(() => {
            localStorage.setItem('guestMode', 'true');
            localStorage.setItem('guest_since', new Date().toISOString());
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
        }),
        tap(() => {
            messageDiv.innerHTML = '<div class="alert alert-success">Modo invitado activado. Redirigiendo...</div>';
            guestBtn.innerHTML = '✅ Activado';
        }),
        switchMap(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    window.location.href = window.location.origin + window.location.pathname + '#game';
                    window.location.reload();
                    resolve();
                }, 1000);
            });
        })
    );

    // Combinar todos los observables
    const allObservables$ = merge(
        emailValidation$,
        passwordValidation$,
        formValidity$,
        formSubmit$,
        guestClick$
    );

    // Iniciar suscripciones
    const subscriptions = [
        emailValidation$.subscribe(),
        passwordValidation$.subscribe(),
        formValidity$.subscribe(),
        formSubmit$.subscribe(),
        guestClick$.subscribe()
    ];

    // Limpiar suscripciones cuando se destruya el componente
    div.cleanup = () => {
        subscriptions.forEach(sub => sub.unsubscribe());
        console.log('🧹 Suscripciones login limpiadas');
    };

    return div;
}

// Función para verificar si ya está autenticado
function checkIfAlreadyAuthenticated() {
    const userId = localStorage.getItem('user_id');
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    if (userId || isGuest) {
        // Si ya está autenticado, redirigir al juego
        window.location.hash = '#game';
        return true;
    }
    return false;
}

// Componentes web personalizados
class GameLogin extends HTMLElement {
    constructor() {
        super();
        this.cleanup = null;
    }

    connectedCallback() {
        if (!checkIfAlreadyAuthenticated()) {
            const loginElement = renderLogin('login');
            this.appendChild(loginElement);
            this.cleanup = loginElement.cleanup;
        }
    }

    disconnectedCallback() {
        if (this.cleanup) {
            this.cleanup();
        }
    }
}

class GameRegister extends HTMLElement {
    constructor() {
        super();
        this.cleanup = null;
    }

    connectedCallback() {
        if (!checkIfAlreadyAuthenticated()) {
            const registerElement = renderLogin('register');
            this.appendChild(registerElement);
            this.cleanup = registerElement.cleanup;
        }
    }

    disconnectedCallback() {
        if (this.cleanup) {
            this.cleanup();
        }
    }
}

customElements.define('game-login', GameLogin);
customElements.define('game-register', GameRegister);