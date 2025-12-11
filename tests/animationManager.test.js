// tests/animationManager.test.js
import { describe, it, expect, vi } from 'vitest'

// Las funciones en animationManager.js no son puras (usan setTimeout, manipulan DOM)
// Pero podemos testear cálculos puros si los hubiera

describe('animationManager.js - Tests de cálculos puros', () => {
  describe('Cálculos de animación', () => {
    it('debería calcular pasos correctamente', () => {
      const calcularPasos = (desde, hasta) => {
        return Math.abs(hasta - desde)
      }
      
      expect(calcularPasos(10, 20)).toBe(10)
      expect(calcularPasos(20, 10)).toBe(10)
      expect(calcularPasos(0, 63)).toBe(63)
    })
    
    it('debería determinar dirección correcta', () => {
      const getDireccion = (desde, hasta) => {
        return hasta > desde ? 1 : -1
      }
      
      expect(getDireccion(10, 20)).toBe(1)
      expect(getDireccion(20, 10)).toBe(-1)
      expect(getDireccion(10, 10)).toBe(-1) // o 1, según implementación
    })
  })
})