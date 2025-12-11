// tests/gameState.test.js - VERSIÓN CORREGIDA
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createInitialState, guardarEstado, hayPartidaEnCurso } from '../src/game/state/gameState.js'

describe('gameState.js - Tests de funciones puras', () => {
  beforeEach(() => {
    // Limpiar localStorage mock antes de cada test
    if (global.localStorage && global.localStorage.clear) {
      global.localStorage.clear()
    }
    
    // Mock explícito para asegurar que funciona
    Object.defineProperty(global, 'localStorage', {
      value: {
        store: {},
        getItem(key) {
          return this.store[key] || null
        },
        setItem(key, value) {
          this.store[key] = value.toString()
        },
        removeItem(key) {
          delete this.store[key]
        },
        clear() {
          this.store = {}
        }
      },
      writable: true
    })
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  describe('createInitialState()', () => {
    it('debería crear estado inicial con 4 jugadores', () => {
      const estado = createInitialState()
      
      expect(Object.keys(estado.jugadores).length).toBe(4)
      expect(estado.jugadores[1].nombre).toBe('Jugador 1')
      expect(estado.jugadorActual).toBe(1)
    })
    
    it('debería inicializar propiedades correctamente', () => {
      const estado = createInitialState()
      
      expect(estado.juegoActivo).toBe(true)
      expect(estado.dadoTirado).toBe(false)
      expect(estado.jugadoresInactivos.size).toBe(0)
    })
  })
  
  describe('guardarEstado()', () => {
    it('debería guardar estado en localStorage', () => {
      // Configurar localStorage mock
      const mockSetItem = vi.fn()
      global.localStorage.setItem = mockSetItem
      
      const estado = createInitialState()
      
      const resultado = guardarEstado(estado)
      
      expect(resultado).toBe(true)
      expect(mockSetItem).toHaveBeenCalled()
      expect(mockSetItem).toHaveBeenCalledWith('oca_game_state', expect.any(String))
      
      // Verificar que el JSON guardado es válido
      const callArgs = mockSetItem.mock.calls[0]
      expect(callArgs[0]).toBe('oca_game_state')
      const savedData = JSON.parse(callArgs[1])
      expect(savedData.jugadorActual).toBe(1)
      expect(savedData.version).toBe('1.0')
    })
    
    it('debería devolver false si hay error al guardar', () => {
      // Mock para que setItem lance error
      const mockSetItem = vi.fn(() => {
        throw new Error('Storage is full')
      })
      global.localStorage.setItem = mockSetItem
      
      const estado = createInitialState()
      
      const resultado = guardarEstado(estado)
      
      expect(resultado).toBe(false)
      expect(mockSetItem).toHaveBeenCalled()
    })
  })
  
  describe('hayPartidaEnCurso()', () => {
    it('debería devolver true si hay partida guardada', () => {
      // Configurar mock
      const mockGetItem = vi.fn(() => JSON.stringify({ jugadorActual: 1 }))
      global.localStorage.getItem = mockGetItem
      
      const resultado = hayPartidaEnCurso()
      
      expect(resultado).toBe(true)
      expect(mockGetItem).toHaveBeenCalledWith('oca_game_state')
    })
    
    it('debería devolver false si no hay partida guardada', () => {
      // Configurar mock para devolver null
      const mockGetItem = vi.fn(() => null)
      global.localStorage.getItem = mockGetItem
      
      const resultado = hayPartidaEnCurso()
      
      expect(resultado).toBe(false)
      expect(mockGetItem).toHaveBeenCalledWith('oca_game_state')
    })
  })
})