// components/stats.js - SIN ESTADÍSTICAS DE TURNOS
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
    statsState$,
    loadGamesList,
    deleteGame,
    toggleGameResult,
    addManualGame,
    resetAllStats
} from "../services/statsService.js";

export { renderStats, GameStats };

function renderStats() {
    const div = document.createElement("div");
    div.className = "container mt-4";
    div.innerHTML = `
        <h3>Estadísticas</h3>
        
        <div class="mb-3">
            <button class="btn btn-success btn-sm me-2" id="addManualGameBtn">
                + Añadir partida
            </button>
            <button class="btn btn-danger btn-sm" id="resetStatsBtn">
                🔄 Reiniciar historial
            </button>
        </div>
        
        <!-- Solo mensaje de error (oculto por defecto) -->
        <div class="alert alert-danger" id="error-stats" style="display: none;"></div>
        
        <div class="card mb-3">
            <div class="card-body">
                <h5>Mis Estadísticas</h5>
                <div id="stats-content">
                    <div class="placeholder-glow">
                        <span class="placeholder col-7"></span>
                        <span class="placeholder col-4"></span>
                        <span class="placeholder col-4"></span>
                        <span class="placeholder col-6"></span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body">
                <h5>Historial de Partidas</h5>
                <div id="games-list">
                    <div class="placeholder-glow">
                        <span class="placeholder col-12 mb-2"></span>
                        <span class="placeholder col-12 mb-2"></span>
                        <span class="placeholder col-12"></span>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupStatsObservables(div);
    loadGamesList().catch(err => console.log('Error cargando juegos:', err));
    
    return div;
}

function setupStatsObservables(container) {
    // Suscripción al estado
    const stateSubscription = statsState$.subscribe(({ games, stats, error }) => {
        // Solo manejar errores (mostrar temporalmente)
        const errorElement = container.querySelector('#error-stats');
        if (errorElement) {
            if (error) {
                errorElement.style.display = 'block';
                errorElement.textContent = `Error: ${error}`;
                // Ocultar después de 5 segundos
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 5000);
            } else {
                errorElement.style.display = 'none';
            }
        }
        
        // Actualizar estadísticas
        updateStatsContent(container, stats);
        
        // Actualizar lista de juegos
        updateGamesList(container, games);
    });
    
    // Botones
    const addGameBtn = container.querySelector('#addManualGameBtn');
    const resetBtn = container.querySelector('#resetStatsBtn');
    
    if (addGameBtn) {
        fromEvent(addGameBtn, 'click').pipe(
            debounceTime(300)
        ).subscribe(() => {
            const userWon = confirm('¿Ganaste esta partida? (Jugador 1 - ficha azul)');
            if (userWon !== null) {
                addManualGame(userWon).then(result => {
                    if (result.success) {
                        showToast('✅ Partida añadida', 'success');
                    } else if (!result.cancelled) {
                        showToast(`❌ Error: ${result.error}`, 'danger');
                    }
                });
            }
        });
    }
    
    if (resetBtn) {
        fromEvent(resetBtn, 'click').pipe(
            debounceTime(300)
        ).subscribe(() => {
            resetAllStats().then(result => {
                if (result.success) {
                    showToast('✅ Historial reiniciado', 'success');
                } else if (!result.cancelled) {
                    showToast(`❌ Error: ${result.error}`, 'danger');
                }
            });
        });
    }
    
    container.cleanup = () => {
        stateSubscription.unsubscribe();
    };
}

function updateStatsContent(container, stats) {
    const statsContent = container.querySelector('#stats-content');
    if (!statsContent) return;
    
    const userId = localStorage.getItem('user_id');
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    if (!userId && !isGuest) {
        statsContent.innerHTML = `
            <p>Inicia sesión para ver estadísticas.</p>
            <a href="#login" class="btn btn-primary btn-sm">Iniciar Sesión</a>
        `;
        return;
    }
    
    if (!stats) {
        statsContent.innerHTML = `
            <p>No hay estadísticas disponibles.</p>
            ${isGuest ? '<p><small>Juega una partida para comenzar</small></p>' : ''}
        `;
        return;
    }
    
    const { total, won, lost, percentage } = stats;
    
    statsContent.innerHTML = `
        <p><strong>Partidas jugadas:</strong> ${total}</p>
        <p><strong>Victorias:</strong> ${won}</p>
        <p><strong>Derrotas:</strong> ${lost}</p>
        <p><strong>Ratio de victorias:</strong> ${percentage}%</p>
        ${isGuest ? '<p><small>Modo invitado</small></p>' : ''}
    `;
}

function updateGamesList(container, games) {
    const gamesList = container.querySelector('#games-list');
    if (!gamesList) return;
    
    const userId = localStorage.getItem('user_id');
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    if (!userId && !isGuest) {
        gamesList.innerHTML = '<p>Inicia sesión para ver historial.</p>';
        return;
    }
    
    if (!games || games.length === 0) {
        gamesList.innerHTML = `
            <p>No hay partidas registradas.</p>
            ${isGuest ? '<p><small>Juega una partida o añade una manualmente</small></p>' : ''}
        `;
        return;
    }
    
    let html = '<ul class="list-group">';
    
    games.forEach((game, index) => {
        const gameId = game.id || game.local_id || index;
        const date = new Date(game.created_at || game.local_id).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const userWon = game.user_won === true;
        const resultado = userWon ? '✅ Victoria' : '❌ Derrota';
        
        html += `
            <li class="list-group-item" data-game-id="${gameId}" data-is-guest="${isGuest}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${date}</strong>
                        <br>
                        <span class="${userWon ? 'text-success' : 'text-danger'} fw-bold">
                            ${resultado}
                        </span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning me-2 btn-toggle-result" 
                                title="Cambiar resultado victoria/derrota">
                            🔄 Trucar
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete-game">
                            Borrar
                        </button>
                    </div>
                </div>
            </li>
        `;
    });
    
    html += '</ul>';
    html += `<p class="mt-2 small text-muted">Total: ${games.length} partidas</p>`;
    
    gamesList.innerHTML = html;
    
    // Event listeners
    setTimeout(() => {
        container.querySelectorAll('.btn-delete-game').forEach(button => {
            fromEvent(button, 'click').pipe(
                debounceTime(300)
            ).subscribe(() => {
                const listItem = button.closest('li');
                const gameId = listItem.getAttribute('data-game-id');
                const isGuest = listItem.getAttribute('data-is-guest') === 'true';
                
                if (confirm('¿Borrar esta partida del historial?')) {
                    deleteGame(gameId, isGuest).then(result => {
                        if (result.success) {
                            showToast('✅ Partida eliminada', 'success');
                        } else {
                            showToast(`❌ Error: ${result.error}`, 'danger');
                        }
                    });
                }
            });
        });
        
        container.querySelectorAll('.btn-toggle-result').forEach(button => {
            fromEvent(button, 'click').pipe(
                debounceTime(300)
            ).subscribe(() => {
                const listItem = button.closest('li');
                const gameId = listItem.getAttribute('data-game-id');
                const isGuest = listItem.getAttribute('data-is-guest') === 'true';
                
                if (confirm('¿Cambiar el resultado de esta partida?')) {
                    toggleGameResult(gameId, isGuest).then(result => {
                        if (result.success) {
                            showToast('✅ Resultado cambiado', 'success');
                        } else {
                            showToast(`❌ Error: ${result.error}`, 'danger');
                        }
                    });
                }
            });
        });
    }, 100);
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 250px;
    `;
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

class GameStats extends HTMLElement {
    constructor() {
        super();
        this.cleanup = null;
    }

    connectedCallback() {
        const statsElement = renderStats();
        this.appendChild(statsElement);
        this.cleanup = statsElement.cleanup;
    }

    disconnectedCallback() {
        if (this.cleanup) {
            this.cleanup();
        }
    }
}

if (!customElements.get('game-stats')) {
    customElements.define('game-stats', GameStats);
}