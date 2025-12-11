// tests/playerManager.test.js
import { describe, it, expect } from 'vitest'
import { siguienteTurno, actualizarPosiciones } from '../src/game/players/playerManager.js'

describe('playerManager.js - Tests de funciones puras', () => {
  // Test para siguienteTurno - función pura
  describe('siguienteTurno()', () => {
    it('debería pasar al siguiente jugador activo', () => {
      const estado = {
        jugadorActual: 1,
        juegoActivo: true,
        jugadores: { 1: {}, 2: {}, 3: {}, 4: {} },
        jugadoresInactivos: new Set()
      }
      
      const siguiente = siguienteTurno(estado)
      
      expect(siguiente).toBe(2)
      expect(estado.jugadorActual).toBe(2)
    })
    
    it('debería saltar jugadores inactivos', () => {
      const estado = {
        jugadorActual: 1,
        juegoActivo: true,
        jugadores: { 1: {}, 2: {}, 3: {}, 4: {} },
        jugadoresInactivos: new Set([2]) // Jugador 2 inactivo
      }
      
      const siguiente = siguienteTurno(estado)
      
      expect(siguiente).toBe(3) // Salta al jugador 3
    })
  })
  
  // Test para actualizarPosiciones - función con efecto (manipula DOM)
  describe('actualizarPosiciones()', () => {
    it('debería ser una función definida', () => {
      expect(typeof actualizarPosiciones).toBe('function')
    })
  })
})