// game/stats/gameStats.js - CORREGIDO
import { getSession, saveGameState, updateUserStats } from "../../services/supaservice.js";

export function calcularPosicionesFinales(jugadores) {
    // Destructuring del array de jugadors
    const jugadoresArray = Object.values(jugadores); // <-- DESTRUCTURING PREVI
    const jugadoresOrdenados = jugadoresArray
        .sort((a, b) => {
            // Destructuring de cada jugador
            const { posicion: posA, turnos: turnosA } = a; // <-- DESTRUCTURING ANIAT
            const { posicion: posB, turnos: turnosB } = b; // <-- DESTRUCTURING ANIAT
            
            if (posA === 63 && posB !== 63) return -1;
            if (posB === 63 && posA !== 63) return 1;
            
            if (posB !== posA) {
                return posB - posA;
            } else {
                return turnosA - turnosB;
            }
        });
    
    jugadoresOrdenados.forEach((jugador, index) => {
        jugador.posicionFinal = index + 1;
        jugador.terminado = true;
    });
    
    return jugadoresOrdenados.length;
}

export function mostrarTablaPosiciones(jugadores) {
    const cuerpoTablaElement = document.getElementById('cuerpo-tabla-posiciones');
    if (!cuerpoTablaElement) return;
    
    // Destructuring del objecte jugadors
    const jugadoresArray = Object.values(jugadores); // <-- DESTRUCTURING PREVI
    const jugadoresOrdenados = jugadoresArray
        .sort((a, b) => a.posicionFinal - b.posicionFinal);
    
    cuerpoTablaElement.innerHTML = '';
    
    jugadoresOrdenados.forEach((jugador) => {
        // Destructuring de cada jugador per a les propietats
        const { posicionFinal, nombre, color, posicion, turnos } = jugador; // <-- DESTRUCTURING AFEGIT
        
        const fila = document.createElement('tr');
        let posicionTexto = '';
        let claseFila = '';
        let estadoJugador = '';
        
        switch (posicionFinal) {
            case 1:
                posicionTexto = '🥇 1°';
                claseFila = 'table-success fw-bold';
                estadoJugador = '<span class="text-success">🏆 Ganador</span>';
                break;
            case 2:
                posicionTexto = '🥈 2°';
                claseFila = 'table-info';
                estadoJugador = '<span class="text-info">Finalista</span>';
                break;
            case 3:
                posicionTexto = '🥉 3°';
                claseFila = 'table-warning';
                estadoJugador = '<span class="text-warning">Tercer lugar</span>';
                break;
            default:
                posicionTexto = `${posicionFinal}°`;
                claseFila = '';
                estadoJugador = '<span class="text-secondary">Participante</span>';
        }
        
        let infoExtra = '';
        if (posicion === 63) {
            infoExtra = `<br><small class="text-success">Llegó a la meta</small>`;
        } else {
            infoExtra = `<br><small class="text-muted">Casilla ${posicion}</small>`;
        }
        
        fila.className = claseFila;
        fila.innerHTML = `
            <td class="fw-bold">${posicionTexto}</td>
            <td>
                <span class="badge bg-${color}">${nombre}</span>
                ${infoExtra}
            </td>
            <td>${turnos}</td>
            <td>${estadoJugador}</td>
        `;
        
        cuerpoTablaElement.appendChild(fila);
    });
    
    const tablaPosicionesElement = document.getElementById('tabla-posiciones');
    if (tablaPosicionesElement) {
        tablaPosicionesElement.style.display = 'block';
        tablaPosicionesElement.querySelector('h3').textContent = '🏆 Resultados Finales de la Partida 🏆';
    }
}

export function guardarEstadisticasJuego(estado) {
    // Destructuring de l'estat i localStorage
    const { jugadores, jugadoresTerminados, jugadorActual, turnoActual } = estado; // <-- DESTRUCTURING AFEGIT
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    if (!userId && !isGuest) {
        console.log("No se guardan estadísticas: usuario no autenticado");
        return;
    }
    
    // Destructuring del array de jugadors
    const jugadoresArray = Object.values(jugadores); // <-- DESTRUCTURING PREVI
    const ganador = jugadoresArray.find(j => j.posicionFinal === 1);
    
    // Ús de reduce amb destructuring
    const totalTurnos = jugadoresArray.reduce((sum, jugador) => {
        const { turnos } = jugador; // <-- DESTRUCTURING DINS REDUCE
        return sum + turnos;
    }, 0);
    
    // Destructuring del jugador 1
    const jugador1 = jugadores[1];
    const { nombre: nombreJugador1 } = jugador1; // <-- DESTRUCTURING AFEGIT
    const ganoJugador1 = ganador && ganador.nombre === nombreJugador1;
    
    const statsUpdate = {
        games_played: 1,
        games_won: ganoJugador1 ? 1 : 0,
        total_turns: totalTurnos,
        last_played: new Date().toISOString()
    };
    
    // Destructuring adicional per al gameData
    const gameData = {
        game_state: {
            jugadores: jugadores,
            ganador: ganador?.nombre || 'Desconocido',
            jugadorActual: jugadorActual,
            juegoActivo: false,
            jugadoresTerminados: jugadoresTerminados,
            turnoActual: turnoActual,
            fecha: new Date().toISOString(),
            totalTurnos: totalTurnos
        },
        finished: true,
        finished_at: new Date().toISOString()
    };
    
    if (userId) {
        // Usar subscribe en lugar de then (porque es Observable)
        saveGameState(gameData).then(result => {
            console.log("✅ Juego guardado en Supabase");
            // updateUserStats ahora es un Observable, usar subscribe
            updateUserStats(statsUpdate).subscribe({
                next: (result) => {
                    console.log("✅ Estadísticas actualizadas", result);
                },
                error: (error) => {
                    console.error("❌ Error actualizando estadísticas:", error);
                }
            });
        }).catch(error => {
            console.error("❌ Error guardando juego:", error);
        });
    } else if (isGuest) {
        const localGames = JSON.parse(localStorage.getItem('oca_games') || '[]');
        localGames.push({
            ...gameData, // Spread operator (també és destructuring)
            local_id: Date.now(),
            stats: statsUpdate
        });
        localStorage.setItem('oca_games', JSON.stringify(localGames.slice(-10)));
        console.log("📁 Juego guardado localmente (invitado)");
    }
}