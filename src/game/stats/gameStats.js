// game/stats/gameStats.js - CORREGIDO
import { getSession, saveGameState, updateUserStats } from "../../services/supaservice.js";

export function calcularPosicionesFinales(jugadores) {
    const jugadoresOrdenados = Object.values(jugadores)
        .sort((a, b) => {
            if (a.posicion === 63 && b.posicion !== 63) return -1;
            if (b.posicion === 63 && a.posicion !== 63) return 1;
            
            if (b.posicion !== a.posicion) {
                return b.posicion - a.posicion;
            } else {
                return a.turnos - b.turnos;
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
    
    const jugadoresOrdenados = Object.values(jugadores)
        .sort((a, b) => a.posicionFinal - b.posicionFinal);
    
    cuerpoTablaElement.innerHTML = '';
    
    jugadoresOrdenados.forEach((jugador) => {
        const fila = document.createElement('tr');
        let posicionTexto = '';
        let claseFila = '';
        let estadoJugador = '';
        
        switch (jugador.posicionFinal) {
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
                posicionTexto = `${jugador.posicionFinal}°`;
                claseFila = '';
                estadoJugador = '<span class="text-secondary">Participante</span>';
        }
        
        let infoExtra = '';
        if (jugador.posicion === 63) {
            infoExtra = `<br><small class="text-success">Llegó a la meta</small>`;
        } else {
            infoExtra = `<br><small class="text-muted">Casilla ${jugador.posicion}</small>`;
        }
        
        fila.className = claseFila;
        fila.innerHTML = `
            <td class="fw-bold">${posicionTexto}</td>
            <td>
                <span class="badge bg-${jugador.color}">${jugador.nombre}</span>
                ${infoExtra}
            </td>
            <td>${jugador.turnos}</td>
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
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    if (!userId && !isGuest) {
        console.log("No se guardan estadísticas: usuario no autenticado");
        return;
    }
    
    const ganador = Object.values(estado.jugadores).find(j => j.posicionFinal === 1);
    const totalTurnos = Object.values(estado.jugadores).reduce((sum, j) => sum + j.turnos, 0);
    
    const jugador1 = estado.jugadores[1];
    const ganoJugador1 = ganador && ganador.nombre === jugador1.nombre;
    
    const statsUpdate = {
        games_played: 1,
        games_won: ganoJugador1 ? 1 : 0,
        total_turns: totalTurnos,
        last_played: new Date().toISOString()
    };
    
    const gameData = {
        game_state: {
            jugadores: estado.jugadores,
            ganador: ganador?.nombre || 'Desconocido',
            jugadorActual: estado.jugadorActual,
            juegoActivo: false,
            jugadoresTerminados: estado.jugadoresTerminados,
            turnoActual: estado.turnoActual,
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
            ...gameData,
            local_id: Date.now(),
            stats: statsUpdate
        });
        localStorage.setItem('oca_games', JSON.stringify(localGames.slice(-10)));
        console.log("📁 Juego guardado localmente (invitado)");
    }
}