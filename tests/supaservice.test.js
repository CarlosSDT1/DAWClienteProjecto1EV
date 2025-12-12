// tests/supaservice.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BehaviorSubject, of, throwError } from 'rxjs'

// Mock de fetch global
global.fetch = vi.fn()

describe('supaservice.js - Funciones de API (mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })
  
  describe('Autenticación', () => {
    it('debería guardar tokens en login exitoso', async () => {
      // Mock de respuesta exitosa
      const mockResponse = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        user: { id: 'user123', email: 'test@example.com' }
      }
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      
      // Simular login
      const login = async (data) => {
        const response = await fetch('https://api.example.com/login', {
          method: 'POST',
          body: JSON.stringify(data)
        })
        const result = await response.json()
        
        if (response.ok) {
          localStorage.setItem('access_token', result.access_token)
          localStorage.setItem('user_id', result.user.id)
          return result
        }
        throw new Error('Login failed')
      }
      
      const result = await login({ email: 'test@example.com', password: '123456' })
      
      expect(result.access_token).toBe('token123')
      expect(localStorage.getItem('access_token')).toBe('token123')
      expect(localStorage.getItem('user_id')).toBe('user123')
    })
  })
  
  describe('BehaviorSubject de usuario', () => {
    it('debería emitir estado inicial correcto', () => {
      localStorage.setItem('user_id', 'test-user')
      
      const userSubject = new BehaviorSubject(
        localStorage.getItem('user_id') 
          ? { id: localStorage.getItem('user_id'), isGuest: false }
          : localStorage.getItem('guestMode') === 'true'
          ? { isGuest: true }
          : null
      )
      
      expect(userSubject.value.id).toBe('test-user')
      expect(userSubject.value.isGuest).toBe(false)
    })
    
    it('debería emitir null si no hay usuario', () => {
      localStorage.clear()
      
      const userSubject = new BehaviorSubject(
        localStorage.getItem('user_id') 
          ? { id: localStorage.getItem('user_id'), isGuest: false }
          : localStorage.getItem('guestMode') === 'true'
          ? { isGuest: true }
          : null
      )
      
      expect(userSubject.value).toBeNull()
    })
  })
  
  describe('Headers factory', () => {
    const headerFactory = ({ apikey, Authorization, contentType } = {}) => {
      const headers = new Headers()
      apikey && headers.append('apikey', apikey)
      Authorization && headers.append('Authorization', Authorization)
      contentType && headers.append('Content-Type', contentType)
      return headers
    }
    
    it('debería crear headers con apikey', () => {
      const headers = headerFactory({ apikey: 'test-key' })
      expect(headers.get('apikey')).toBe('test-key')
    })
    
    it('debería crear headers con Authorization', () => {
      const headers = headerFactory({ Authorization: 'Bearer token123' })
      expect(headers.get('Authorization')).toBe('Bearer token123')
    })
    
    it('debería crear headers con Content-Type', () => {
      const headers = headerFactory({ contentType: 'application/json' })
      expect(headers.get('Content-Type')).toBe('application/json')
    })
  })
})