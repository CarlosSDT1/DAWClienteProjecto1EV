// game/specialCells/specialCells.js - CORREGIDO
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
    console.log('POSADA: Jugador pierde 1 turno');
    
    // Añadir contador de turnos de inactividad
    if (!jugador.turnosInactivo) {
        jugador.turnosInactivo = 0;
    }
    jugador.turnosInactivo = 1; // Pierde 1 turno
    
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
    console.log('POZO: Jugador inactivo hasta que otro lo libere');
    
    // Añadir al conjunto de jugadores inactivos
    estado.jugadoresInactivos.add(jugador.id);
    
    // Guardar tipo de inactividad
    if (!jugador.tipoInactividad) {
        jugador.tipoInactividad = 'pozo';
    }
    
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
    
    // Añadir al conjunto de jugadores inactivos
    estado.jugadoresInactivos.add(jugador.id);
    
    // Guardar tipo de inactividad y contador de turnos
    jugador.tipoInactividad = 'carcel';
    jugador.turnosInactivo = 2; // Debe perder 2 turnos
    
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
    // Verificar si hay algún jugador que cumpla condiciones para ser liberado
    let jugadorLiberado = null;
    
    for (const jugadorId of estado.jugadoresInactivos) {
        const jugador = estado.jugadores[jugadorId];
        
        // Si es pozo, se libera cuando otro jugador cae en su casilla
        if (jugador.tipoInactividad === 'pozo') {
            // Verificar si alguien está en la misma casilla
            const hayOtroEnMismaCasilla = Object.values(estado.jugadores).some(j => 
                j.id !== jugadorId && 
                j.posicion === jugador.posicion && 
                !estado.jugadoresInactivos.has(j.id)
            );
            
            if (hayOtroEnMismaCasilla) {
                jugadorLiberado = jugadorId;
                break;
            }
        }
        
        // Si es cárcel, se libera después de 2 turnos
        if (jugador.tipoInactividad === 'carcel') {
            if (jugador.turnosInactivo !== undefined) {
                jugador.turnosInactivo--;
                
                if (jugador.turnosInactivo <= 0) {
                    jugadorLiberado = jugadorId;
                    // Limpiar propiedades
                    delete jugador.tipoInactividad;
                    delete jugador.turnosInactivo;
                    break;
                }
            }
        }
        
        // Si es posada, se libera después de 1 turno
        if (jugador.tipoInactividad === 'posada') {
            if (jugador.turnosInactivo !== undefined) {
                jugador.turnosInactivo--;
                
                if (jugador.turnosInactivo <= 0) {
                    jugadorLiberado = jugadorId;
                    // Limpiar propiedades
                    delete jugador.tipoInactividad;
                    delete jugador.turnosInactivo;
                    break;
                }
            }
        }
    }
    
    if (jugadorLiberado) {
        estado.jugadoresInactivos.delete(jugadorLiberado);
        const jugador = estado.jugadores[jugadorLiberado];
        const mensaje = `¡${jugador.nombre} ha sido liberado ${jugador.tipoInactividad === 'carcel' ? 'de la cárcel' : jugador.tipoInactividad === 'pozo' ? 'del pozo' : 'de la posada'}!`;
        console.log('Liberación:', mensaje);
        
        // Limpiar propiedades
        delete jugador.tipoInactividad;
        delete jugador.turnosInactivo;
        
        return mensaje;
    }
    
    return "";
}

// Nueva función para procesar inactividades al inicio de cada turno
export function procesarInactividades(estado, jugadorId) {
    const jugador = estado.jugadores[jugadorId];
    
    if (estado.jugadoresInactivos.has(jugadorId)) {
        // Si el jugador está inactivo, no puede jugar este turno
        console.log(`⏸️ ${jugador.nombre} está inactivo, pierde el turno`);
        
        // Reducir contador si existe
        if (jugador.turnosInactivo !== undefined) {
            jugador.turnosInactivo--;
            console.log(`Turnos restantes inactivo: ${jugador.turnosInactivo}`);
            
            if (jugador.turnosInactivo <= 0) {
                // Se libera automáticamente
                estado.jugadoresInactivos.delete(jugadorId);
                delete jugador.tipoInactividad;
                delete jugador.turnosInactivo;
                console.log(`✅ ${jugador.nombre} ha completado su inactividad`);
            }
        }
        
        return true; // Jugador inactivo
    }
    
    return false; // Jugador activo
}

