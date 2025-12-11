// game/board/boardManager.js
export function crearTableroOca() {
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

export function obtenerIconoEspecial(tipo) {
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