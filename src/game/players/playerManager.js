// game/players/playerManager.js
export function siguienteTurno(estado) {
    if (!estado || !estado.juegoActivo) return estado.jugadorActual;
    
    let siguienteJugador = estado.jugadorActual;
    let intentos = 0;
    
    do {
        siguienteJugador = siguienteJugador % 4 + 1;
        intentos++;
        
        if (intentos > 8) {
            console.warn("No se encontró jugador disponible");
            break;
        }
    } while (estado.jugadores[siguienteJugador].terminado || 
             estado.jugadoresInactivos.has(siguienteJugador));
    
    estado.jugadorActual = siguienteJugador;
    return estado.jugadorActual;
}

export function actualizarPosiciones(estado) {
    if (!estado || !estado.jugadores) return;
    
    for (let jugadorId = 1; jugadorId <= 4; jugadorId++) {
        const posElement = document.getElementById(`pos-jugador${jugadorId}`);
        const dadosElement = document.getElementById(`dados-jugador${jugadorId}`);
        const estadoElement = document.getElementById(`estado-jugador${jugadorId}`);
        
        if (posElement && estado.jugadores[jugadorId]) {
            posElement.textContent = estado.jugadores[jugadorId].posicion;
        }
        
        if (dadosElement && estado.jugadores[jugadorId]) {
            dadosElement.textContent = estado.jugadores[jugadorId].dadosAcumulados;
        }
        
        if (estadoElement && estado.jugadores[jugadorId]) {
            if (estado.jugadores[jugadorId].terminado) {
                estadoElement.innerHTML = `<span class="badge bg-success">🥇 ${estado.jugadores[jugadorId].posicionFinal}° Lugar</span>`;
            } else if (estado.jugadoresInactivos && estado.jugadoresInactivos.has(jugadorId)) {
                estadoElement.innerHTML = '<span class="badge bg-secondary">⏸️ Inactivo</span>';
            } else {
                estadoElement.innerHTML = '<span class="badge bg-light text-dark">🎯 Jugando</span>';
            }
        }
    }
}

export function actualizarEstadosJugadores(estado) {
    if (!estado || !estado.jugadores) return;
    
    for (let jugadorId = 1; jugadorId <= 4; jugadorId++) {
        const posicionElement = document.getElementById(`pos-jugador${jugadorId}`);
        if (posicionElement && estado.jugadores[jugadorId]) {
            if (estado.jugadoresInactivos && estado.jugadoresInactivos.has(jugadorId)) {
                posicionElement.innerHTML = `<span class="text-warning">${estado.jugadores[jugadorId].posicion} (Inactivo)</span>`;
            } else {
                posicionElement.textContent = estado.jugadores[jugadorId].posicion;
            }
        }
    }
}