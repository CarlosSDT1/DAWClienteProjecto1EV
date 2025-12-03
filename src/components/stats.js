// components/stats.js
import { getUserStats, getGames } from "../services/supaservice.js";

export { renderStats };

function renderStats() {
    const div = document.createElement("div");
    div.className = "container mt-4";
    div.innerHTML = `
        <h2>Estadísticas del Juego</h2>
        <div id="statsContent" class="mt-3">
            <p>Cargando estadísticas...</p>
        </div>
    `;

    const loadStats = async () => {
        const userId = getSession();
        const isGuest = localStorage.getItem('guestMode') === 'true';

        if (!userId && !isGuest) {
            div.querySelector("#statsContent").innerHTML = `
                <div class="alert alert-info">
                    <p>Inicia sesión para guardar tus estadísticas o juega como invitado para ver estadísticas temporales.</p>
                    <a href="#login" class="btn btn-primary me-2">Iniciar Sesión</a>
                    <a href="#game" class="btn btn-outline-secondary">Jugar como Invitado</a>
                </div>
            `;
            return;
        }

        try {
            let statsHTML = '';
            
            if (userId) {
                const userStats = await getUserStats();
                const userGames = await getGames();
                
                statsHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5>Estadísticas Personales</h5>
                                </div>
                                <div class="card-body">
                                    <p><strong>Partidas jugadas:</strong> ${userStats?.games_played || 0}</p>
                                    <p><strong>Partidas ganadas:</strong> ${userStats?.games_won || 0}</p>
                                    <p><strong>Total de turnos:</strong> ${userStats?.total_turns || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5>Historial de Partidas</h5>
                                </div>
                                <div class="card-body">
                                    ${userGames.length > 0 ? 
                                        `<ul class="list-group">
                                            ${userGames.slice(0, 5).map(game => `
                                                <li class="list-group-item">
                                                    Partida ${new Date(game.created_at).toLocaleDateString()}
                                                    ${game.finished ? '✅ Completada' : '⏸️ En pausa'}
                                                </li>
                                            `).join('')}
                                        </ul>` : 
                                        '<p>No hay partidas guardadas</p>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (isGuest) {
                const localGames = JSON.parse(localStorage.getItem('oca_games') || '[]');
                statsHTML = `
                    <div class="alert alert-warning">
                        <p>Estás en modo invitado. Las estadísticas se perderán al cerrar el navegador.</p>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h5>Partidas como Invitado</h5>
                            ${localGames.length > 0 ? 
                                `<p>Has jugado ${localGames.length} partidas como invitado</p>` : 
                                '<p>No hay partidas guardadas en modo invitado</p>'
                            }
                        </div>
                    </div>
                `;
            }
            
            div.querySelector("#statsContent").innerHTML = statsHTML;
        } catch (error) {
            div.querySelector("#statsContent").innerHTML = `
                <div class="alert alert-danger">
                    Error al cargar estadísticas: ${error.message}
                </div>
            `;
        }
    };

    loadStats();
    return div;
}

class GameStats extends HTMLElement {
    connectedCallback() {
        this.appendChild(renderStats());
    }
}

customElements.define('game-stats', GameStats);