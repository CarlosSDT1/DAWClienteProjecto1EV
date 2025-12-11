// game/specialCells/specialCells.js - LOGICA CORREGIDA
export function procesarCasillaEspecial(jugador, estado) {
    // Destructuring - per accedir directament a les propietats
    const { posicion, nombre, id } = jugador; // <-- DESTRUCTURING AFEGIT
    const { tablero, jugadoresInactivos } = estado; // <-- DESTRUCTURING AFEGIT
    
    console.log('Procesando casilla especial:', posicion);
    
    const casilla = tablero[posicion];
    
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
    // Destructuring del jugador
    const { nombre, posicion } = jugador; // <-- DESTRUCTURING AFEGIT
    const { tablero } = estado; // <-- DESTRUCTURING AFEGIT
    
    const nuevaPosOca = encontrarSiguienteOca(posicion, tablero);
    console.log('OCA: Moviendo de', posicion, 'a', nuevaPosOca);
    
    return {
        mantenerTurno: true,
        accion: () => {
            const mensaje = `${nombre}: ${especial.mensaje} ¡Tira otra vez!`;
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
    jugador.turnosInactivo = 1; // Pierde 1 turno
    jugador.tipoInactividad = 'posada';
    
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
    jugador.tipoInactividad = 'pozo';
    
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
    if (estado.jugadoresInactivos.size > 0) {
        const jugadorLiberado = Array.from(estado.jugadoresInactivos)[0];
        estado.jugadoresInactivos.delete(jugadorLiberado);
        
        // Limpiar propiedades
        const jugador = estado.jugadores[jugadorLiberado];
        delete jugador.tipoInactividad;
        delete jugador.turnosInactivo;
        
        const mensaje = `¡Has liberado a ${jugador.nombre} del pozo/cárcel!`;
        console.log('Liberación del pozo:', mensaje);
        return mensaje;
    }
    return "";
}

// Función para procesar inactividades - VERSIÓN CORREGIDA
export function procesarInactividades(estado, jugadorId) {
    // Destructuring de l'estat
    const { jugadores, jugadoresInactivos } = estado; // <-- DESTRUCTURING AFEGIT
    const jugador = jugadores[jugadorId];
    
    // Si el jugador no está inactivo, devolver false
    if (!jugadoresInactivos.has(jugadorId)) {
        return false;
    }
    
    // Verificar tipo de inactividad
    const tipoInactividad = jugador.tipoInactividad;
    
    console.log(`${jugador.nombre} está inactivo (${tipoInactividad})`);
    
    if (tipoInactividad === 'carcel' || tipoInactividad === 'posada') {
        // Para cárcel y posada: usar contador de turnos
        if (jugador.turnosInactivo === undefined) {
            // Si no hay contador, inicializarlo
            jugador.turnosInactivo = tipoInactividad === 'carcel' ? 2 : 1;
        }
        
        // Reducir contador
        jugador.turnosInactivo--;
        console.log(`Turnos restantes de ${jugador.nombre}: ${jugador.turnosInactivo}`);
        
        if (jugador.turnosInactivo <= 0) {
            // Terminar inactividad
            jugadoresInactivos.delete(jugadorId);
            delete jugador.tipoInactividad;
            delete jugador.turnosInactivo;
            console.log(`✅ ${jugador.nombre} ha terminado su inactividad de ${tipoInactividad}`);
            return false; // Ya no está inactivo
        }
        
        return true; // Sigue inactivo
    }
    
    // Para pozo: queda inactivo hasta que otro jugador lo libere
    if (tipoInactividad === 'pozo') {
        console.log(`${jugador.nombre} sigue en el pozo`);
        return true; // Sigue inactivo
    }
    
    return true; // Por defecto, sigue inactivo
}

// Función para verificar liberaciones del pozo
export function verificarLiberacionesDelPozo(estado) {
    const mensajes = [];
    const jugadoresInactivos = Array.from(estado.jugadoresInactivos);
    
    for (const jugadorId of jugadoresInactivos) {
        const jugador = estado.jugadores[jugadorId];
        
        // Solo verificar para pozo
        if (jugador.tipoInactividad === 'pozo') {
            // Verificar si algún jugador activo está en la misma casilla
            const jugadorEnMismaCasilla = Object.values(estado.jugadores).find(j => {
                return j.id !== jugadorId && 
                       j.posicion === jugador.posicion && 
                       !estado.jugadoresInactivos.has(j.id);
            });
            
            if (jugadorEnMismaCasilla) {
                // Liberar al jugador del pozo
                estado.jugadoresInactivos.delete(jugadorId);
                delete jugador.tipoInactividad;
                
                const mensaje = `🎉 ¡${jugadorEnMismaCasilla.nombre} ha liberado a ${jugador.nombre} del pozo!`;
                mensajes.push(mensaje);
                console.log(mensaje);
            }
        }
    }
    
    return mensajes;
}