// game/animations/animationManager.js
import { dibujarTableroCompleto } from '../ui/boardRenderer.js';

export function animarMovimiento(jugador, desde, hasta, callback, estado) {
    console.log('animarMovimiento:', {
        jugador: jugador.nombre,
        desde: desde,
        hasta: hasta
    });
    
    const pasos = Math.abs(hasta - desde);
    const direccion = hasta > desde ? 1 : -1;
    let pasoActual = 0;
    
    // Guardar posición original para restaurar después de animación
    const posicionOriginal = jugador.posicion;
    
    function siguientePaso() {
        if (pasoActual <= pasos) {
            const posicionIntermedia = desde + (pasoActual * direccion);
            
            // Actualizar posición temporal del jugador
            jugador.posicion = posicionIntermedia;
            
            // Redibujar el tablero con posición temporal
            dibujarTableroCompleto(estado);
            
            pasoActual++;
            
            // Velocidad de animación
            const delay = pasos > 10 ? 80 : 150;
            setTimeout(siguientePaso, delay);
        } else {
            // Restaurar posición original antes del callback
            jugador.posicion = posicionOriginal;
            callback();
        }
    }
    
    siguientePaso();
}

// Función auxiliar si es necesaria
export function actualizarPosicionVisual(jugador, posicionTemporal) {
    console.log(`Posición temporal: ${jugador.nombre} en ${posicionTemporal}`);
}