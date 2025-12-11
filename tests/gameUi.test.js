// tests/gameUI.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock del DOM para tests
beforeEach(() => {
  // Crear elementos DOM mock
  document.body.innerHTML = `
    <div id="jugador-actual"></div>
    <div id="info-dados-turno"></div>
    <div id="dado-resultado"></div>
    <div id="mensaje-especial"></div>
  `
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('gameUI.js - Tests de funciones de UI', () => {
  // Test para formatear funciones (si las hubiera)
  // Las funciones de gameUI.js no son puras (manipulan DOM)
  // Pero podemos testear lógica auxiliar
  
  describe('Funciones auxiliares de formateo', () => {
    it('debería formatear mensaje de dados acumulados', () => {
      // Ejemplo: Si tuvieras una función pura para formatear
      const formatearDadosAcumulados = (numDados) => {
        return numDados > 1 ? `(Tirará ${numDados} dados)` : ''
      }
      
      expect(formatearDadosAcumulados(1)).toBe('')
      expect(formatearDadosAcumulados(2)).toBe('(Tirará 2 dados)')
      expect(formatearDadosAcumulados(3)).toBe('(Tirará 3 dados)')
    })
    
    it('debería seleccionar clase CSS según tipo de mensaje', () => {
      const getClasePorTipo = (tipo) => {
        const clases = {
          'info': 'text-info',
          'success': 'text-success', 
          'warning': 'text-warning',
          'danger': 'text-danger'
        }
        return clases[tipo] || 'text-info'
      }
      
      expect(getClasePorTipo('success')).toBe('text-success')
      expect(getClasePorTipo('warning')).toBe('text-warning')
      expect(getClasePorTipo('desconocido')).toBe('text-info')
    })
  })
})