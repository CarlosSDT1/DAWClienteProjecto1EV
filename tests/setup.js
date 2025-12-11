// tests/setup.js - VERSIÓN SIMPLIFICADA
import { vi } from 'vitest'

// Mock global para localStorage
const localStorageMock = {
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
}

global.localStorage = localStorageMock

// Mock para Math.random (opcional, elimínalo si da problemas)
global.Math.random = vi.fn(() => 0.5) // Siempre devuelve 0.5 para tests predecibles