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
            infoCarreraElement.textContent = `🏁 ${terminados}/${totalJugadores} jugadores han terminado`;
            infoCarreraElement.className = 'small text-success fw-bold';
        } else {
            infoCarreraElement.textContent = '';
            infoCarreraElement.className = 'small text-muted';
        }
    }

    function tirarDado() {
        if (!estado.juegoActivo || estado.dadoTirado) return;

        const jugador = estado.jugadores[estado.jugadorActual];
        if (jugador.terminado) return;

        // Resetear estados al inicio del turno
        estado.mantenerTurno = false;
        
        const numDados = jugador.dadosAcumulados;
        jugador.turnos++;
        
        let totalDado = 0;
        const resultados = [];
        
        for (let i = 0; i < numDados; i++) {
            const dado = Math.floor(Math.random() * 6) + 1;
            resultados.push(dado);
            totalDado += dado;
        }
        
        estado.valorDado = totalDado;
        estado.dadoTirado = true;
        
        if (numDados === 1) {
            dadoResultadoElement.textContent = `🎲 ${jugador.nombre} ha sacado un ${estado.valorDado}`;
        } else {
            dadoResultadoElement.textContent = `🎲 ${jugador.nombre} ha sacado ${resultados.join(' + ')} = ${estado.valorDado}`;
        }
        
        mensajeEspecialElement.textContent = `Avanzando ${estado.valorDado} casillas...`;
        mensajeEspecialElement.className = 'h6 text-primary';
        
        jugador.dadosAcumulados = 1;
        
        setTimeout(moverJugador, 1500);
    }

    function pasarTurno() {
        if (!estado.juegoActivo || estado.dadoTirado) return;

        const jugador = estado.jugadores[estado.jugadorActual];
        if (jugador.terminado) return;

        jugador.turnos++;
        
        if (jugador.dadosAcumulados < 3) {
            jugador.dadosAcumulados++;
            
            dadoResultadoElement.textContent = `⏭️ ${jugador.nombre} pasa el turno`;
            mensajeEspecialElement.textContent = `¡Estrategia! Próximo turno tirarás ${jugador.dadosAcumulados} dados`;
            mensajeEspecialElement.className = 'h6 text-info';
            
            setTimeout(() => {
                estado.dadoTirado = false;
                siguienteTurno();
            }, 2000);
        } else {
            mensajeEspecialElement.textContent = "¡Ya tienes el máximo de dados acumulados (3)! Tira el dado.";
            mensajeEspecialElement.className = 'h6 text-warning';
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
            jugador.posicionFinal = estado.jugadoresTerminados + 1;
            estado.jugadoresTerminados++;
            mensajeEspecialElement.textContent = `🎉 ¡${jugador.nombre} ha llegado a la meta en ${jugador.posicionFinal}° lugar!`;
            mensajeEspecialElement.className = 'h6 text-success fw-bold';
            
            if (estado.jugadoresTerminados === Object.keys(estado.jugadores).length) {
                finalizarJuego();
                return;
            }
        }
        
        // Verificar casilla especial
        verificarCasillaEspecial(jugador);
        
        // Si después de verificar la casilla especial NO tenemos turno extra,
        // entonces continuar con el flujo normal
        if (!estado.mantenerTurno) {
            estado.dadoTirado = false;
            dibujarTablero();
            setTimeout(siguienteTurno, 1500);
        }
        // Si estado.mantenerTurno es true, la función verificarCasillaEspecial
        // ya se encargó de preparar el siguiente turno
    }

    function siguienteTurno() {
        let siguienteJugador = estado.jugadorActual;
        let intentos = 0;
        
        do {
            siguienteJugador = siguienteJugador % 4 + 1;
            intentos++;
            
            if (intentos > 4) {
                estado.jugadoresInactivos.clear();
                break;
            }
        } while (estado.jugadoresInactivos.has(siguienteJugador) || 
                 estado.jugadores[siguienteJugador].terminado);
        
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
        mostrarTablaPosiciones();
        tirarDadoBtn.disabled = true;
        pasarTurnoBtn.disabled = true;
        infoTurnoElement.innerHTML = `<div class="alert alert-success h3">🎉 ¡Carrera Terminada! 🎉</div>`;
    }

    function mostrarTablaPosiciones() {
        const jugadoresOrdenados = Object.values(estado.jugadores)
            .sort((a, b) => a.posicionFinal - b.posicionFinal);
        
        cuerpoTablaElement.innerHTML = '';
        
        jugadoresOrdenados.forEach((jugador, index) => {
            const fila = document.createElement('tr');
            let posicionTexto = '';
            let claseFila = '';
            
            switch (index) {
                case 0:
                    posicionTexto = '1°';
                    claseFila = 'table-success';
                    break;
                case 1:
                    posicionTexto = '2°';
                    claseFila = 'table-info';
                    break;
                case 2:
                    posicionTexto = '3°';
                    claseFila = 'table-warning';
                    break;
                default:
                    posicionTexto = `${index + 1}°`;
                    claseFila = '';
            }
            
            fila.className = claseFila;
            fila.innerHTML = `
                <td class="fw-bold">${posicionTexto}</td>
                <td><span class="badge bg-${jugador.color}">${jugador.nombre}</span></td>
                <td>${jugador.turnos}</td>
                <td>${jugador.terminado ? '<span class="text-success">✅ Terminado</span>' : '<span class="text-danger">❌ No terminó</span>'}</td>
            `;
            
            cuerpoTablaElement.appendChild(fila);
        });
        
        tablaPosicionesElement.style.display = 'block';
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

    function reiniciarJuego() {
        estado.jugadorActual = 1;
        estado.jugadoresTerminados = 0;
        estado.turnoActual = 1;
        estado.dadoTirado = false;
        estado.valorDado = 0;
        estado.juegoActivo = true;
        estado.mantenerTurno = false;
        estado.jugadoresInactivos.clear();

        Object.keys(estado.jugadores).forEach(jugadorId => {
            estado.jugadores[jugadorId].posicion = 0;
            estado.jugadores[jugadorId].dadosAcumulados = 1;
            estado.jugadores[jugadorId].pasoUltimoTurno = false;
            estado.jugadores[jugadorId].terminado = false;
            estado.jugadores[jugadorId].posicionFinal = 0;
            estado.jugadores[jugadorId].turnos = 0;
        });

        tirarDadoBtn.disabled = false;
        pasarTurnoBtn.disabled = false;
        tablaPosicionesElement.style.display = 'none';
        
        dibujarTablero();
    }

    // Event listeners
    tirarDadoBtn.addEventListener('click', tirarDado);
    pasarTurnoBtn.addEventListener('click', pasarTurno);
    reiniciarBtn.addEventListener('click', reiniciarJuego);

    // Inicializar juego
    dibujarTablero();
}