// game/state/gameState.js
import { crearTableroOca } from '../board/boardManager.js';

// Clave para guardar en localStorage
const STORAGE_KEY = 'oca_game_state';

export function createInitialState() {
    // Intentar cargar estado guardado AUTOMÁTICAMENTE
    const savedState = cargarEstadoGuardado();
    
    if (savedState) {
        return restaurarEstado(savedState);
    }
    
    // Crear nuevo estado si no hay guardado

    return {
        jugadorActual: 1,
        jugadores: crearJugadoresIniciales(),
        dadoTirado: false,
        valorDado: 0,
        juegoActivo: true,
        jugadoresInactivos: new Set(),
        jugadoresTerminados: 0,
        turnoActual: 1,
        tablero: crearTableroOca(),
        mantenerTurno: false,
        fechaCreacion: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
    };
}

// Función para guardar estado actual
export function guardarEstado(estado) {
    try {
        // Solo guardar datos esenciales
        const estadoParaGuardar = {
            jugadorActual: estado.jugadorActual,
            jugadores: estado.jugadores,
            dadoTirado: estado.dadoTirado,
            valorDado: estado.valorDado,
            juegoActivo: estado.juegoActivo,
            jugadoresInactivos: Array.from(estado.jugadoresInactivos),
            jugadoresTerminados: estado.jugadoresTerminados,
            turnoActual: estado.turnoActual,
            mantenerTurno: estado.mantenerTurno,
            fechaGuardado: new Date().toISOString(),
            version: '1.0'
        };
        
        // Guardar en localStorage (persistente)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoParaGuardar));
        return true;
    } catch (error) {
        console.error('Error guardando estado:', error);
        return false;
    }
}

// Función para cargar estado guardado
function cargarEstadoGuardado() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Verificar si el estado es válido
            const fechaGuardado = new Date(parsedState.fechaGuardado);
            const ahora = new Date();
            const horasDiferencia = (ahora - fechaGuardado) / (1000 * 60 * 60);
            
            // Si el estado tiene más de 24 horas, ignorarlo
            if (horasDiferencia > 24) {
                limpiarEstadoGuardado();
                return null;
            }
            
            // Verificar que tenga la estructura básica
            if (!parsedState.jugadores || !parsedState.jugadorActual) {
                limpiarEstadoGuardado();
                return null;
            }
            
            return parsedState;
        }
    } catch (error) {
        console.error('Error cargando estado guardado:', error);
        limpiarEstadoGuardado();
    }
    
    return null;
}

// Restaurar estado desde JSON
function restaurarEstado(savedState) {
    // Convertir Array de jugadoresInactivos de nuevo a Set
    const estadoRestaurado = {
        ...savedState,
        jugadoresInactivos: new Set(savedState.jugadoresInactivos || []),
        tablero: crearTableroOca(), // Recrear tablero siempre
        ultimaActualizacion: new Date().toISOString()
    };
    
    // Asegurar que todos los jugadores tengan todas las propiedades
    Object.keys(estadoRestaurado.jugadores).forEach(id => {
        const jugador = estadoRestaurado.jugadores[id];
        if (!jugador.dadosAcumulados) jugador.dadosAcumulados = 1;
        if (!jugador.color) jugador.color = id === '1' ? 'primary' : id === '2' ? 'danger' : id === '3' ? 'success' : 'warning';
        if (jugador.terminado === undefined) jugador.terminado = false;
        if (jugador.posicionFinal === undefined) jugador.posicionFinal = 0;
        if (jugador.pasoUltimoTurno === undefined) jugador.pasoUltimoTurno = false;
    });
    
    return estadoRestaurado;
}

// Limpiar estado guardado
export function limpiarEstadoGuardado() {
    localStorage.removeItem(STORAGE_KEY);
}

// Verificar si hay partida en curso
export function hayPartidaEnCurso() {
    return !!localStorage.getItem(STORAGE_KEY);
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