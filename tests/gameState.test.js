// tests/gameState.test.js - VERSIÓN CORREGIDA
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createInitialState, guardarEstado, hayPartidaEnCurso } from '../src/game/state/gameState.js'

describe('gameState.js - Tests de funciones puras', () => {
  beforeEach(() => {
    // Mock de localStorage limpio
    global.localStorage = {
      store: {},
      getItem: vi.fn(function(key) {
        return this.store[key] || null
      }),
      setItem: vi.fn(function(key, value) {
        this.store[key] = value.toString()
      }),
      removeItem: vi.fn(function(key) {
        delete this.store[key]
      }),
      clear: vi.fn(function() {
        this.store = {}
      })
    }
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
    
    it('debería cargar estado guardado si existe', () => {
      // Simular que hay estado guardado
      const savedState = {
        jugadorActual: 3,
        jugadores: { 1: { nombre: 'J1' } },
        fechaGuardado: new Date().toISOString(),
        version: '1.0'
      }
      global.localStorage.getItem.mockReturnValue(JSON.stringify(savedState))
      
      const estado = createInitialState()
      
      expect(estado.jugadorActual).toBe(3)
    })
  })
  
  describe('guardarEstado()', () => {
    it('debería guardar estado en localStorage', () => {
      const estado = createInitialState()
      
      const resultado = guardarEstado(estado)
      
      expect(resultado).toBe(true)
      expect(global.localStorage.setItem).toHaveBeenCalled()
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'oca_game_state',
        expect.any(String)
      )
    })
    
    it('debería devolver false si hay error al guardar', () => {
      const estado = createInitialState()
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      const resultado = guardarEstado(estado)
      
      expect(resultado).toBe(false)
    })
  })
  
  describe('hayPartidaEnCurso()', () => {
    it('debería devolver true si hay partida guardada', () => {
      global.localStorage.getItem.mockReturnValue('{"jugadorActual": 1}')
      
      const resultado = hayPartidaEnCurso()
      
      expect(resultado).toBe(true)
      expect(global.localStorage.getItem).toHaveBeenCalledWith('oca_game_state')
    })
    
    it('debería devolver false si no hay partida guardada', () => {
      global.localStorage.getItem.mockReturnValue(null)
      
      const resultado = hayPartidaEnCurso()
      
      expect(resultado).toBe(false)
    })
  })
})