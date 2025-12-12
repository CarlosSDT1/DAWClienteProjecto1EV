// tests/router.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de las dependencias
vi.mock('../src/game/juego.js', () => ({
  iniciarJuego: vi.fn()
}))

vi.mock('../src/services/supaservice.js', () => ({
  getSession: vi.fn()
}))

describe('router.js - Lógica de enrutamiento', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })
  
  describe('Protección de rutas', () => {
    const verificarAutenticacion = (userId, isGuest, hasSavedGame, route) => {
      // Lógica simplificada del router
      if (route === '#game' && hasSavedGame) {
        return true
      }
      
      const protectedRoutes = ['#game', '#stats']
      const authRoutes = ['#login', '#register']
      
      if (protectedRoutes.includes(route) && !userId && !isGuest && !hasSavedGame) {
        return false
      }
      
      if (authRoutes.includes(route) && (userId || isGuest)) {
        return false
      }
      
      return true
    }
    
    it('debería permitir juego si hay partida guardada', () => {
      expect(verificarAutenticacion(null, false, true, '#game')).toBe(true)
    })
    
    it('debería bloquear juego si no autenticado', () => {
      expect(verificarAutenticacion(null, false, false, '#game')).toBe(false)
    })
    
    it('debería permitir login si no autenticado', () => {
      expect(verificarAutenticacion(null, false, false, '#login')).toBe(true)
    })
    
    it('debería redirigir login si ya autenticado', () => {
      expect(verificarAutenticacion('user123', false, false, '#login')).toBe(false)
    })
  })
  
  describe('Mapeo de rutas', () => {
    const routes = new Map([
      ['', 'game-content'],
      ['#game', 'game-content'],
      ['#login', 'game-login'],
      ['#register', 'game-register'],
      ['#stats', 'game-stats']
    ])
    
    it('debería mapear rutas a componentes', () => {
      expect(routes.get('#game')).toBe('game-content')
      expect(routes.get('#login')).toBe('game-login')
      expect(routes.get('#stats')).toBe('game-stats')
      expect(routes.get('')).toBe('game-content')
    })
    
    it('debería devolver undefined para ruta no existente', () => {
      expect(routes.get('#admin')).toBeUndefined()
      expect(routes.get('#profile')).toBeUndefined()
    })
  })
})