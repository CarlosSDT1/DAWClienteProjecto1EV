// game/juego.js - COMPLETO CON TODAS LAS IMPORTACIONES
import { createInitialState } from './state/gameState.js';
import { siguienteTurno, actualizarPosiciones, actualizarEstadosJugadores } from './players/playerManager.js';
import { tirarDado, formatearResultadoDado } from './dice/diceManager.js';
import { procesarCasillaEspecial, liberarDelPozo } from './specialCells/specialCells.js';
import { animarMovimiento } from './animations/animationManager.js';
import { actualizarInfoTurno, mostrarMensaje, mostrarResultadoDado, actualizarInfoCarrera } from './ui/gameUI.js';
import { calcularPosicionesFinales, mostrarTablaPosiciones, guardarEstadisticasJuego } from './stats/gameStats.js';
import { dibujarTableroCompleto } from './ui/boardRenderer.js';

let estado;

export function iniciarJuego() {
    console.log('Iniciando juego...');
    estado = createInitialState();
    renderizarInterfaz();
    configurarEventListeners();
    dibujarTableroCompleto(estado);
    actualizarInfoTurno(estado);
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
                <button id="tirar-dado" class="btn btn-success btn-lg me-2">Tirar Dado</button>
                <button id="pasar-turno" class="btn btn-info btn-lg me-2">Pasar Turno</button>
                <button id="reiniciar" class="btn btn-primary btn-lg">Nuevo Juego</button>
            </div>

            ${renderizarPanelesJugadores()}

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
                    <div class="player-info bg-${id === 1 ? 'primary' : id === 2 ? 'danger' : id === 3 ? 'success' : 'warning'} ${id === 1 ? 'text-white' : id === 4 ? 'text-dark' : 'text-white'} p-3 rounded">
                        <h5>Jugador ${id}</h5>
                        <div>Posición: <span id="pos-jugador${id}">0</span></div>
                        <div>Dados: <span id="dados-jugador${id}">1</span></div>
                        <div class="estado-jugador" id="estado-jugador${id}"></div>
                        <div class="ficha ficha-jugador${id} mt-2"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function configurarEventListeners() {
    document.getElementById('tirar-dado')?.addEventListener('click', manejarTirarDado);
    document.getElementById('pasar-turno')?.addEventListener('click', manejarPasarTurno);
    document.getElementById('reiniciar')?.addEventListener('click', reiniciarJuego);
}

function manejarTirarDado() {
    if (!estado.juegoActivo || estado.dadoTirado) return;
    
    const jugador = estado.jugadores[estado.jugadorActual];
    
    if (jugador.terminado || estado.jugadoresInactivos.has(estado.jugadorActual)) {
        mostrarMensaje(`⚠️ ${jugador.nombre} no puede jugar ahora`, 'warning');
        siguienteTurno(estado);
        return;
    }
    
    estado.mantenerTurno = false;
    const numDados = jugador.dadosAcumulados;
    jugador.turnos++;
    
    const resultado = tirarDado(numDados);
    estado.valorDado = resultado.total;
    estado.dadoTirado = true;
    
    mostrarResultadoDado(formatearResultadoDado(resultado, jugador.nombre));
    mostrarMensaje(`Avanzando ${estado.valorDado} casillas...`, 'primary');
    
    jugador.dadosAcumulados = 1;
    document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = 1;
    
    document.getElementById('tirar-dado').disabled = true;
    document.getElementById('pasar-turno').disabled = true;
    
    setTimeout(() => {
        moverJugador();
    }, 1500);
}

function manejarPasarTurno() {
    if (!estado.juegoActivo || estado.dadoTirado) return;
    
    const jugador = estado.jugadores[estado.jugadorActual];
    
    if (jugador.terminado) {
        mostrarMensaje(`⚠️ ${jugador.nombre} ya terminó el juego`, 'warning');
        siguienteTurno(estado);
        return;
    }
    
    if (estado.jugadoresInactivos.has(estado.jugadorActual)) {
        mostrarMensaje(`⏸️ ${jugador.nombre} está inactivo (en pozo/cárcel).`, 'secondary');
        jugador.turnos++;
        jugador.dadosAcumulados = 1;
        document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = 1;
        
        setTimeout(() => {
            estado.dadoTirado = false;
            siguienteTurno(estado);
        }, 2000);
        return;
    }
    
    jugador.turnos++;
    
    if (jugador.dadosAcumulados < 3) {
        jugador.dadosAcumulados++;
        document.getElementById(`dados-jugador${estado.jugadorActual}`).textContent = jugador.dadosAcumulados;
        
        mostrarResultadoDado(`⏭️ ${jugador.nombre} pasa el turno`);
        mostrarMensaje(`¡Estrategia! Próximo turno tirarás ${jugador.dadosAcumulados} dados`, 'info');
        
        document.getElementById('tirar-dado').disabled = true;
        document.getElementById('pasar-turno').disabled = true;
        
        setTimeout(() => {
            estado.dadoTirado = false;
            siguienteTurno(estado);
            document.getElementById('tirar-dado').disabled = false;
            document.getElementById('pasar-turno').disabled = false;
        }, 2000);
    } else {
        mostrarResultadoDado(`🎲 ${jugador.nombre} ya tiene el máximo de dados (3)`);
        mostrarMensaje("¡Ya tienes el máximo de dados acumulados (3)! Tira el dado para jugar.", 'warning');
    }
}

function moverJugador() {
    const jugador = estado.jugadores[estado.jugadorActual];
    const nuevaPosicion = jugador.posicion + estado.valorDado;
    
    console.log('moverJugador:', {
        jugador: jugador.nombre,
        posicionActual: jugador.posicion,
        valorDado: estado.valorDado,
        nuevaPosicion: nuevaPosicion
    });
    
    if (nuevaPosicion > 63) {
        const exceso = nuevaPosicion - 63;
        jugador.posicion = 63 - exceso;
        mostrarMensaje("¡Te pasaste de la meta! Retrocedes las casillas sobrantes.", 'warning');
        dibujarTableroCompleto(estado); // Asegurar que se redibuje
        procesarDespuesDeMovimiento(jugador);
    } else {
        const posicionFinalDeseada = nuevaPosicion;
        
        animarMovimiento(
            jugador, 
            jugador.posicion, 
            posicionFinalDeseada, 
            () => {
                jugador.posicion = posicionFinalDeseada;
                dibujarTableroCompleto(estado); // Asegurar que se redibuje
                procesarDespuesDeMovimiento(jugador);
            }, 
            estado
        );
    }
}

function procesarDespuesDeMovimiento(jugador) {
    console.log('procesarDespuesDeMovimiento llamado para:', jugador.nombre);
    console.log('Posición actual:', jugador.posicion);
    
    // Primero verificar si llegó a la meta
    if (jugador.posicion === 63 && !jugador.terminado) {
        console.log('¡Llegó a la meta!');
        jugador.terminado = true;
        jugador.posicionFinal = 1;
        
        mostrarMensaje(`🎉 ¡${jugador.nombre} ha llegado a la meta!`, 'success');
        calcularPosicionesFinales(estado.jugadores);
        
        const ganador = Object.values(estado.jugadores).find(j => j.posicionFinal === 1);
        document.getElementById('info-turno').innerHTML = `
            <div class="alert alert-success text-center">
                <h3 class="mb-3">🏆 ¡${ganador.nombre} ha ganado la partida! 🏆</h3>
                <p class="mb-0">${ganador.nombre} llegó a la meta en ${ganador.turnos} turnos.</p>
            </div>
        `;
        
        finalizarJuego();
        return;
    }
    
    if (estado.juegoActivo) {
        // Verificar casilla especial
        console.log('Verificando casilla especial...');
        const resultadoCasillaEspecial = procesarCasillaEspecial(jugador, estado);
        
        if (resultadoCasillaEspecial) {
            console.log('Resultado casilla especial:', resultadoCasillaEspecial);
            
            // Si tiene una acción, ejecutarla
            if (resultadoCasillaEspecial.accion) {
                const mensajeExtra = resultadoCasillaEspecial.accion();
                mostrarMensaje(mensajeExtra, 'warning');
                
                // Verificar si hay jugadores en el pozo para liberar
                if (estado.jugadoresInactivos.size > 0) {
                    const mensajeLiberacion = liberarDelPozo(estado);
                    if (mensajeLiberacion) {
                        mostrarMensaje(mensajeLiberacion, 'success');
                    }
                }
            }
            
            // IMPORTANTE: Actualizar si mantiene el turno
            estado.mantenerTurno = resultadoCasillaEspecial.mantenerTurno || false;
            console.log('mantenerTurno después de casilla especial:', estado.mantenerTurno);
            
            // Si mantiene el turno, NO avanzar al siguiente jugador
            if (estado.mantenerTurno) {
                console.log('Jugador mantiene el turno');
                estado.dadoTirado = false;
                dibujarTableroCompleto(estado);
                document.getElementById('tirar-dado').disabled = false;
                document.getElementById('pasar-turno').disabled = false;
                actualizarInfoTurno(estado);
                return; // Salir aquí, el jugador tira otra vez
            }
        }
        
        // Si NO mantiene el turno, continuar normal
        console.log('Avanzando al siguiente turno');
        estado.dadoTirado = false;
        dibujarTableroCompleto(estado);
        
        document.getElementById('tirar-dado').disabled = false;
        document.getElementById('pasar-turno').disabled = false;
        
        setTimeout(() => {
            siguienteTurno(estado);
            actualizarInfoTurno(estado);
        }, 1500);
    }
}

function finalizarJuego() {
    estado.juegoActivo = false;
    
    document.getElementById('tirar-dado').disabled = true;
    document.getElementById('pasar-turno').disabled = true;
    document.getElementById('pasar-turno').style.display = 'none';
    document.getElementById('tirar-dado').style.display = 'none';
    
    dibujarTableroCompleto(estado);
    mostrarTablaPosiciones(estado.jugadores);
    guardarEstadisticasJuego(estado);
}

function reiniciarJuego() {
    estado = createInitialState();
    
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
    mostrarMensaje('¡Nuevo juego comenzado! Es tu turno, Jugador 1.', 'success');
    
    dibujarTableroCompleto(estado);
    actualizarInfoTurno(estado);
}