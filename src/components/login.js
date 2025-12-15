// components/login.js - COMPLETO CON LOGIN Y REGISTER (CON BOTÓN DE INVITADO)
import { login, register, getUserRole } from "../services/supaservice.js";
import { fromEvent, combineLatest, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap, switchMap, catchError, startWith } from 'rxjs/operators';

export { renderLogin, checkIfAlreadyAuthenticated };

const renderLogin = (method) => {
    const role = getUserRole();
    
    // Si ya está autenticado (usuario o invitado), redirigir automáticamente
    if (role === 'user' || role === 'guest') {
        window.location.hash = '#game';
        return document.createElement('div'); // Devolver div vacío
    }
    
    const isGuest = role === 'guest';
    
    const formHTML = `
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title text-center mb-4">${method === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                        ${isGuest ? `
                        <div class="alert alert-info mb-3">
                            <strong>Modo Invitado activo</strong>
                            <p class="mb-0">Inicia sesión para guardar tus estadísticas y acceder a todas las funcionalidades.</p>
                        </div>
                        ` : ''}
                        <form id="${method}Form">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" name="email" required 
                                       placeholder="tu@email.com">
                                <div class="form-text" id="email-help"></div>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="password" name="password" required 
                                       placeholder="Mínimo 6 caracteres">
                                <div class="form-text" id="password-help"></div>
                            </div>
                            ${method === 'register' ? `
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                                <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required 
                                       placeholder="Repite tu contraseña">
                                <div class="form-text" id="confirm-password-help"></div>
                            </div>
                            ` : ''}
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary" id="submit-btn" disabled>
                                    ${method === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                                </button>
                                ${method === 'login' ? `
                                <button type="button" class="btn btn-outline-secondary" id="guestBtn">
                                    Jugar como Invitado
                                </button>
                                ` : ''}
                                <a href="${method === 'login' ? '#register' : '#login'}" class="btn btn-link">
                                    ${method === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                                </a>
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
    const guestBtn = method === 'login' ? div.querySelector("#guestBtn") : null;
    const submitBtn = div.querySelector("#submit-btn");
    const emailInput = div.querySelector("#email");
    const passwordInput = div.querySelector("#password");
    const confirmPasswordInput = method === 'register' ? div.querySelector("#confirmPassword") : null;

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
                ? 'Email válido' 
                : 'Email no válido'
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
                ? 'Contraseña válida' 
                : `Mínimo 6 caracteres (${password.length}/6)`
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

    // Observable para confirmación de password (solo para registro)
    let confirmPasswordValidation$ = of({ value: '', isValid: false, message: '' });
    
    if (method === 'register' && confirmPasswordInput) {
        confirmPasswordValidation$ = fromEvent(confirmPasswordInput, 'input').pipe(
            debounceTime(300),
            map(event => event.target.value),
            map(confirmPassword => {
                const password = passwordInput.value;
                const isValid = confirmPassword === password && password.length >= 6;
                const message = confirmPassword === '' ? '' : 
                    confirmPassword === password ? 'Contraseñas coinciden' : 'Las contraseñas no coinciden';
                
                return {
                    value: confirmPassword,
                    isValid: isValid,
                    message: message
                };
            }),
            startWith({ value: '', isValid: false, message: '' }),
            distinctUntilChanged((a, b) => 
                a.value === b.value && a.isValid === b.isValid
            ),
            tap(({ message, isValid }) => {
                const confirmPasswordHelp = div.querySelector("#confirm-password-help");
                confirmPasswordHelp.textContent = message;
                confirmPasswordHelp.className = `form-text ${isValid ? 'text-success' : 'text-danger'}`;
                
                // Efecto visual
                confirmPasswordInput.classList.toggle('is-valid', isValid && confirmPasswordInput.value !== '');
                confirmPasswordInput.classList.toggle('is-invalid', !isValid && confirmPasswordInput.value !== '');
            })
        );
    }

    // Combinar validaciones para habilitar/deshabilitar botón
    const validationObservables = method === 'register' 
        ? [emailValidation$, passwordValidation$, confirmPasswordValidation$]
        : [emailValidation$, passwordValidation$];

    const formValidity$ = combineLatest(validationObservables).pipe(
        map(validations => validations.every(v => v.isValid)),
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
        tap(({ success, error }) => {
            if (success) {
                if (method === "login") {
                    messageDiv.innerHTML = '<div class="alert alert-success">¡Inicio de sesión exitoso! Redirigiendo...</div>';
                    submitBtn.innerHTML = '¡Éxito!';
                    setTimeout(() => {
                        window.location.href = window.location.origin + window.location.pathname + '#game';
                        window.location.reload();
                    }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="alert alert-success">¡Cuenta creada exitosamente! Por favor inicia sesión.</div>';
                    submitBtn.innerHTML = 'Registrado';
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

    // Observable para botón de invitado (solo en login)
    let guestClick$ = of(null);
    
    if (method === 'login' && guestBtn) {
        guestClick$ = fromEvent(guestBtn, 'click').pipe(
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
                guestBtn.innerHTML = 'Activado';
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
    }


    // Iniciar suscripciones
    const subscriptions = [
        emailValidation$.subscribe(),
        passwordValidation$.subscribe(),
        formValidity$.subscribe(),
        formSubmit$.subscribe()
    ];
    
    if (method === 'register' && confirmPasswordInput) {
        subscriptions.push(confirmPasswordValidation$.subscribe());
    }
    
    if (method === 'login' && guestBtn) {
        subscriptions.push(guestClick$.subscribe());
    }

    // Limpiar suscripciones cuando se destruya el componente
    div.cleanup = () => {
        subscriptions.forEach(sub => sub.unsubscribe());
        console.log('Suscripciones login limpiadas');
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