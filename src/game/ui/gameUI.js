// game/ui/gameUI.js
export function actualizarInfoTurno(estado) {
    if (!estado || !estado.jugadores || !estado.jugadorActual) return;
    
    const jugador = estado.jugadores[estado.jugadorActual];
    if (!jugador) return;
    
    const jugadorActualElement = document.getElementById('jugador-actual');
    if (jugadorActualElement) {
        jugadorActualElement.textContent = jugador.nombre;
    }
    
    const badge = document.querySelector('#info-turno .badge');
    if (badge) {
        badge.className = `badge bg-${jugador.color} fs-5 p-3`;
    }
    
    const infoDados = document.getElementById('info-dados-turno');
    if (infoDados) {
        if (jugador.dadosAcumulados > 1) {
            infoDados.textContent = `(Tirará ${jugador.dadosAcumulados} dados)`;
            infoDados.className = 'text-warning fw-bold';
        } else {
            infoDados.textContent = '';
            infoDados.className = '';
        }
    }
}

export function mostrarMensaje(texto, tipo = 'info') {
    const mensajeEspecialElement = document.getElementById('mensaje-especial');
    if (mensajeEspecialElement) {
        mensajeEspecialElement.textContent = texto;
        mensajeEspecialElement.className = `h6 text-${tipo}`;
    }
}

export function mostrarResultadoDado(texto) {
    const dadoResultadoElement = document.getElementById('dado-resultado');
    if (dadoResultadoElement) {
        dadoResultadoElement.textContent = texto;
        dadoResultadoElement.className = 'h5 text-primary fw-bold';
    }
}

export function actualizarInfoCarrera(estado) {
    const infoCarreraElement = document.getElementById('info-carrera');
    if (!infoCarreraElement || !estado) return;
    
    const terminados = estado.jugadoresTerminados || 0;
    
    if (terminados > 0) {
        const ganador = Object.values(estado.jugadores).find(j => j.posicionFinal === 1);
        if (ganador) {
            infoCarreraElement.innerHTML = `
                <div class="alert alert-success py-2 mb-0">
                    <span class="fw-bold">🏆 ¡${ganador.nombre} ganó la partida!</span>
                    <button class="btn btn-sm btn-outline-light ms-2" onclick="document.getElementById('tabla-posiciones').scrollIntoView({behavior: 'smooth'})">
                        Ver resultados
                    </button>
                </div>
            `;
        }
    } else {
        infoCarreraElement.textContent = '🏁 ¡Sé el primero en llegar a la casilla 63 para ganar!';
        infoCarreraElement.className = 'small text-muted';
    }
}