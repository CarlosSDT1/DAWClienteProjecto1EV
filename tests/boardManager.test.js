// tests/boardManager.test.js
import { describe, it, expect } from 'vitest'
import { crearTableroOca, obtenerIconoEspecial } from '../src/game/board/boardManager.js'

describe('boardManager.js - Tests de funciones puras', () => {
  // Test para crearTableroOca - función pura
  describe('crearTableroOca()', () => {
    it('debería crear un tablero con 64 casillas', () => {
      const tablero = crearTableroOca()
      
      expect(tablero.length).toBe(64)
      expect(tablero[0].numero).toBe(0)
      expect(tablero[63].numero).toBe(63)
    })
    
    it('debería tener casillas especiales definidas', () => {
      const tablero = crearTableroOca()
      
      expect(tablero[5].especial.tipo).toBe('oca')
      expect(tablero[63].especial.tipo).toBe('meta')
    })
  })
  
  // Test para obtenerIconoEspecial - función pura
  describe('obtenerIconoEspecial()', () => {
    it('debería devolver iconos correctos para tipos conocidos', () => {
      expect(obtenerIconoEspecial('oca')).toBe('🪿')
      expect(obtenerIconoEspecial('meta')).toBe('🏁')
    })
    
    it('debería devolver icono por defecto para tipos desconocidos', () => {
      expect(obtenerIconoEspecial('desconocido')).toBe('⭐')
    })
  })
})