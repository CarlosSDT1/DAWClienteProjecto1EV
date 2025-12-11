// tests/gameStats.test.js
import { describe, it, expect } from 'vitest'
import { calcularPosicionesFinales } from '../src/game/stats/gameStats.js'

describe('gameStats.js - Tests de funciones puras', () => {
  // Test para calcularPosicionesFinales - función pura
  describe('calcularPosicionesFinales()', () => {
    it('debería calcular posiciones correctamente', () => {
      const jugadores = {
        1: { nombre: 'J1', posicion: 63, turnos: 5 },
        2: { nombre: 'J2', posicion: 50, turnos: 8 },
        3: { nombre: 'J3', posicion: 45, turnos: 10 }
      }
      
      const terminados = calcularPosicionesFinales(jugadores)
      
      expect(terminados).toBe(3)
      expect(jugadores[1].posicionFinal).toBe(1)
      expect(jugadores[2].posicionFinal).toBe(2)
      expect(jugadores[3].posicionFinal).toBe(3)
    })
    
    it('debería marcar jugadores como terminados', () => {
      const jugadores = {
        1: { nombre: 'J1', posicion: 63, turnos: 5 }
      }
      
      calcularPosicionesFinales(jugadores)
      
      expect(jugadores[1].terminado).toBe(true)
    })
  })
})