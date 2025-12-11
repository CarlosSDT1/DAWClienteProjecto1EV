// game/specialCells/specialCells.js
export function procesarCasillaEspecial(jugador, estado) {
    console.log('Procesando casilla especial:', jugador.posicion);
    
    const casilla = estado.tablero[jugador.posicion];
    
    if (!casilla.especial) {
        console.log('No es casilla especial');
        return null;
    }
    
    const especial = casilla.especial;
    console.log('Casilla especial encontrada:', especial);
    
    switch (especial.tipo) {
        case "oca":
            console.log('Procesando OCA');
            return procesarOca(jugador, estado, especial);
        case "puente":
            console.log('Procesando PUENTE');
            return procesarPuente(jugador, estado, especial);
        case "posada":
            console.log('Procesando POSADA');
            return procesarPosada(jugador, estado, especial);
        case "pozo":
            console.log('Procesando POZO');
            return procesarPozo(jugador, estado, especial);
        case "carcel":
            console.log('Procesando CARCEL');
            return procesarCarcel(jugador, estado, especial);
        case "laberinto":
            console.log('Procesando LABERINTO');
            return procesarRetroceso(jugador, estado, especial);
        case "calavera":
            console.log('Procesando CALAVERA');
            return procesarRetroceso(jugador, estado, especial);
        case "meta":
            console.log('Procesando META - esto se maneja en otro lugar');
            return null;
        default:
            console.log('Tipo de casilla especial desconocido:', especial.tipo);
            return null;
    }
}

function procesarOca(jugador, estado, especial) {
    const nuevaPosOca = encontrarSiguienteOca(jugador.posicion, estado.tablero);
    console.log('OCA: Moviendo de', jugador.posicion, 'a', nuevaPosOca);
    
    return {
        mantenerTurno: true,
        accion: () => {
            const mensaje = `${jugador.nombre}: ${especial.mensaje} ¡Tira otra vez!`;
            jugador.posicion = nuevaPosOca;
            console.log('OCA ejecutada:', mensaje);
            return mensaje;
        }
    };
}

function encontrarSiguienteOca(posicionActual, tablero) {
    for (let i = posicionActual + 1; i <= 63; i++) {
        if (tablero[i].especial && tablero[i].especial.tipo === "oca") {
            console.log('Siguiente OCA encontrada en:', i);
            return i;
        }
    }
    console.log('No se encontró siguiente OCA, retornando 63');
    return 63;
}

function procesarPuente(jugador, estado, especial) {
    console.log('PUENTE: Moviendo de', jugador.posicion, 'a', especial.movimiento);
    
    return {
        mantenerTurno: true,
        accion: () => {
            const mensaje = `${jugador.nombre}: ${especial.mensaje} ¡Tira otra vez!`;
            jugador.posicion = especial.movimiento;
            console.log('PUENTE ejecutado:', mensaje);
            return mensaje;
        }
    };
}

function procesarPosada(jugador, estado, especial) {
    console.log('POSADA: Jugador pierde turno');
    
    return {
        mantenerTurno: false,
        accion: () => {
            const mensaje = `${jugador.nombre}: ${especial.mensaje}`;
            console.log('POSADA ejecutada:', mensaje);
            return mensaje;
        }
    };
}

function procesarPozo(jugador, estado, especial) {
    console.log('POZO: Jugador inactivo');
    estado.jugadoresInactivos.add(jugador.id);
    
    return {
        mantenerTurno: false,
        accion: () => {
            const mensaje = `${jugador.nombre}: ${especial.mensaje}`;
            console.log('POZO ejecutado:', mensaje);
            return mensaje;
        }
    };
}

function procesarCarcel(jugador, estado, especial) {
    console.log('CARCEL: Jugador inactivo por 2 turnos');
    estado.jugadoresInactivos.add(jugador.id);
    
    return {
        mantenerTurno: false,
        accion: () => {
            const mensaje = `${jugador.nombre}: ${especial.mensaje}`;
            console.log('CARCEL ejecutada:', mensaje);
            return mensaje;
        }
    };
}

function procesarRetroceso(jugador, estado, especial) {
    console.log('RETROCESO: Moviendo de', jugador.posicion, 'a', especial.movimiento);
    
    return {
        mantenerTurno: false,
        accion: () => {
            const mensaje = `${jugador.nombre}: ${especial.mensaje}`;
            jugador.posicion = especial.movimiento;
            console.log('RETROCESO ejecutado:', mensaje);
            return mensaje;
        }
    };
}

export function liberarDelPozo(estado) {
    if (estado.jugadoresInactivos.size > 0) {
        const jugadorLiberado = Array.from(estado.jugadoresInactivos)[0];
        estado.jugadoresInactivos.delete(jugadorLiberado);
        const mensaje = `¡Has liberado a ${estado.jugadores[jugadorLiberado].nombre} del pozo/cárcel!`;
        console.log('Liberación del pozo:', mensaje);
        return mensaje;
    }
    return "";
}