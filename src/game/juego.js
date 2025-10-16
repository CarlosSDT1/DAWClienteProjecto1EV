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
                        <div class="ficha ficha-jugador1 mt-2"></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="player-info bg-danger text-white p-3 rounded">
                        <h5>Jugador 2</h5>
                        <div>Posición: <span id="pos-jugador2">0</span></div>
                        <div>Dados: <span id="dados-jugador2">1</span></div>
                        <div class="ficha ficha-jugador2 mt-2"></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="player-info bg-success text-white p-3 rounded">
                        <h5>Jugador 3</h5>
                        <div>Posición: <span id="pos-jugador3">0</span></div>
                        <div>Dados: <span id="dados-jugador3">1</span></div>
                        <div class="ficha ficha-jugador3 mt-2"></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="player-info bg-warning text-dark p-3 rounded">
                        <h5>Jugador 4</h5>
                        <div>Posición: <span id="pos-jugador4">0</span></div>
                        <div>Dados: <span id="dados-jugador4">1</span></div>
                        <div class="ficha ficha-jugador4 mt-2"></div>
                    </div>
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
                pasoUltimoTurno: false
            },
            2: { 
                posicion: 0, 
                nombre: "Jugador 2", 
                color: "danger",
                dadosAcumulados: 1,
                pasoUltimoTurno: false
            },
            3: { 
                posicion: 0, 
                nombre: "Jugador 3", 
                color: "success",
                dadosAcumulados: 1,
                pasoUltimoTurno: false
            },
            4: { 
                posicion: 0, 
                nombre: "Jugador 4", 
                color: "warning",
                dadosAcumulados: 1,
                pasoUltimoTurno: false
            }
        },
        dadoTirado: false,
        valorDado: 0,
        juegoActivo: true,
        jugadoresInactivos: new Set(),
        tablero: crearTableroOca()
    };

    const tableroElement = document.getElementById('tablero');
    const infoTurnoElement = document.getElementById('info-turno');
    const jugadorActualElement = document.getElementById('jugador-actual');
    const infoDadosTurnoElement = document.getElementById('info-dados-turno');
    const dadoResultadoElement = document.getElementById('dado-resultado');
    const mensajeEspecialElement = document.getElementById('mensaje-especial');
    const tirarDadoBtn = document.getElementById('tirar-dado');
    const pasarTurnoBtn = document.getElementById('pasar-turno');
    const reiniciarBtn = document.getElementById('reiniciar');

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
        
        for (let i = 0; i <= 63; i++) {
            const casilla = document.createElement('div');
            casilla.className = `casilla casilla-${i} ${estado.tablero[i].especial ? 'casilla-especial ' + estado.tablero[i].especial.tipo : ''}`;
            casilla.dataset.numero = i;
            
            const numero = document.createElement('div');
            numero.className = 'numero-casilla';
            numero.textContent = i;
            casilla.appendChild(numero);
            
            const fichasContainer = document.createElement('div');
            fichasContainer.className = 'fichas-container';
            
            Object.keys(estado.jugadores).forEach(jugadorId => {
                if (estado.jugadores[jugadorId].posicion === i) {
                    const ficha = document.createElement('div');
                    ficha.className = `ficha ficha-jugador${jugadorId}`;
                    ficha.title = estado.jugadores[jugadorId].nombre;
                    fichasContainer.appendChild(ficha);
                }
            });
            
            casilla.appendChild(fichasContainer);
            
            if (estado.tablero[i].especial) {
                const icono = document.createElement('div');
                icono.className = 'icono-especial';
                icono.innerHTML = obtenerIconoEspecial(estado.tablero[i].especial.tipo);
                casilla.appendChild(icono);
            }
            
            tableroElement.appendChild(casilla);
        }
        
        actualizarPosiciones();
        actualizarEstadosJugadores();
        actualizarInfoTurno();
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
        
        // Actualizar el nombre del jugador actual
        jugadorActualElement.textContent = jugador.nombre;
        jugadorActualElement.className = `text-${jugador.color}`;
        
        // Actualizar información de dados acumulados
        if (jugador.dadosAcumulados > 1) {
            infoDadosTurnoElement.textContent = `(Tirará ${jugador.dadosAcumulados} dados)`;
            infoDadosTurnoElement.className = 'text-warning fw-bold';
        } else {
            infoDadosTurnoElement.textContent = '';
            infoDadosTurnoElement.className = '';
        }
        
        // Limpiar mensajes anteriores
        dadoResultadoElement.textContent = '';
        mensajeEspecialElement.textContent = 'Es tu turno. ¡Tira el dado o pasa turno para acumular más dados!';
        mensajeEspecialElement.className = 'h6 text-success';
    }

    function tirarDado() {
        if (!estado.juegoActivo || estado.dadoTirado) return;

        const jugador = estado.jugadores[estado.jugadorActual];
        const numDados = jugador.dadosAcumulados;
        
        // Tirar los dados acumulados
        let totalDado = 0;
        const resultados = [];
        
        for (let i = 0; i < numDados; i++) {
            const dado = Math.floor(Math.random() * 6) + 1;
            resultados.push(dado);
            totalDado += dado;
        }
        
        estado.valorDado = totalDado;
        estado.dadoTirado = true;
        
        // Mostrar resultados
        if (numDados === 1) {
            dadoResultadoElement.textContent = `🎲 ${jugador.nombre} ha sacado un ${estado.valorDado}`;
        } else {
            dadoResultadoElement.textContent = `🎲 ${jugador.nombre} ha sacado ${resultados.join(' + ')} = ${estado.valorDado}`;
        }
        
        mensajeEspecialElement.textContent = `Avanzando ${estado.valorDado} casillas...`;
        mensajeEspecialElement.className = 'h6 text-primary';
        
        // Resetear dados acumulados después de tirar
        jugador.dadosAcumulados = 1;
        jugador.pasoUltimoTurno = false;
        
        // Mover jugador después de un breve delay
        setTimeout(moverJugador, 1500);
    }

    function pasarTurno() {
        if (!estado.juegoActivo || estado.dadoTirado) return;

        const jugador = estado.jugadores[estado.jugadorActual];
        
        // Acumular un dado extra para el próximo turno (máximo 3 dados)
        if (jugador.dadosAcumulados < 3) {
            jugador.dadosAcumulados++;
            jugador.pasoUltimoTurno = true;
            
            dadoResultadoElement.textContent = `⏭️ ${jugador.nombre} pasa el turno`;
            mensajeEspecialElement.textContent = `¡Estrategia! Próximo turno tirarás ${jugador.dadosAcumulados} dados`;
            mensajeEspecialElement.className = 'h6 text-info';
            
            // Cambiar turno después de un breve delay
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
        
        // Verificar si se pasa de la meta
        if (nuevaPosicion > 63) {
            const exceso = nuevaPosicion - 63;
            jugador.posicion = 63 - exceso;
            mensajeEspecialElement.textContent = "¡Te pasaste de la meta! Retrocedes las casillas sobrantes.";
        } else {
            jugador.posicion = nuevaPosicion;
        }
        
        // Verificar casilla especial
        verificarCasillaEspecial(jugador);
        
        estado.dadoTirado = false;
        dibujarTablero();
        
        // Verificar victoria
        if (jugador.posicion === 63) {
            estado.juegoActivo = false;
            infoTurnoElement.innerHTML = `<div class="alert alert-success h3">🎉 ¡${jugador.nombre} ha ganado el juego! 🎉</div>`;
            tirarDadoBtn.disabled = true;
            pasarTurnoBtn.disabled = true;
            return;
        }
        
        // Cambiar turno (a menos que haya efecto especial que lo impida)
        if (!estado.mantenerTurno) {
            setTimeout(siguienteTurno, 2000);
        } else {
            estado.mantenerTurno = false;
            mensajeEspecialElement.textContent += " ¡Tira otra vez!";
            estado.dadoTirado = false;
            actualizarInfoTurno();
        }
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
        } while (estado.jugadoresInactivos.has(siguienteJugador));
        
        estado.jugadorActual = siguienteJugador;
        actualizarInfoTurno();
        dibujarTablero();
    }

    function verificarCasillaEspecial(jugador) {
        const casilla = estado.tablero[jugador.posicion];
        
        if (!casilla.especial) return;
        
        const especial = casilla.especial;
        mensajeEspecialElement.textContent = `${jugador.nombre}: ${especial.mensaje}`;
        mensajeEspecialElement.className = 'h6 text-warning';
        
        switch (especial.tipo) {
            case "oca":
                const nuevaPosOca = encontrarSiguienteOca(jugador.posicion);
                if (nuevaPosOca !== jugador.posicion) {
                    jugador.posicion = nuevaPosOca;
                    estado.mantenerTurno = true;
                }
                break;
                
            case "puente":
                jugador.posicion = especial.movimiento;
                estado.mantenerTurno = true;
                break;
                
            case "posada":
                break;
                
            case "pozo":
                estado.jugadoresInactivos.add(estado.jugadorActual);
                break;
                
            case "carcel":
                estado.jugadoresInactivos.add(estado.jugadorActual);
                break;
                
            case "laberinto":
            case "calavera":
                jugador.posicion = especial.movimiento;
                break;
                
            case "meta":
                estado.juegoActivo = false;
                infoTurnoElement.innerHTML = `<div class="alert alert-success h3">🎉 ¡${jugador.nombre} ha ganado el juego! 🎉</div>`;
                tirarDadoBtn.disabled = true;
                pasarTurnoBtn.disabled = true;
                break;
        }
        
        if ((especial.tipo === "oca" || especial.tipo === "puente") && estado.jugadoresInactivos.size > 0) {
            liberarDelPozo();
        }
        
        dibujarTablero();
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

    function actualizarPosiciones() {
        Object.keys(estado.jugadores).forEach(jugadorId => {
            document.getElementById(`pos-jugador${jugadorId}`).textContent = estado.jugadores[jugadorId].posicion;
            document.getElementById(`dados-jugador${jugadorId}`).textContent = estado.jugadores[jugadorId].dadosAcumulados;
        });
        
        document.querySelectorAll('.player-info').forEach(info => {
            info.classList.remove('active', 'inactive', 'acumulando');
        });
        
        const jugadorActivoElement = document.querySelector(`.player-info:has(.ficha-jugador${estado.jugadorActual})`);
        if (jugadorActivoElement) {
            jugadorActivoElement.classList.add('active');
            
            if (estado.jugadores[estado.jugadorActual].dadosAcumulados > 1) {
                jugadorActivoElement.classList.add('acumulando');
            }
        }
        
        estado.jugadoresInactivos.forEach(jugadorId => {
            const jugadorInactivoElement = document.querySelector(`.player-info:has(.ficha-jugador${jugadorId})`);
            if (jugadorInactivoElement) {
                jugadorInactivoElement.classList.add('inactive');
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
        Object.keys(estado.jugadores).forEach(jugadorId => {
            estado.jugadores[jugadorId].posicion = 0;
            estado.jugadores[jugadorId].dadosAcumulados = 1;
            estado.jugadores[jugadorId].pasoUltimoTurno = false;
        });
        estado.dadoTirado = false;
        estado.valorDado = 0;
        estado.juegoActivo = true;
        estado.mantenerTurno = false;
        estado.jugadoresInactivos.clear();

        tirarDadoBtn.disabled = false;
        pasarTurnoBtn.disabled = false;
        
        dibujarTablero();
    }

    // Event listeners
    tirarDadoBtn.addEventListener('click', tirarDado);
    pasarTurnoBtn.addEventListener('click', pasarTurno);
    reiniciarBtn.addEventListener('click', reiniciarJuego);

    // Inicializar juego
    dibujarTablero();
}