// tests/diceManager.test.js
import { describe, it, expect } from 'vitest'
import { tirarDado, formatearResultadoDado } from '../src/game/dice/diceManager.js'

describe('diceManager.js - Tests de funciones puras', () => {
  // Test para tirarDado - función pura (depende de Math.random, pero es aceptable)
  describe('tirarDado()', () => {
    it('debería devolver un objeto con resultados, total y numDados', () => {
      const resultado = tirarDado(2)
      
      expect(resultado).toHaveProperty('resultados')
      expect(resultado).toHaveProperty('total')
      expect(resultado).toHaveProperty('numDados')
      expect(resultado.numDados).toBe(2)
    })
    
    it('debería generar números válidos (1-6)', () => {
      const resultado = tirarDado(5)
      
      resultado.resultados.forEach(valor => {
        expect(valor).toBeGreaterThanOrEqual(1)
        expect(valor).toBeLessThanOrEqual(6)
      })
    })
  })
  
  // Test para formatearResultadoDado - función pura
  describe('formatearResultadoDado()', () => {
    it('debería formatear correctamente el resultado del dado', () => {
      const resultado = { resultados: [4], total: 4, numDados: 1 }
      const texto = formatearResultadoDado(resultado, 'Jugador 1')
      
      expect(texto).toBe('🎲 Jugador 1 ha sacado un 4')
    })
    
    it('debería funcionar con múltiples dados', () => {
      const resultado = { resultados: [2, 5], total: 7, numDados: 2 }
      const texto = formatearResultadoDado(resultado, 'Jugador 2')
      
      expect(texto).toBe('🎲 Jugador 2 ha sacado 2 + 5 = 7')
    })
  })
})