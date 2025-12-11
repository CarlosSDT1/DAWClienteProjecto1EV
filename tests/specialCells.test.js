// tests/specialCells.test.js
import { describe, it, expect } from 'vitest'
import { crearTableroOca } from '../src/game/board/boardManager.js'
import { procesarCasillaEspecial, liberarDelPozo } from '../src/game/specialCells/specialCells.js'

describe('specialCells.js - Tests de funciones puras', () => {
  // Test para procesarCasillaEspecial - función pura
  describe('procesarCasillaEspecial()', () => {
    it('debería procesar casilla oca correctamente', () => {
      const tablero = crearTableroOca()
      const jugador = { posicion: 5, nombre: 'Test', id: 1 }
      const estado = { tablero, jugadoresInactivos: new Set() }
      
      const resultado = procesarCasillaEspecial(jugador, estado)
      
      expect(resultado).not.toBeNull()
      expect(resultado.mantenerTurno).toBe(true)
    })
    
    it('debería devolver null para casilla no especial', () => {
      const tablero = crearTableroOca()
      const jugador = { posicion: 1, nombre: 'Test', id: 1 } // Casilla 1 no es especial
      const estado = { tablero, jugadoresInactivos: new Set() }
      
      const resultado = procesarCasillaEspecial(jugador, estado)
      
      expect(resultado).toBeNull()
    })
  })
  
  // Test para liberarDelPozo - función pura
  describe('liberarDelPozo()', () => {
    it('debería liberar jugador del pozo', () => {
      const estado = {
        jugadoresInactivos: new Set([1]),
        jugadores: { 1: { nombre: 'J1' } }
      }
      
      const mensaje = liberarDelPozo(estado)
      
      expect(mensaje).toContain('liberado')
      expect(estado.jugadoresInactivos.size).toBe(0)
    })
  })
})