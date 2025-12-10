import { getSession, saveGameState, updateUserStats } from "../services/supaservice.js";
export function iniciarJuego() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container mt-4">
            <h1 class="text-center mb-4">Juego de la Oca</h1>
            
            <div class="text-center mb-3">
                <div id="info-turno" class="h4 mb-3">
                    <span class="badge bg-primary fs-5 p-3">
                        Turno actual: <span id="jugador-actual">Jugador 1</span>
                        <span id="info-dados-turno" class="ms-2"></span>
                    </span>
                </div>
                <div id="dado-resultado" class="h5 text-warning mb-2"></div>
                <div id="mensaje-especial" class="h6 text-info"></div>
                <div id="info-carrera" class="small text-muted mt-2"></div>
            </div>

            <div class="row justify-content-center">
                <div class="col-md-10">
                    <div id="tablero" class="oca-board mx-auto"></div>
                </div>
            </div>

            <div class="text-center mt-4">
                <button id="tirar-dado" class="btn btn-success btn-lg me-2">Tirar Dado</button>
                <button id="pasar-turno" class="btn btn-info btn-lg me-2">Pasar Turno</button>
                <button id="reiniciar" class="btn btn-primary btn-lg">Nuevo Juego</button>
            </div>

            <div class="row mt-4">
                <div class="col-md-3">
                    <div class="player-info bg-primary text-white p-3 rounded">
                        <h5>Jugador 1</h5>
                        <div>Posición: <span id="pos-jugador1">0</span></div>
                        <div>Dados: <span id="dados-jugador1">1</span></div>
                        <div class="estado-jugador" id="estado-jugador1"></div>
                        <div class="ficha ficha-jugador1 mt-2"></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="player-info bg-danger text-white p-3 rounded">
                        <h5>Jugador 2</h5>
                        <div>Posición: <span id="pos-jugador2">0</span></div>
                        <div>Dados: <span id="dados-jugador2">1</span></div>
                        <div class="estado-jugador" id="estado-jugador2"></div>
                        <div class="ficha ficha-jugador2 mt-2"></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="player-info bg-success text-white p-3 rounded">
                        <h5>Jugador 3</h5>
                        <div>Posición: <span id="pos-jugador3">0</span></div>
                        <div>Dados: <span id="dados-jugador3">1</span></div>
                        <div class="estado-jugador" id="estado-jugador3"></div>
                        <div class="ficha ficha-jugador3 mt-2"></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="player-info bg-warning text-dark p-3 rounded">
                        <h5>Jugador 4</h5>
                        <div>Posición: <span id="pos-jugador4">0</span></div>
                        <div>Dados: <span id="dados-jugador4">1</span></div>
                        <div class="estado-jugador" id="estado-jugador4"></div>
                        <div class="ficha ficha-jugador4 mt-2"></div>
                    </div>
                </div>
            </div>

            <!-- Tabla de posiciones finales -->
            <div id="tabla-posiciones" class="mt-4" style="display: none;">
                <h3 class="text-center mb-3">🏆 Resultados Finales</h3>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Posición</th>
                                <th>Jugador</th>
                                <th>Turnos</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla-posiciones">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Estado del juego
    const estado = {
        jugadorActual: 1,
        jugadores: {
            1: { 
                posicion: 0, 
                nombre: "Jugador 1", 
                color: "primary",
                dadosAcumulados: 1,
                pasoUltimoTurno: false,
                terminado: false,
                posicionFinal: 0,
                turnos: 0
            },
            2: { 
                posicion: 0, 
                nombre: "Jugador 2", 
                color: "danger",
                dadosAcumulados: 1,
                pasoUltimoTurno: false,
                terminado: false,
                posicionFinal: 0,
                turnos: 0
            },
            3: { 
                posicion: 0, 
                nombre: "Jugador 3", 
                color: "success",
                dadosAcumulados: 1,
                pasoUltimoTurno: false,
                terminado: false,
                posicionFinal: 0,
                turnos: 0
            },
            4: { 
                posicion: 0, 
                nombre: "Jugador 4", 
                color: "warning",
                dadosAcumulados: 1,
                pasoUltimoTurno: false,
                terminado: false,
                posicionFinal: 0,
                turnos: 0
            }
        },
        dadoTirado: false,
        valorDado: 0,
        juegoActivo: true,
        jugadoresInactivos: new Set(),
        jugadoresTerminados: 0,
        turnoActual: 1,
        tablero: crearTableroOca(),
        mantenerTurno: false
    };

    const tableroElement = document.getElementById('tablero');
    const infoTurnoElement = document.getElementById('info-turno');
    const jugadorActualElement = document.getElementById('jugador-actual');
    const infoDadosTurnoElement = document.getElementById('info-dados-turno');
    const dadoResultadoElement = document.getElementById('dado-resultado');
    const mensajeEspecialElement = document.getElementById('mensaje-especial');
    const infoCarreraElement = document.getElementById('info-carrera');
    const tirarDadoBtn = document.getElementById('tirar-dado');
    const pasarTurnoBtn = document.getElementById('pasar-turno');
    const reiniciarBtn = document.getElementById('reiniciar');
    const tablaPosicionesElement = document.getElementById('tabla-posiciones');
    const cuerpoTablaElement = document.getElementById('cuerpo-tabla-posiciones');

    // Crear tablero de la Oca (63 casillas)
    function crearTableroOca() {
        const tablero = [];
        
        const casillasEspeciales = {
            5: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            9: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            14: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            18: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            23: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            27: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            32: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            36: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            41: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            45: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            50: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            54: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            59: { tipo: "oca", mensaje: "De oca a oca y tiro porque me toca", movimiento: "avanzar" },
            
            6: { tipo: "puente", mensaje: "De puente a puente y tiro porque me lleva la corriente", movimiento: 12 },
            12: { tipo: "puente", mensaje: "De puente a puente y tiro porque me lleva la corriente", movimiento: 6 },
            
            19: { tipo: "posada", mensaje: "En la posada te quedas 1 turno", movimiento: "perderTurno" },
            
            31: { tipo: "pozo", mensaje: "Al pozo caíste, hasta que otro jugador pase", movimiento: "pozo" },
            52: { tipo: "carcel", mensaje: "A la cárcel caíste, pierdes 2 turnos", movimiento: "carcel" },
            
            42: { tipo: "laberinto", mensaje: "En el laberinto te pierdes, retrocedes a la casilla 30", movimiento: 30 },
            
            58: { tipo: "calavera", mensaje: "En la calavera mueres, vuelves al inicio", movimiento: 0 },
            
            63: { tipo: "meta", mensaje: "¡Has ganado!", movimiento: "ganar" }
        };

        for (let i = 0; i <= 63; i++) {
            tablero[i] = {
                numero: i,
                especial: casillasEspeciales[i] || null
            };
        }

        return tablero;
    }

    function dibujarTablero() {
        tableroElement.innerHTML = '';
        tableroElement.className = 'oca-board mx-auto';
        
        // Crear tablero en forma de serpiente (8x8)
        for (let fila = 0; fila < 8; fila++) {
            for (let columna = 0; columna < 8; columna++) {
                let numeroCasilla;
                
                // Calcular número de casilla en forma de serpiente
                if (fila % 2 === 0) {
                    // Filas pares: izquierda a derecha (0, 1, 2, 3...)
                    numeroCasilla = fila * 8 + columna;
                } else {
                    // Filas impares: derecha a izquierda (15, 14, 13, 12...)
                    numeroCasilla = (fila + 1) * 8 - 1 - columna;
                }
                
                // Solo crear casillas del 1 al 63 (la 0 es la salida)
                if (numeroCasilla > 0 && numeroCasilla <= 63) {
                    const casilla = document.createElement('div');
                    casilla.className = `casilla casilla-${numeroCasilla} ${estado.tablero[numeroCasilla].especial ? 'casilla-especial ' + estado.tablero[numeroCasilla].especial.tipo : ''}`;
                    casilla.dataset.numero = numeroCasilla;
                    casilla.style.gridRow = fila + 1;
                    casilla.style.gridColumn = columna + 1;
                    
                    const numero = document.createElement('div');
                    numero.className = 'numero-casilla';
                    numero.textContent = numeroCasilla;
                    casilla.appendChild(numero);
                    
                    const fichasContainer = document.createElement('div');
                    fichasContainer.className = 'fichas-container';
                    
                    Object.keys(estado.jugadores).forEach(jugadorId => {
                        if (estado.jugadores[jugadorId].posicion === numeroCasilla) {
                            const ficha = document.createElement('div');
                            ficha.className = `ficha ficha-jugador${jugadorId} ${estado.jugadores[jugadorId].terminado ? 'terminado' : ''}`;
                            ficha.title = estado.jugadores[jugadorId].nombre + (estado.jugadores[jugadorId].terminado ? ' (Terminado)' : '');
                            fichasContainer.appendChild(ficha);
                        }
                    });
                    
                    casilla.appendChild(fichasContainer);
                    
                    if (estado.tablero[numeroCasilla].especial) {
                        const icono = document.createElement('div');
                        icono.className = 'icono-especial';
                        icono.innerHTML = obtenerIconoEspecial(estado.tablero[numeroCasilla].especial.tipo);
                        casilla.appendChild(icono);
                    }
                    
                    tableroElement.appendChild(casilla);
                } else if (numeroCasilla === 0) {
                    // Casilla de salida (posición 0)
                    const casilla = document.createElement('div');
                    casilla.className = 'casilla casilla-salida';
                    casilla.dataset.numero = 0;
                    casilla.style.gridRow = fila + 1;
                    casilla.style.gridColumn = columna + 1;
                    
                    const numero = document.createElement('div');
                    numero.className = 'numero-casilla';
                    numero.textContent = 'Salida';
                    casilla.appendChild(numero);
                    
                    const fichasContainer = document.createElement('div');
                    fichasContainer.className = 'fichas-container';
                    
                    Object.keys(estado.jugadores).forEach(jugadorId => {
                        if (estado.jugadores[jugadorId].posicion === 0) {
                            const ficha = document.createElement('div');
                            ficha.className = `ficha ficha-jugador${jugadorId}`;
                            ficha.title = estado.jugadores[jugadorId].nombre;
                            fichasContainer.appendChild(ficha);
                        }
                    });
                    
                    casilla.appendChild(fichasContainer);
                    tableroElement.appendChild(casilla);
                }
            }
        }
        
        actualizarPosiciones();
        actualizarEstadosJugadores();
        actualizarInfoTurno();
        actualizarInfoCarrera();
    }

    function obtenerIconoEspecial(tipo) {
        const iconos = {
            "oca": "🪿",
            "puente": "🌉",
            "posada": "🏨",
            "pozo": "🕳️",
            "laberinto": "🌀",
            "carcel": "🚓",
            "calavera": "💀",
            "meta": "🏁"
        };
        return iconos[tipo] || "⭐";
    }

    function actualizarInfoTurno() {
        const jugador = estado.jugadores[estado.jugadorActual];
        
        if (jugador.terminado) {
            siguienteTurno();
            return;
        }
        
        jugadorActualElement.textContent = jugador.nombre;
        
        const badge = infoTurnoElement.querySelector('.badge');
        badge.className = `badge bg-${jugador.color} fs-5 p-3`;
        
        if (jugador.dadosAcumulados > 1) {
            infoDadosTurnoElement.textContent = `(Tirará ${jugador.dadosAcumulados} dados)`;
            infoDadosTurnoElement.className = 'text-warning fw-bold';
        } else {
            infoDadosTurnoElement.textContent = '';
            infoDadosTurnoElement.className = '';
        }
        
        dadoResultadoElement.textContent = '';
        mensajeEspecialElement.textContent = 'Es tu turno. ¡Tira el dado o pasa turno para acumular más dados!';
        mensajeEspecialElement.className = 'h6 text-success';
    }

    function actualizarInfoCarrera() {
    const terminados = estado.jugadoresTerminados;
    const totalJugadores = Object.keys(estado.jugadores).length;
    
    if (terminados > 0) {
        const ganador = Object.values(estado.jugadores).find(j => j.posicionFinal === 1);
        if (ganador) {
            infoCarreraElement.innerHTML = `
                <div class="alert alert-success py-2 mb-0">
                    <span class="fw-bold">🏆 ¡${ganador.nombre} ganó la partida!</span>
                    <button class="btn btn-sm btn-outline-light ms-2" onclick="document.getElementById('tabla-posiciones').scrollIntoView()">
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

    function tirarDado() {
    // Verificar si el juego ha terminado
    if (!estado.juegoActivo) {
        mensajeEspecialElement.textContent = "❌ El juego ha terminado. Haz clic en 'Nuevo Juego' para jugar otra vez.";
        mensajeEspecialElement.className = 'h6 text-danger';
        return;
    }
    
    if (estado.dadoTirado) return;

    const jugador = estado.jugadores[estado.jugadorActual];
    
    // Verificar si el jugador está terminado
    if (jugador.terminado) {
        mensajeEspecialElement.textContent = `⚠️ ${jugador.nombre} ya terminó el juego.`;
        mensajeEspecialElement.className = 'h6 text-warning';
        return;
    }
    
    // Verificar si el jugador está inactivo (en pozo/cárcel)
    if (estado.jugadoresInactivos.has(estado.jugadorActual)) {
        mensajeEspecialElement.textContent = `⏸️ ${jugador.nombre} está inactivo (en pozo/cárcel).`;
        mensajeEspecialElement.className = 'h6 text-secondary';
        siguienteTurno();
        return;
    }

    // Resetear estados al inicio del turno
    estado.mantenerTurno = false;
    
    const numDados = jugador.dadosAcumulados;
    jugador.turnos++;
    
    let totalDado = 0;
    const resultados = [];
    
    // Tirar los dados
    for (let i = 0; i < numDados; i++) {
        const dado = Math.floor(Math.random() * 6) + 1;
        resultados.push(dado);
        totalDado += dado;
    }
    
    estado.valorDado = totalDado;
    estado.dadoTirado = true;
    
    // Mostrar resultado de los dados
    if (numDados === 1) {
        dadoResultadoElement.textContent = `🎲 ${jugador.nombre} ha sacado un ${estado.valorDado}`;
        dadoResultadoElement.className = 'h5 text-primary fw-bold';
    } else {
        dadoResultadoElement.textContent = `🎲 ${jugador.nombre} ha sacado ${resultados.join(' + ')} = ${estado.valorDado}`;
        dadoResultadoElement.className = 'h5 text-primary fw-bold';
    }
    
    mensajeEspecialElement.textContent = `Avanzando ${estado.valorDado} casillas...`;
    mensajeEspecialElement.className = 'h6 text-primary';
    
    // Resetear dados acumulados
    jugador.dadosAcumulados = 1;
    
    // Actualizar información del jugador
    document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = jugador.dadosAcumulados;
    
    // Deshabilitar botones durante el movimiento
    tirarDadoBtn.disabled = true;
    pasarTurnoBtn.disabled = true;
    
    // Mover al jugador después de un breve delay
    setTimeout(moverJugador, 1500);
}

    function pasarTurno() {
    // Verificar si el juego ha terminado
    if (!estado.juegoActivo) {
        mensajeEspecialElement.textContent = "❌ El juego ha terminado. Haz clic en 'Nuevo Juego' para jugar otra vez.";
        mensajeEspecialElement.className = 'h6 text-danger';
        return;
    }
    
    if (estado.dadoTirado) return;

    const jugador = estado.jugadores[estado.jugadorActual];
    
    // Verificar si el jugador está terminado
    if (jugador.terminado) {
        mensajeEspecialElement.textContent = `⚠️ ${jugador.nombre} ya terminó el juego.`;
        mensajeEspecialElement.className = 'h6 text-warning';
        siguienteTurno();
        return;
    }
    
    // Verificar si el jugador está inactivo (en pozo/cárcel)
    if (estado.jugadoresInactivos.has(estado.jugadorActual)) {
        mensajeEspecialElement.textContent = `⏸️ ${jugador.nombre} está inactivo (en pozo/cárcel). Pierde este turno.`;
        mensajeEspecialElement.className = 'h6 text-secondary';
        
        jugador.turnos++;
        jugador.dadosAcumulados = 1;
        document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = 1;
        
        // Si está en la cárcel, verificar si ya cumplió los 2 turnos
        if (jugador.posicion === 52) { // Casilla de cárcel
            // Verificar cuántos turnos lleva inactivo
            let turnosInactivo = 0;
            for (let i = 1; i <= 4; i++) {
                if (estado.jugadoresInactivos.has(i) && estado.jugadores[i].posicion === 52) {
                    turnosInactivo++;
                }
            }
            
            if (turnosInactivo >= 2) {
                estado.jugadoresInactivos.delete(estado.jugadorActual);
                mensajeEspecialElement.textContent = `✅ ${jugador.nombre} ha cumplido su condena en la cárcel y está libre.`;
            }
        }
        
        setTimeout(() => {
            estado.dadoTirado = false;
            siguienteTurno();
        }, 2000);
        return;
    }

    jugador.turnos++;
    
    // Acumular dados (máximo 3)
    if (jugador.dadosAcumulados < 3) {
        jugador.dadosAcumulados++;
        
        dadoResultadoElement.textContent = `⏭️ ${jugador.nombre} pasa el turno`;
        dadoResultadoElement.className = 'h5 text-info';
        
        mensajeEspecialElement.textContent = `¡Estrategia! Próximo turno tirarás ${jugador.dadosAcumulados} dados`;
        mensajeEspecialElement.className = 'h6 text-info fw-bold';
        
        // Actualizar información del jugador
        document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = jugador.dadosAcumulados;
        
        // Deshabilitar botones temporalmente
        tirarDadoBtn.disabled = true;
        pasarTurnoBtn.disabled = true;
        
        setTimeout(() => {
            estado.dadoTirado = false;
            siguienteTurno();
            tirarDadoBtn.disabled = false;
            pasarTurnoBtn.disabled = false;
        }, 2000);
    } else {
        // Ya tiene el máximo de dados acumulados
        dadoResultadoElement.textContent = `🎲 ${jugador.nombre} ya tiene el máximo de dados (3)`;
        dadoResultadoElement.className = 'h5 text-warning';
        
        mensajeEspecialElement.textContent = "¡Ya tienes el máximo de dados acumulados (3)! Tira el dado para jugar.";
        mensajeEspecialElement.className = 'h6 text-warning';
        
        // Forzar a tirar el dado
        setTimeout(() => {
            dadoResultadoElement.textContent = "";
            mensajeEspecialElement.textContent = "¡Es tu turno! Tira el dado.";
            mensajeEspecialElement.className = 'h6 text-success';
        }, 3000);
    }
}

    function moverJugador() {
        const jugador = estado.jugadores[estado.jugadorActual];
        const nuevaPosicion = jugador.posicion + estado.valorDado;
        
        if (nuevaPosicion > 63) {
            const exceso = nuevaPosicion - 63;
            jugador.posicion = 63 - exceso;
            mensajeEspecialElement.textContent = "¡Te pasaste de la meta! Retrocedes las casillas sobrantes.";
            procesarDespuesDeMovimiento(jugador);
        } else {
            animarMovimiento(jugador, jugador.posicion, nuevaPosicion, () => {
                jugador.posicion = nuevaPosicion;
                procesarDespuesDeMovimiento(jugador);
            });
        }
    }

    function animarMovimiento(jugador, desde, hasta, callback) {
        const pasos = Math.abs(hasta - desde);
        const direccion = hasta > desde ? 1 : -1;
        let pasoActual = 0;
        
        tirarDadoBtn.disabled = true;
        pasarTurnoBtn.disabled = true;
        
        function siguientePaso() {
            if (pasoActual <= pasos) {
                const posicionIntermedia = desde + (pasoActual * direccion);
                actualizarPosicionVisual(jugador, posicionIntermedia);
                pasoActual++;
                setTimeout(siguientePaso, pasos > 10 ? 100 : 200);
            } else {
                tirarDadoBtn.disabled = false;
                pasarTurnoBtn.disabled = false;
                callback();
            }
        }
        
        siguientePaso();
    }

    function actualizarPosicionVisual(jugador, posicionTemporal) {
        const estadoTemporal = {
            ...estado,
            jugadores: {
                ...estado.jugadores,
                [estado.jugadorActual]: {
                    ...jugador,
                    posicion: posicionTemporal
                }
            }
        };
        
        dibujarTableroTemporal(estadoTemporal);
    }

    function dibujarTableroTemporal(estadoTemp) {
        const tableroElement = document.getElementById('tablero');
        tableroElement.innerHTML = '';
        tableroElement.className = 'oca-board mx-auto';
        
        for (let fila = 0; fila < 8; fila++) {
            for (let columna = 0; columna < 8; columna++) {
                let numeroCasilla;
                
                if (fila % 2 === 0) {
                    numeroCasilla = fila * 8 + columna;
                } else {
                    numeroCasilla = (fila + 1) * 8 - 1 - columna;
                }
                
                if (numeroCasilla > 0 && numeroCasilla <= 63) {
                    const casilla = document.createElement('div');
                    casilla.className = `casilla casilla-${numeroCasilla} ${estadoTemp.tablero[numeroCasilla].especial ? 'casilla-especial ' + estadoTemp.tablero[numeroCasilla].especial.tipo : ''} ${numeroCasilla === estadoTemp.jugadores[estadoTemp.jugadorActual].posicion ? 'actual' : ''}`;
                    casilla.dataset.numero = numeroCasilla;
                    casilla.style.gridRow = fila + 1;
                    casilla.style.gridColumn = columna + 1;
                    
                    const numero = document.createElement('div');
                    numero.className = 'numero-casilla';
                    numero.textContent = numeroCasilla;
                    casilla.appendChild(numero);
                    
                    const fichasContainer = document.createElement('div');
                    fichasContainer.className = 'fichas-container';
                    
                    Object.keys(estadoTemp.jugadores).forEach(jugadorId => {
                        if (estadoTemp.jugadores[jugadorId].posicion === numeroCasilla) {
                            const ficha = document.createElement('div');
                            ficha.className = `ficha ficha-jugador${jugadorId} ${estadoTemp.jugadores[jugadorId].terminado ? 'terminado' : ''} ${parseInt(jugadorId) === estadoTemp.jugadorActual ? 'animando' : ''}`;
                            ficha.title = estadoTemp.jugadores[jugadorId].nombre + (estadoTemp.jugadores[jugadorId].terminado ? ' (Terminado)' : '');
                            fichasContainer.appendChild(ficha);
                        }
                    });
                    
                    casilla.appendChild(fichasContainer);
                    
                    if (estadoTemp.tablero[numeroCasilla].especial) {
                        const icono = document.createElement('div');
                        icono.className = 'icono-especial';
                        icono.innerHTML = obtenerIconoEspecial(estadoTemp.tablero[numeroCasilla].especial.tipo);
                        casilla.appendChild(icono);
                    }
                    
                    tableroElement.appendChild(casilla);
                } else if (numeroCasilla === 0) {
                    const casilla = document.createElement('div');
                    casilla.className = `casilla casilla-salida ${numeroCasilla === estadoTemp.jugadores[estadoTemp.jugadorActual].posicion ? 'actual' : ''}`;
                    casilla.dataset.numero = 0;
                    casilla.style.gridRow = fila + 1;
                    casilla.style.gridColumn = columna + 1;
                    
                    const numero = document.createElement('div');
                    numero.className = 'numero-casilla';
                    numero.textContent = 'Salida';
                    casilla.appendChild(numero);
                    
                    const fichasContainer = document.createElement('div');
                    fichasContainer.className = 'fichas-container';
                    
                    Object.keys(estadoTemp.jugadores).forEach(jugadorId => {
                        if (estadoTemp.jugadores[jugadorId].posicion === 0) {
                            const ficha = document.createElement('div');
                            ficha.className = `ficha ficha-jugador${jugadorId} ${parseInt(jugadorId) === estadoTemp.jugadorActual ? 'animando' : ''}`;
                            ficha.title = estadoTemp.jugadores[jugadorId].nombre;
                            fichasContainer.appendChild(ficha);
                        }
                    });
                    
                    casilla.appendChild(fichasContainer);
                    tableroElement.appendChild(casilla);
                }
            }
        }
    }

   function procesarDespuesDeMovimiento(jugador) {
    // Verificar si llegó a la meta
    if (jugador.posicion === 63 && !jugador.terminado) {
        jugador.terminado = true;
        jugador.posicionFinal = 1; // Temporalmente, luego se recalcula
        
        mensajeEspecialElement.textContent = `🎉 ¡${jugador.nombre} ha llegado a la meta!`;
        mensajeEspecialElement.className = 'h6 text-success fw-bold';
        
        // MODIFICACIÓN: Terminar el juego inmediatamente cuando CUALQUIER jugador llegue a la meta
        // Calcular posiciones finales de todos los jugadores
        calcularPosicionesFinales();
        
        // Mostrar mensaje de victoria
        const ganador = Object.values(estado.jugadores).find(j => j.posicionFinal === 1);
        infoTurnoElement.innerHTML = `
            <div class="alert alert-success text-center">
                <h3 class="mb-3">🏆 ¡${ganador.nombre} ha ganado la partida! 🏆</h3>
                <p class="mb-0">${ganador.nombre} llegó a la meta en ${ganador.turnos} turnos.</p>
            </div>
        `;
        
        // Terminar el juego inmediatamente
        finalizarJuego();
        return;
    }
    
    // Si el juego sigue activo, continuar normal
    if (estado.juegoActivo) {
        // Verificar casilla especial
        verificarCasillaEspecial(jugador);
        
        // Si después de verificar la casilla especial NO tenemos turno extra,
        // entonces continuar con el flujo normal
        if (!estado.mantenerTurno) {
            estado.dadoTirado = false;
            dibujarTablero();
            
            // Rehabilitar botones
            tirarDadoBtn.disabled = false;
            pasarTurnoBtn.disabled = false;
            
            setTimeout(siguienteTurno, 1500);
        }
    }
}

    function siguienteTurno() {
    // Si el juego terminó, no cambiar turno
    if (!estado.juegoActivo) {
        return;
    }
    
    let siguienteJugador = estado.jugadorActual;
    let intentos = 0;
    
    do {
        siguienteJugador = siguienteJugador % 4 + 1;
        intentos++;
        
        // Si todos están terminados, algo anda mal
        if (intentos > 8) {
            console.warn("No se encontró jugador disponible");
            break;
        }
    } while (estado.jugadores[siguienteJugador].terminado || 
             estado.jugadoresInactivos.has(siguienteJugador));
    
    estado.jugadorActual = siguienteJugador;
    actualizarInfoTurno();
    dibujarTablero();
}

    function verificarCasillaEspecial(jugador) {
        const casilla = estado.tablero[jugador.posicion];
        
        if (!casilla.especial) return;
        
        const especial = casilla.especial;
        
        switch (especial.tipo) {
            case "oca":
    const nuevaPosOca = encontrarSiguienteOca(jugador.posicion);
    if (nuevaPosOca !== jugador.posicion) {
        mensajeEspecialElement.textContent = `${jugador.nombre}: ${especial.mensaje}`;
        mensajeEspecialElement.className = 'h6 text-warning';
        
        // ⚠️ Avisar antes del setTimeout
        estado.mantenerTurno = true;

        tirarDadoBtn.disabled = true;
        pasarTurnoBtn.disabled = true;
        
        setTimeout(() => {
            jugador.posicion = nuevaPosOca;
            dibujarTablero();
            
            estado.dadoTirado = false; // puede tirar otra vez

            tirarDadoBtn.disabled = false;
            pasarTurnoBtn.disabled = false;

            mensajeEspecialElement.textContent += " ¡Tira otra vez!";
            actualizarInfoTurno();

            if (estado.jugadoresInactivos.size > 0) {
                liberarDelPozo();
            }
        }, 1000);

        return; // evitar que siga el flujo normal
    }
    break;

                
            case "puente":
    mensajeEspecialElement.textContent = `${jugador.nombre}: ${especial.mensaje}`;
    mensajeEspecialElement.className = 'h6 text-warning';
    
    // Avisar antes del setTimeout
    estado.mantenerTurno = true;

    tirarDadoBtn.disabled = true;
    pasarTurnoBtn.disabled = true;
    
    setTimeout(() => {
        jugador.posicion = especial.movimiento;
        dibujarTablero();
        
        // Permitir tirar de nuevo inmediatamente
        estado.dadoTirado = false;
        
        // Habilitar botones y mostrar mensaje
        tirarDadoBtn.disabled = false;
        pasarTurnoBtn.disabled = false;
        
        mensajeEspecialElement.textContent += " ¡Tira otra vez!";
        actualizarInfoTurno();
        
        if (estado.jugadoresInactivos.size > 0) {
            liberarDelPozo();
        }
    }, 1000);
    
    return; // Salir para evitar que avance el turno
                
            case "posada":
                // No hacer nada especial, el jugador pierde el turno automáticamente
                break;
                
            case "pozo":
                estado.jugadoresInactivos.add(estado.jugadorActual);
                break;
                
            case "carcel":
                estado.jugadoresInactivos.add(estado.jugadorActual);
                break;
                
            case "laberinto":
            case "calavera":
                // Para retrocesos, usar animación paso a paso
                animarMovimiento(jugador, jugador.posicion, especial.movimiento, () => {
                    jugador.posicion = especial.movimiento;
                    dibujarTablero();
                });
                break;
        }
        
        // Si llegamos aquí, es una casilla especial que NO da turno extra
        // Continuar con el flujo normal del juego
    }

    function liberarDelPozo() {
        if (estado.jugadoresInactivos.size > 0) {
            const jugadorLiberado = Array.from(estado.jugadoresInactivos)[0];
            estado.jugadoresInactivos.delete(jugadorLiberado);
            mensajeEspecialElement.textContent += ` ¡Has liberado a ${estado.jugadores[jugadorLiberado].nombre} del pozo/cárcel!`;
        }
    }

    function encontrarSiguienteOca(posicionActual) {
        for (let i = posicionActual + 1; i <= 63; i++) {
            if (estado.tablero[i].especial && estado.tablero[i].especial.tipo === "oca") {
                return i;
            }
        }
        return 63;
    }

    function finalizarJuego() {
    estado.juegoActivo = false;
    
    // Deshabilitar todos los botones
    tirarDadoBtn.disabled = true;
    pasarTurnoBtn.disabled = true;
    pasarTurnoBtn.style.display = 'none'; // Ocultar botón pasar turno
    tirarDadoBtn.style.display = 'none'; // Ocultar botón tirar dado
    
    // Mostrar solo el botón de reiniciar
    reiniciarBtn.focus();
    
    // Actualizar el tablero una última vez
    dibujarTablero();
    
    // Mostrar tabla de posiciones definitiva
    mostrarTablaPosiciones();
    
    // Guardar estadísticas del juego
    guardarEstadisticasJuego();
}

    function mostrarTablaPosiciones() {
    // Ordenar jugadores por posición final
    const jugadoresOrdenados = Object.values(estado.jugadores)
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
        
        // Añadir info adicional
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
    
    // Mostrar tabla y cambiar título
    tablaPosicionesElement.style.display = 'block';
    tablaPosicionesElement.querySelector('h3').textContent = '🏆 Resultados Finales de la Partida 🏆';
}

    function actualizarPosiciones() {
        Object.keys(estado.jugadores).forEach(jugadorId => {
            document.getElementById(`pos-jugador${jugadorId}`).textContent = estado.jugadores[jugadorId].posicion;
            document.getElementById(`dados-jugador${jugadorId}`).textContent = estado.jugadores[jugadorId].dadosAcumulados;
            
            const estadoElement = document.getElementById(`estado-jugador${jugadorId}`);
            if (estado.jugadores[jugadorId].terminado) {
                estadoElement.innerHTML = `<span class="badge bg-success">🥇 ${estado.jugadores[jugadorId].posicionFinal}° Lugar</span>`;
            } else if (estado.jugadoresInactivos.has(parseInt(jugadorId))) {
                estadoElement.innerHTML = '<span class="badge bg-secondary">⏸️ Inactivo</span>';
            } else {
                estadoElement.innerHTML = '<span class="badge bg-light text-dark">🎯 Jugando</span>';
            }
        });
    }

    function actualizarEstadosJugadores() {
        Object.keys(estado.jugadores).forEach(jugadorId => {
            const posicionElement = document.getElementById(`pos-jugador${jugadorId}`);
            if (estado.jugadoresInactivos.has(parseInt(jugadorId))) {
                posicionElement.innerHTML = `<span class="text-warning">${estado.jugadores[jugadorId].posicion} (Inactivo)</span>`;
            } else {
                posicionElement.textContent = estado.jugadores[jugadorId].posicion;
            }
        });
    }
    
    function guardarEstadisticasJuego() {
    const userId = getSession();
    const isGuest = localStorage.getItem('guestMode') === 'true';
    
    if (!userId && !isGuest) {
        console.log("No se guardan estadísticas: usuario no autenticado");
        return;
    }
    
    // Determinar quién ganó (jugador con posicionFinal = 1)
    const ganador = Object.values(estado.jugadores).find(j => j.posicionFinal === 1);
    const totalTurnos = Object.values(estado.jugadores).reduce((sum, j) => sum + j.turnos, 0);
    
    // 🎯 LÓGICA CORREGIDA:
    // 1. ¿Ganó el Jugador 1?
    const jugador1 = estado.jugadores[1];
    const ganoJugador1 = ganador && ganador.nombre === jugador1.nombre;
    
    // 2. Preparar estadísticas
    const statsUpdate = {
        games_played: 1,           // ✅ SIEMPRE suma 1 partida jugada
        games_won: ganoJugador1 ? 1 : 0,  // ✅ Solo suma si ganó Jugador 1
        total_turns: totalTurnos,
        last_played: new Date().toISOString()
    };
    
    console.log("📊 Estadísticas a guardar:", {
        partidasJugadas: "+1",
        partidasGanadas: ganoJugador1 ? "+1 (Jugador 1 ganó)" : "+0",
        totalTurnos: totalTurnos,
        ganador: ganador?.nombre || "Ninguno"
    });
    
    // Preparar datos del juego terminado
    const gameData = {
        game_state: {
            jugadores: estado.jugadores,
            ganador: ganador?.nombre || 'Desconocido',
            jugadorActual: estado.jugadorActual,
            juegoActivo: false,  // Importante: false
            jugadoresTerminados: estado.jugadoresTerminados,
            turnoActual: estado.turnoActual,
            fecha: new Date().toISOString(),
            totalTurnos: totalTurnos
        },
        finished: true,  // ✅ Asegurar que sea TRUE
        finished_at: new Date().toISOString()
    };
    
    if (userId) {
        // Primero guardar el juego
        saveGameState(gameData).then(result => {
            console.log("✅ Juego guardado en Supabase");
            
            // Luego actualizar estadísticas
            updateUserStats(statsUpdate).then(result => {
                console.log("✅ Estadísticas actualizadas:", statsUpdate);
            }).catch(error => {
                console.error("❌ Error al actualizar estadísticas:", error);
            });
            
        }).catch(error => {
            console.error("❌ Error al guardar juego:", error);
            
            // Intentar guardar localmente como respaldo
            if (isGuest || !userId) {
                const localGames = JSON.parse(localStorage.getItem('oca_games') || '[]');
                localGames.push({
                    ...gameData,
                    local_id: Date.now(),
                    stats: statsUpdate  // Guardar stats también localmente
                });
                localStorage.setItem('oca_games', JSON.stringify(localGames.slice(-10)));
                console.log("📁 Juego guardado localmente");
            }
        });
    } else if (isGuest) {
        // Guardar localmente en modo invitado
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

function actualizarEstadisticasJugador(userId) {
    // Calcular estadísticas
    const jugadoresOrdenados = Object.values(estado.jugadores)
        .sort((a, b) => a.posicionFinal - b.posicionFinal);
    
    // El ganador es el que tiene posicionFinal = 1
    const ganador = jugadoresOrdenados.find(j => j.posicionFinal === 1);
    const jugadorActual = estado.jugadores[estado.jugadorActual];
    
    // Suponiendo que el jugador actual es el usuario (esto dependerá de tu lógica)
    const esGanador = ganador && ganador.nombre === jugadorActual.nombre;
    const totalTurnos = Object.values(estado.jugadores).reduce((sum, j) => sum + j.turnos, 0);
    
    // Preparar datos para actualizar
    const statsUpdate = {
        games_played: 1,
        games_won: esGanador ? 1 : 0,
        total_turns: totalTurnos,
        last_played: new Date().toISOString()
    };
    
    // Actualizar estadísticas
    updateUserStats(statsUpdate).then(result => {
        console.log("Estadísticas actualizadas:", result);
    }).catch(error => {
        console.error("Error al actualizar estadísticas:", error);
    });
}
function calcularPosicionesFinales() {
    // Ordenar jugadores por posición descendente (el más cerca de la meta primero)
    const jugadoresOrdenados = Object.values(estado.jugadores)
        .sort((a, b) => {
            // Primero, los que ya llegaron a la meta (posición 63)
            if (a.posicion === 63 && b.posicion !== 63) return -1;
            if (b.posicion === 63 && a.posicion !== 63) return 1;
            
            // Luego por posición (más alta primero)
            if (b.posicion !== a.posicion) {
                return b.posicion - a.posicion;
            } else {
                // Si tienen la misma posición, el que tiene menos turnos va primero
                return a.turnos - b.turnos;
            }
        });
    
    // REASIGNAR TODAS las posiciones finales desde 1
    jugadoresOrdenados.forEach((jugador, index) => {
        jugador.posicionFinal = index + 1;
        jugador.terminado = true; // Marcar a todos como terminados
    });
    
    // Actualizar contador de jugadores terminados
    estado.jugadoresTerminados = Object.keys(estado.jugadores).length;
}
    function reiniciarJuego() {
    // Resetear estado del juego
    estado.jugadorActual = 1;
    estado.jugadoresTerminados = 0;
    estado.turnoActual = 1;
    estado.dadoTirado = false;
    estado.valorDado = 0;
    estado.juegoActivo = true;
    estado.mantenerTurno = false;
    estado.jugadoresInactivos.clear();
    
    // Resetear cada jugador
    Object.keys(estado.jugadores).forEach(jugadorId => {
        estado.jugadores[jugadorId].posicion = 0;
        estado.jugadores[jugadorId].dadosAcumulados = 1;
        estado.jugadores[jugadorId].pasoUltimoTurno = false;
        estado.jugadores[jugadorId].terminado = false;
        estado.jugadores[jugadorId].posicionFinal = 0;
        estado.jugadores[jugadorId].turnos = 0;
    });
    
    // Restaurar botones
    tirarDadoBtn.disabled = false;
    pasarTurnoBtn.disabled = false;
    tirarDadoBtn.style.display = 'inline-block';
    pasarTurnoBtn.style.display = 'inline-block';
    
    // Ocultar tabla de posiciones
    tablaPosicionesElement.style.display = 'none';
    
    // Restaurar mensajes
    infoTurnoElement.innerHTML = `
        <span class="badge bg-primary fs-5 p-3">
            Turno actual: <span id="jugador-actual">Jugador 1</span>
            <span id="info-dados-turno" class="ms-2"></span>
        </span>
    `;
    
    dadoResultadoElement.textContent = '';
    mensajeEspecialElement.textContent = '¡Nuevo juego comenzado! Es tu turno, Jugador 1.';
    mensajeEspecialElement.className = 'h6 text-success';
    
    // Redibujar tablero
    dibujarTablero();
    
    // Actualizar referencias a elementos después de reiniciar
    jugadorActualElement = document.getElementById('jugador-actual');
    infoDadosTurnoElement = document.getElementById('info-dados-turno');
}

    // Event listeners
    tirarDadoBtn.addEventListener('click', tirarDado);
    pasarTurnoBtn.addEventListener('click', pasarTurno);
    reiniciarBtn.addEventListener('click', reiniciarJuego);

    // Inicializar juego
    dibujarTablero();
}