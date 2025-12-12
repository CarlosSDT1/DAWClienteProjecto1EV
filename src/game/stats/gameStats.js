// game/stats/gameStats.js - CORREGIDO
import { getSession, saveGameState, updateUserStats } from "../../services/supaservice.js";

export function calcularPosicionesFinales(jugadores) {
    const jugadoresArray = Object.values(jugadores);
    const jugadoresOrdenados = jugadoresArray
        .sort((a, b) => {
            const { posicion: posA, turnos: turnosA } = a;
            const { posicion: posB, turnos: turnosB } = b;
            
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
    
    const jugadoresArray = Object.values(jugadores);
    const jugadoresOrdenados = jugadoresArray
        .sort((a, b) => a.posicionFinal - b.posicionFinal);
    
    cuerpoTablaElement.innerHTML = '';
    
    jugadoresOrdenados.forEach((jugador) => {
        const { posicionFinal, nombre, color, posicion, turnos } = jugador;
        
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

// game/stats/gameStats.js - ELIMINAR TOTAL_TURNS
export function guardarEstadisticasJuego(estado) {
  const userId = getSession();
  const isGuest = localStorage.getItem('guestMode') === 'true';
  
  if (!userId && !isGuest) {
    console.log("No se guardan estadísticas: usuario no autenticado");
    return;
  }
  
  const jugadoresArray = Object.values(estado.jugadores);
  const ganador = jugadoresArray.find(j => j.posicionFinal === 1);
  
  const userWon = ganador && ganador.nombre === 'Jugador 1';
  
  const gameData = {
    game_state: {
      jugadores: estado.jugadores,
      ganador: ganador?.nombre || 'Desconocido',
      fecha: new Date().toISOString(),
      user_won: userWon
    },
    user_won: userWon
  };
  
  if (userId) {
    saveGameState(gameData).then(result => {
      console.log("Partida guardada en Supabase");
      
      // Actualizar estadísticas
      updateUserStats({
        games_played: 1,
        games_won: userWon ? 1 : 0,
        total_turns: 0  // ← Ya no usamos total_turns
      }).then(() => {
        console.log("Estadísticas actualizadas");
      }).catch(error => {
        console.log("Error actualizando stats:", error);
      });
    }).catch(error => {
      console.log("Error guardando:", error);
    });
  } else if (isGuest) {
    const localGames = JSON.parse(localStorage.getItem('oca_games') || '[]');
    gameData.local_id = Date.now();
    gameData.created_at = new Date().toISOString();
    localGames.push(gameData);
    
    if (localGames.length > 20) {
      localStorage.setItem('oca_games', JSON.stringify(localGames.slice(-20)));
    } else {
      localStorage.setItem('oca_games', JSON.stringify(localGames));
    }
    console.log("Partida guardada localmente");
  }
}