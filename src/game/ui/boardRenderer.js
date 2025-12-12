// game/ui/boardRenderer.js
import { obtenerIconoEspecial } from '../board/boardManager.js';
import { actualizarPosiciones, actualizarEstadosJugadores } from '../players/playerManager.js';
import { actualizarInfoCarrera } from './gameUI.js';
import { hayPartidaEnCurso } from '../state/gameState.js';

export function dibujarTableroCompleto(estado) {
    const tableroElement = document.getElementById('tablero');
    if (!tableroElement) {
        console.error('Elemento #tablero no encontrado');
        return;
    }
    
    // Crear o actualizar indicador de partida guardada
    let indicador = document.getElementById('indicador-partida-guardada');
    
    
    // Mostrar indicador si hay partida guardada
    if (indicador && hayPartidaEnCurso() && estado && estado.juegoActivo) {
        indicador.style.opacity = '1';
        // Ocultar después de 2 segundos
        setTimeout(() => {
            if (indicador) indicador.style.opacity = '0';
        }, 2000);
    }
    
    tableroElement.innerHTML = '';
    tableroElement.className = 'oca-board mx-auto';
    
    // Crear tablero en forma de serpiente (8x8)
    for (let fila = 0; fila < 8; fila++) {
        for (let columna = 0; columna < 8; columna++) {
            let numeroCasilla;
            
            if (fila % 2 === 0) {
                numeroCasilla = fila * 8 + columna;
            } else {
                numeroCasilla = (fila + 1) * 8 - 1 - columna;
            }
            
            if (numeroCasilla > 0 && numeroCasilla <= 63) {
                crearCasilla(tableroElement, numeroCasilla, fila, columna, estado);
            } else if (numeroCasilla === 0) {
                crearCasillaSalida(tableroElement, fila, columna, estado);
            }
        }
    }
    
    if (actualizarPosiciones) actualizarPosiciones(estado);
    if (actualizarEstadosJugadores) actualizarEstadosJugadores(estado);
    if (actualizarInfoCarrera) actualizarInfoCarrera(estado);
}

function crearCasilla(tableroElement, numero, fila, columna, estado) {
    const casilla = document.createElement('div');
    const especial = estado.tablero[numero].especial;
    
    let clases = `casilla casilla-${numero}`;
    if (especial) {
        clases += ` casilla-especial ${especial.tipo}`;
    }
    
    casilla.className = clases;
    casilla.dataset.numero = numero;
    casilla.style.gridRow = fila + 1;
    casilla.style.gridColumn = columna + 1;
    
    const numeroDiv = document.createElement('div');
    numeroDiv.className = 'numero-casilla';
    numeroDiv.textContent = numero;
    casilla.appendChild(numeroDiv);
    
    const fichasContainer = document.createElement('div');
    fichasContainer.className = 'fichas-container';
    
    Object.keys(estado.jugadores).forEach(jugadorId => {
        if (estado.jugadores[jugadorId].posicion === numero) {
            const ficha = document.createElement('div');
            ficha.className = `ficha ficha-jugador${jugadorId} ${estado.jugadores[jugadorId].terminado ? 'terminado' : ''}`;
            ficha.title = estado.jugadores[jugadorId].nombre + 
                         (estado.jugadores[jugadorId].terminado ? ' (Terminado)' : '');
            fichasContainer.appendChild(ficha);
        }
    });
    
    casilla.appendChild(fichasContainer);
    
    if (especial) {
        const icono = document.createElement('div');
        icono.className = 'icono-especial';
        icono.innerHTML = obtenerIconoEspecial(especial.tipo);
        casilla.appendChild(icono);
    }
    
    tableroElement.appendChild(casilla);
}

function crearCasillaSalida(tableroElement, fila, columna, estado) {
    const casilla = document.createElement('div');
    casilla.className = 'casilla casilla-salida';
    casilla.dataset.numero = 0;
    casilla.style.gridRow = fila + 1;
    casilla.style.gridColumn = columna + 1;
    
    const numeroDiv = document.createElement('div');
    numeroDiv.className = 'numero-casilla';
    numeroDiv.textContent = 'Salida';
    casilla.appendChild(numeroDiv);
    
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