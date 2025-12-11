// game/state/gameState.js
import { crearTableroOca } from '../board/boardManager.js';

export function createInitialState() {
    return {
        jugadorActual: 1,
        jugadores: crearJugadoresIniciales(),
        dadoTirado: false,
        valorDado: 0,
        juegoActivo: true,
        jugadoresInactivos: new Set(),
        jugadoresTerminados: 0,
        turnoActual: 1,
        tablero: crearTableroOca(), // ← Ahora está importada
        mantenerTurno: false
    };
}

function crearJugadoresIniciales() {
    return {
        1: crearJugador(1, "Jugador 1", "primary"),
        2: crearJugador(2, "Jugador 2", "danger"),
        3: crearJugador(3, "Jugador 3", "success"),
        4: crearJugador(4, "Jugador 4", "warning")
    };
}

function crearJugador(id, nombre, color) {
    return {
        id: id,
        nombre: nombre,
        posicion: 0,
        color: color,
        dadosAcumulados: 1,
        pasoUltimoTurno: false,
        terminado: false,
        posicionFinal: 0,
        turnos: 0
    };
}