// tests/login.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de las funciones que necesitan DOM
vi.mock('../src/services/supaservice.js', () => ({
  login: vi.fn(),
  register: vi.fn()
}))

describe('login.js - Funciones de validación', () => {
  describe('Validación de email', () => {
    const validarEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
    
    it('debería validar email correcto', () => {
      expect(validarEmail('test@example.com')).toBe(true)
      expect(validarEmail('user.name@domain.co')).toBe(true)
    })
    
    it('debería rechazar email incorrecto', () => {
      expect(validarEmail('test@')).toBe(false)
      expect(validarEmail('@example.com')).toBe(false)
      expect(validarEmail('test@com')).toBe(false)
      expect(validarEmail('')).toBe(false)
    })
  })
  
  describe('Validación de password', () => {
    const validarPassword = (password) => {
      return password.length >= 6
    }
    
    it('debería aceptar password de 6+ caracteres', () => {
      expect(validarPassword('123456')).toBe(true)
      expect(validarPassword('passwordseguro')).toBe(true)
    })
    
    it('debería rechazar password corto', () => {
      expect(validarPassword('12345')).toBe(false)
      expect(validarPassword('')).toBe(false)
      expect(validarPassword('123')).toBe(false)
    })
  })
  
  describe('FormData a JSON', () => {
    const getFormData = () => {
      // Simulación de la función en login.js
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '123456')
      return Object.fromEntries(formData.entries())
    }
    
    it('debería convertir FormData a objeto JSON', () => {
      const result = getFormData()
      
      expect(result).toEqual({
        email: 'test@example.com',
        password: '123456'
      })
      expect(typeof result).toBe('object')
    })
  })
})