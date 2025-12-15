// game/juego.js - COMPLETO CON IMPORTS CORREGIDOS
import { createInitialState, guardarEstado, limpiarEstadoGuardado, hayPartidaEnCurso } from './state/gameState.js';
import { siguienteTurno, actualizarPosiciones, actualizarEstadosJugadores } from './players/playerManager.js';
import { tirarDado, formatearResultadoDado } from './dice/diceManager.js';
import { 
    procesarCasillaEspecial, 
    liberarDelPozo,
    procesarInactividades,
    verificarLiberacionesDelPozo 
} from './specialCells/specialCells.js';
import { animarMovimiento } from './animations/animationManager.js';
import { actualizarInfoTurno, mostrarMensaje, mostrarResultadoDado, actualizarInfoCarrera } from './ui/gameUI.js';
import { calcularPosicionesFinales, mostrarTablaPosiciones, guardarEstadisticasJuego } from './stats/gameStats.js';
import { dibujarTableroCompleto } from './ui/boardRenderer.js';

// Importaciones rxjs
import { 
    gameState$, 
    currentPlayer$, 
    gameEvents$, 
    emitGameEvent,
    initGameObservables,
    userInteractions$,
    getGameStats$
} from '../services/gameObservables.js';

import { fromEvent } from 'rxjs';
import { filter, tap, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

let estado;
let cleanupObservables;

export function iniciarJuego() {

    
    // Cargar automáticamente si hay partida guardada
    if (hayPartidaEnCurso()) {
        estado = createInitialState();
        mostrarMensaje('✅ Partida anterior cargada automáticamente', 'success');
    } else {
        estado = createInitialState();
        mostrarMensaje('🆕 Nueva partida comenzada', 'info');
    }
    
    // Inicializar observables y guardar función de limpieza
    cleanupObservables = initGameObservables();
    
    // Emitir estado inicial a los observables
    gameState$.next(estado);
    currentPlayer$.next(estado.jugadorActual);
    
    renderizarInterfaz();
    configurarEventListenersReactivos();
    dibujarTableroCompleto(estado);
    actualizarInfoTurnoReactivo(estado);
    
    // Configurar suscripciones reactivas
    configurarSuscripcionesReactivas();
    
    // Guardar estado inicial
    guardarEstado(estado);
    
    // Suscribirse a cambios de estado para guardar automáticamente
    const saveSubscription = gameState$.pipe(
        filter(state => state !== null && state.juegoActivo),
        debounceTime(1000)
    ).subscribe(state => {
        guardarEstado(state);
    });
    
    // Añadir a la limpieza
    const originalCleanup = cleanupObservables;
    cleanupObservables = () => {
        if (originalCleanup) originalCleanup();
        if (saveSubscription) saveSubscription.unsubscribe();
    };
    
    return cleanupObservables;
}

function renderizarInterfaz() {
    const app = document.getElementById('app');
    
    if (!app) {
        console.error('Elemento #app no encontrado');
        return;
    }
    
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
                <button id="tirar-dado" class="btn btn-success btn-lg me-2"> Tirar Dado</button>
                <button id="pasar-turno" class="btn btn-info btn-lg me-2"> Pasar Turno</button>
                <button id="reiniciar" class="btn btn-primary btn-lg"> Nueva Partida</button>
            </div>

            ${renderizarPanelesJugadores()}
            
            <!-- Estadísticas en tiempo real -->
            <div id="estadisticas-tiempo-real" class="mt-4 card">
                <div class="card-header">
                    <h5 class="mb-0">Estadísticas en tiempo real</h5>
                </div>
                <div class="card-body">
                    <div class="row" id="stats-content">
                        <div class="col-md-3">Jugadores activos: <span id="stats-active">4</span></div>
                        <div class="col-md-3">Turno actual: <span id="stats-turn">1</span></div>
                        <div class="col-md-3">Tiradas totales: <span id="stats-rolls">0</span></div>
                        <div class="col-md-3">Eventos: <span id="stats-events">0</span></div>
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
}

function renderizarPanelesJugadores() {
    return `
        <div class="row mt-4">
            ${[1, 2, 3, 4].map(id => `
                <div class="col-md-3">
                    <div class="player-info player-panel-${id} bg-${id === 1 ? 'primary' : id === 2 ? 'danger' : id === 3 ? 'success' : 'warning'} ${id === 1 ? 'text-white' : id === 4 ? 'text-dark' : 'text-white'} p-3 rounded">
                        <h5>Jugador ${id}</h5>
                        <div>Posición: <span id="pos-jugador${id}">0</span></div>
                        <div>Dados: <span id="dados-jugador${id}">1</span></div>
                        <div>Turnos: <span id="turnos-jugador${id}">0</span></div>
                        <div class="estado-jugador" id="estado-jugador${id}"></div>
                        <div class="ficha ficha-jugador${id} mt-2"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function configurarEventListenersReactivos() {
    // Configurar observables para botones usando rxjs
    const tirarDadoBtn = document.getElementById('tirar-dado');
    const pasarTurnoBtn = document.getElementById('pasar-turno');
    const reiniciarBtn = document.getElementById('reiniciar');
    const guardarBtn = document.getElementById('guardar-partida');
    
    if (tirarDadoBtn) {
        fromEvent(tirarDadoBtn, 'click').pipe(
            debounceTime(300)
        ).subscribe(() => {
            manejarTirarDadoReactivo();
        });
    }
    
    if (pasarTurnoBtn) {
        fromEvent(pasarTurnoBtn, 'click').pipe(
            debounceTime(300)
        ).subscribe(() => {
            manejarPasarTurnoReactivo();
        });
    }
    
    if (reiniciarBtn) {
        fromEvent(reiniciarBtn, 'click').pipe(
            debounceTime(300)
        ).subscribe(() => {
            reiniciarJuegoReactivo();
        });
    }
    
    if (guardarBtn) {
        fromEvent(guardarBtn, 'click').pipe(
            debounceTime(300)
        ).subscribe(() => {
            if (guardarEstado(estado)) {
                mostrarMensaje('Partida guardada', 'success');
                emitGameEvent('GAME_SAVED', { timestamp: new Date().toISOString() });
            }
        });
    }
    
    // Configurar teclas de acceso rápido
    fromEvent(document, 'keydown').pipe(
        filter(event => !event.repeat),
        debounceTime(100)
    ).subscribe(event => {
        if (event.key === ' ' || event.key === 'Enter') {
            if (!estado.dadoTirado && estado.juegoActivo) {
                manejarTirarDadoReactivo();
            }
        } else if (event.key === 'p' || event.key === 'P') {
            if (!estado.dadoTirado && estado.juegoActivo) {
                manejarPasarTurnoReactivo();
            }
        } else if (event.key === 'r' || event.key === 'R') {
            if (event.ctrlKey) {
                reiniciarJuegoReactivo();
            }
        }
    });
}

function configurarSuscripcionesReactivas() {
    let eventCount = 0;
    let rollCount = 0;
    
    // Suscripción a eventos de juego para contarlos
    gameEvents$.subscribe((event) => {
        eventCount++;
        const eventsElement = document.getElementById('stats-events');
        if (eventsElement) {
            eventsElement.textContent = eventCount;
        }
        
        // Contar tiradas de dados
        if (event.type === 'DICE_ROLL') {
            rollCount++;
            const rollsElement = document.getElementById('stats-rolls');
            if (rollsElement) {
                rollsElement.textContent = rollCount;
            }
        }
    });
    
    // Suscripción a cambios de estado del juego
    const stateSubscription = gameState$.pipe(
        filter(state => state !== null),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(state => {
        estado = state; // Mantener sincronizado
        dibujarTableroCompleto(state);
        actualizarPosiciones(state);
        
        // Actualizar estadísticas en tiempo real
        const activeElement = document.getElementById('stats-active');
        if (activeElement) {
            const activePlayers = Object.values(state.jugadores).filter(p => !p.terminado).length;
            activeElement.textContent = activePlayers;
        }
        
        const turnElement = document.getElementById('stats-turn');
        if (turnElement) {
            turnElement.textContent = state.turnoActual;
        }
    });
    
    // Suscripción a cambios de jugador actual
    const playerSubscription = currentPlayer$.pipe(
        distinctUntilChanged()
    ).subscribe(playerId => {
        // Resaltar jugador actual en la interfaz
        document.querySelectorAll('.player-info').forEach((panel, index) => {
            const panelElement = panel;
            if (index + 1 === playerId) {
                panelElement.classList.add('active-turn');
                panelElement.style.transform = 'scale(1.05)';
                panelElement.style.transition = 'transform 0.3s';
            } else {
                panelElement.classList.remove('active-turn');
                panelElement.style.transform = 'scale(1)';
            }
        });
        
        // Actualizar información del turno
        if (estado) {
            actualizarInfoTurnoReactivo(estado);
        }
    });
    
    // Suscripción a todas las interacciones del usuario
    const interactionsSubscription = userInteractions$.subscribe(interaction => {
    });
    
    // Suscripción a estadísticas del juego
    const statsSubscription = getGameStats$().pipe(
        debounceTime(500)
    ).subscribe(stats => {
        // Actualizar turnos de jugadores
        if (estado && estado.jugadores) {
            Object.values(estado.jugadores).forEach(jugador => {
                const turnosElement = document.getElementById(`turnos-jugador${jugador.id}`);
                if (turnosElement) {
                    turnosElement.textContent = jugador.turnos;
                }
            });
        }
    });
    
    // Añadir todas las suscripciones a la limpieza
    const originalCleanup = cleanupObservables;
    cleanupObservables = () => {
        if (originalCleanup) originalCleanup();
        stateSubscription.unsubscribe();
        playerSubscription.unsubscribe();
        interactionsSubscription.unsubscribe();
        statsSubscription.unsubscribe();

    };
}

function actualizarInfoTurnoReactivo(estado) {
    if (!estado || !estado.jugadores || !estado.jugadorActual) return;
    // Object destructuring - para acceder facilmente a las propiedades del estado
    const { jugadorActual, jugadores } = estado; // Object destructuring
    const jugador = jugadores[jugadorActual];
    
    const jugadorActualElement = document.getElementById('jugador-actual');
    if (jugadorActualElement) {
        jugadorActualElement.textContent = jugador.nombre;
        // Añadir efecto visual
        jugadorActualElement.classList.add('text-pulse');
        setTimeout(() => {
            jugadorActualElement.classList.remove('text-pulse');
        }, 1000);
    }
    
    const badge = document.querySelector('#info-turno .badge');
    if (badge) {
        badge.className = `badge bg-${jugador.color} fs-5 p-3 pulse`;
    }
    
    const infoDados = document.getElementById('info-dados-turno');
    if (infoDados) {
        if (jugador.dadosAcumulados > 1) {
            infoDados.textContent = `(Tirará ${jugador.dadosAcumulados} dados)`;
            infoDados.className = 'text-warning fw-bold';
        } else {
            infoDados.textContent = '';
            infoDados.className = '';
        }
    }
    
    // Emitir evento de actualización de turno
    emitGameEvent('TURN_UPDATE', {
        playerId: jugadorActual,
        playerName: jugador.nombre,
        diceCount: jugador.dadosAcumulados,
        position: jugador.posicion
    });
}

function manejarTirarDadoReactivo() {
    if (!estado.juegoActivo || estado.dadoTirado) return;
    
    const jugador = estado.jugadores[estado.jugadorActual];
    
    // VERIFICAR INACTIVIDAD - CORREGIDO
    if (estado.jugadoresInactivos.has(estado.jugadorActual)) {
        // Procesar inactividad (reduce contadores)
        const sigueInactivo = procesarInactividades(estado, estado.jugadorActual);
        
        if (sigueInactivo) {
            // Si sigue inactivo, pierde el turno
            mostrarMensaje(`${jugador.nombre} está inactivo (${jugador.tipoInactividad}), pierde el turno`, 'warning');
            jugador.turnos++; // Contar como turno
            
            setTimeout(() => {
                estado.dadoTirado = false;
                siguienteTurno(estado);
                emitGameEvent('TURN_SKIP', { 
                    playerId: estado.jugadorActual, 
                    reason: 'inactive' 
                });
                gameState$.next(estado);
            }, 2000);
            return;
        } else {
            // Si ya no está inactivo, puede jugar
            mostrarMensaje(`✅ ${jugador.nombre} ha terminado su inactividad, puede jugar`, 'success');
        }
    }
    
    if (jugador.terminado) {
        mostrarMensaje(`${jugador.nombre} ya terminó el juego`, 'warning');
        siguienteTurno(estado);
        emitGameEvent('TURN_SKIP', { 
            playerId: estado.jugadorActual, 
            reason: 'finished' 
        });
        gameState$.next(estado);
        return;
    }
    
    estado.mantenerTurno = false;
    const numDados = jugador.dadosAcumulados;
    jugador.turnos++;
    
    const resultado = tirarDado(numDados);
    estado.valorDado = resultado.total;
    estado.dadoTirado = true;
    
    // Emitir evento de dado con rxjs
    emitGameEvent('DICE_ROLL', {
        playerId: estado.jugadorActual,
        result: resultado.resultados,
        total: resultado.total,
        numDados: numDados
    });
    
    mostrarResultadoDado(formatearResultadoDado(resultado, jugador.nombre));
    mostrarMensaje(`Avanzando ${estado.valorDado} casillas...`, 'primary');
    
    jugador.dadosAcumulados = 1;
    document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = 1;
    
    // Actualizar estado reactivo
    gameState$.next(estado);
    
    document.getElementById('tirar-dado').disabled = true;
    document.getElementById('pasar-turno').disabled = true;
    
    setTimeout(() => {
        moverJugadorReactivo();
    }, 1500);
}

function manejarPasarTurnoReactivo() {
    if (!estado.juegoActivo || estado.dadoTirado) return;
    
    const jugador = estado.jugadores[estado.jugadorActual];
    
    // VERIFICAR INACTIVIDAD - CORREGIDO (misma lógica)
    if (estado.jugadoresInactivos.has(estado.jugadorActual)) {
        // Procesar inactividad (reduce contadores)
        const sigueInactivo = procesarInactividades(estado, estado.jugadorActual);
        
        if (sigueInactivo) {
            // Si sigue inactivo, pierde el turno
            mostrarMensaje(`⏸️ ${jugador.nombre} está inactivo (${jugador.tipoInactividad}), pierde el turno`, 'warning');
            jugador.turnos++; // Contar como turno
            
            setTimeout(() => {
                estado.dadoTirado = false;
                siguienteTurno(estado);
                emitGameEvent('TURN_SKIP', { 
                    playerId: estado.jugadorActual, 
                    reason: 'inactive' 
                });
                gameState$.next(estado);
            }, 2000);
            return;
        } else {
            // Si ya no está inactivo, puede jugar
            mostrarMensaje(`${jugador.nombre} ha terminado su inactividad, puede jugar`, 'success');
        }
    }
    
    if (jugador.terminado) {
        mostrarMensaje(`${jugador.nombre} ya terminó el juego`, 'warning');
        siguienteTurno(estado);
        emitGameEvent('TURN_SKIP', { playerId: estado.jugadorActual, reason: 'finished' });
        gameState$.next(estado);
        return;
    }
    
    jugador.turnos++;
    
    if (jugador.dadosAcumulados < 3) {
        jugador.dadosAcumulados++;
        document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = jugador.dadosAcumulados;
        
        mostrarResultadoDado(`${jugador.nombre} pasa el turno`);
        mostrarMensaje(`¡Estrategia! Próximo turno tirarás ${jugador.dadosAcumulados} dados`, 'info');
        
        emitGameEvent('TURN_PASS', { 
            playerId: estado.jugadorActual, 
            newDiceCount: jugador.dadosAcumulados 
        });
        
        document.getElementById('tirar-dado').disabled = true;
        document.getElementById('pasar-turno').disabled = true;
        
        setTimeout(() => {
            estado.dadoTirado = false;
            siguienteTurno(estado);
            emitGameEvent('TURN_CHANGE', { 
                from: estado.jugadorActual, 
                to: (estado.jugadorActual % 4) + 1 
            });
            gameState$.next(estado);
            document.getElementById('tirar-dado').disabled = false;
            document.getElementById('pasar-turno').disabled = false;
        }, 2000);
    } else {
        mostrarResultadoDado(`${jugador.nombre} ya tiene el máximo de dados (3)`);
        mostrarMensaje("¡Ya tienes el máximo de dados acumulados (3)! Tira el dado para jugar.", 'warning');
        emitGameEvent('MAX_DICE_REACHED', { playerId: estado.jugadorActual });
    }
}

function moverJugadorReactivo() {
    const jugador = estado.jugadores[estado.jugadorActual];
    const nuevaPosicion = jugador.posicion + estado.valorDado;
    
    // Emitir evento de inicio de movimiento
    emitGameEvent('PLAYER_MOVE_START', {
        playerId: estado.jugadorActual,
        from: jugador.posicion,
        diceValue: estado.valorDado,
        targetPosition: nuevaPosicion
    });
    
    if (nuevaPosicion > 63) {
        const exceso = nuevaPosicion - 63;
        jugador.posicion = 63 - exceso;
        mostrarMensaje("¡Te pasaste de la meta! Retrocedes las casillas sobrantes.", 'warning');
        dibujarTableroCompleto(estado);
        
        // Emitir evento de movimiento con rebote
        emitGameEvent('PLAYER_MOVE_BOUNCE', {
            playerId: estado.jugadorActual,
            attempted: nuevaPosicion,
            actual: jugador.posicion,
            bounce: exceso
        });
        
        procesarDespuesDeMovimientoReactivo(jugador);
    } else {
        const posicionFinalDeseada = nuevaPosicion;
        
        animarMovimiento(
            jugador, 
            jugador.posicion, 
            posicionFinalDeseada, 
            () => {
                jugador.posicion = posicionFinalDeseada;
                dibujarTableroCompleto(estado);
                
                // Emitir evento de movimiento exitoso
                emitGameEvent('PLAYER_MOVE', {
                    playerId: estado.jugadorActual,
                    from: jugador.posicion - estado.valorDado,
                    to: jugador.posicion,
                    diceValue: estado.valorDado,
                    cellType: estado.tablero[jugador.posicion]?.especial?.tipo
                });
                
                procesarDespuesDeMovimientoReactivo(jugador);
            }, 
            estado
        );
    }
}

function procesarDespuesDeMovimientoReactivo(jugador) {
    // Primero verificar si llegó a la meta
    if (jugador.posicion === 63 && !jugador.terminado) {
        jugador.terminado = true;
        jugador.posicionFinal = 1;
        
        // Emitir evento de victoria con rxjs
        emitGameEvent('VICTORY', {
            playerId: estado.jugadorActual,
            playerName: jugador.nombre,
            turns: jugador.turnos,
            finalPosition: jugador.posicion
        });
        
        mostrarMensaje(`¡${jugador.nombre} ha llegado a la meta!`, 'success');
        calcularPosicionesFinales(estado.jugadores);
        
        const ganador = Object.values(estado.jugadores).find(j => j.posicionFinal === 1);
        document.getElementById('info-turno').innerHTML = `
            <div class="alert alert-success text-center">
                <h3 class="mb-3">¡${ganador.nombre} ha ganado la partida!</h3>
                <p class="mb-0">${ganador.nombre} llegó a la meta en ${ganador.turnos} turnos.</p>
            </div>
        `;
        
        finalizarJuegoReactivo();
        return;
    }
    
    if (estado.juegoActivo) {
        // Verificar casilla especial
        const resultadoCasillaEspecial = procesarCasillaEspecial(jugador, estado);
        
        if (resultadoCasillaEspecial) {
            // Emitir evento de casilla especial
            const cellType = estado.tablero[jugador.posicion]?.especial?.tipo;
            emitGameEvent('SPECIAL_CELL', {
                playerId: estado.jugadorActual,
                cellType: cellType,
                message: resultadoCasillaEspecial.accion ? resultadoCasillaEspecial.accion() : '',
                keepTurn: resultadoCasillaEspecial.mantenerTurno
            });
            
            if (resultadoCasillaEspecial.accion) {
                const mensajeExtra = resultadoCasillaEspecial.accion();
                mostrarMensaje(mensajeExtra, 'warning');
                
                // Verificar liberaciones del pozo
                const mensajesLiberacion = verificarLiberacionesDelPozo(estado);
                mensajesLiberacion.forEach(mensaje => {
                    mostrarMensaje(mensaje, 'success');
                });
            }
            
            estado.mantenerTurno = resultadoCasillaEspecial.mantenerTurno || false;
            
            if (estado.mantenerTurno) {
                estado.dadoTirado = false;
                dibujarTableroCompleto(estado);
                document.getElementById('tirar-dado').disabled = false;
                document.getElementById('pasar-turno').disabled = false;
                actualizarInfoTurnoReactivo(estado);
                
                // Actualizar estado reactivo
                gameState$.next(estado);
                return;
            }
        }
        
        estado.dadoTirado = false;
        dibujarTableroCompleto(estado);
        
        document.getElementById('tirar-dado').disabled = false;
        document.getElementById('pasar-turno').disabled = false;
        
        setTimeout(() => {
            siguienteTurno(estado);
            
            // Emitir evento de cambio de turno con rxjs
            emitGameEvent('TURN_CHANGE', {
                from: estado.jugadorActual,
                to: (estado.jugadorActual % 4) + 1,
                turnNumber: estado.turnoActual
            });
            
            estado.turnoActual++;
            actualizarInfoTurnoReactivo(estado);
            
            // Actualizar estado reactivo
            gameState$.next(estado);
        }, 1500);
    }
}

function finalizarJuegoReactivo() {
    estado.juegoActivo = false;
    
    // Emitir evento de fin de juego
    emitGameEvent('GAME_END', {
        winner: Object.values(estado.jugadores).find(j => j.posicionFinal === 1),
        totalTurns: estado.turnoActual,
        timestamp: new Date().toISOString()
    });
    
    document.getElementById('tirar-dado').disabled = true;
    document.getElementById('pasar-turno').disabled = true;
    document.getElementById('pasar-turno').style.display = 'none';
    document.getElementById('tirar-dado').style.display = 'none';
    
    dibujarTableroCompleto(estado);
    mostrarTablaPosiciones(estado.jugadores);
    guardarEstadisticasJuego(estado);
    
    limpiarEstadoGuardado();
    
    // Actualizar estado reactivo
    gameState$.next(estado);
}

function reiniciarJuegoReactivo() {
    // Emitir evento de reinicio
    emitGameEvent('GAME_RESTART', { 
        timestamp: new Date().toISOString(),
        previousState: estado 
    });
    
    limpiarEstadoGuardado();
    estado = createInitialState();
    
    // Resetear contadores de UI
    document.getElementById('stats-events').textContent = '0';
    document.getElementById('stats-rolls').textContent = '0';
    
    // Actualizar observables
    gameState$.next(estado);
    currentPlayer$.next(estado.jugadorActual);
    
    // Restaurar interfaz
    document.getElementById('tirar-dado').disabled = false;
    document.getElementById('pasar-turno').disabled = false;
    document.getElementById('tirar-dado').style.display = 'inline-block';
    document.getElementById('pasar-turno').style.display = 'inline-block';
    
    document.getElementById('tabla-posiciones').style.display = 'none';
    
    document.getElementById('info-turno').innerHTML = `
        <span class="badge bg-primary fs-5 p-3">
            Turno actual: <span id="jugador-actual">Jugador 1</span>
            <span id="info-dados-turno" class="ms-2"></span>
        </span>
    `;
    
    document.getElementById('dado-resultado').textContent = '';
    mostrarMensaje('Nueva partida comenzada', 'info');
    
    dibujarTableroCompleto(estado);
    actualizarInfoTurnoReactivo(estado);
    
    guardarEstado(estado);
}

// Exportar función para limpiar
export function limpiarJuego() {
    if (cleanupObservables) {
        cleanupObservables();
    }
}