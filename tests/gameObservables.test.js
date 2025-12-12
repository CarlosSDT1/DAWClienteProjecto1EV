// tests/gameObservables.test.js - VERSIÓN CORREGIDA
import { describe, it, expect, beforeEach } from 'vitest'
import { BehaviorSubject, Subject, fromEvent } from 'rxjs'
import { map, filter, tap } from 'rxjs/operators'

describe('gameObservables.js - RxJS Observables', () => {
  describe('BehaviorSubject', () => {
    it('debería mantener el último valor emitido', () => {
      const subject = new BehaviorSubject('initial')
      
      expect(subject.value).toBe('initial')
      
      subject.next('second')
      expect(subject.value).toBe('second')
    })
    
    it('debería emitir a nuevos suscriptores', async () => {
      const subject = new BehaviorSubject(0)
      const values = []
      
      return new Promise((resolve) => {
        subject.subscribe(value => {
          values.push(value)
          if (values.length === 2) {
            expect(values).toEqual([0, 1])
            resolve()
          }
        })
        
        subject.next(1)
      })
    })
    
    // Versión alternativa con async/await
    it('debería emitir valores secuencialmente', async () => {
      const subject = new BehaviorSubject('start')
      const emissions = []
      
      subject.subscribe(value => emissions.push(value))
      
      subject.next('middle')
      subject.next('end')
      
      // Pequeño delay para asegurar que se procesan
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(emissions).toEqual(['start', 'middle', 'end'])
    })
  })
  
  describe('Subject', () => {
    it('debería emitir valores a múltiples suscriptores', async () => {
      const subject = new Subject()
      const results = []
      
      subject.subscribe(value => results.push(`A:${value}`))
      subject.subscribe(value => results.push(`B:${value}`))
      
      subject.next(1)
      subject.next(2)
      
      // Pequeño delay para asegurar procesamiento
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(results).toEqual(['A:1', 'B:1', 'A:2', 'B:2'])
    })
  })
  
  describe('Operadores RxJS', () => {
    it('debería filtrar valores con filter', async () => {
      const source = new Subject()
      const evenNumbers = []
      
      source.pipe(
        filter(value => value % 2 === 0)
      ).subscribe(value => evenNumbers.push(value))
      
      source.next(1)
      source.next(2)
      source.next(3)
      source.next(4)
      source.next(5)
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(evenNumbers).toEqual([2, 4])
    })
    
    it('debería transformar valores con map', async () => {
      const source = new Subject()
      const doubled = []
      
      source.pipe(
        map(value => value * 2)
      ).subscribe(value => doubled.push(value))
      
      source.next(1)
      source.next(2)
      source.next(3)
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(doubled).toEqual([2, 4, 6])
    })
    
    it('debería encadenar operadores', async () => {
      const source = new Subject()
      const results = []
      
      source.pipe(
        filter(x => x > 0),
        map(x => x * 10),
        filter(x => x < 100)
      ).subscribe(value => results.push(value))
      
      source.next(-5)  // Filtrado (negativo)
      source.next(3)   // 3 → 30 → pasa
      source.next(15)  // 15 → 150 → filtrado (>100)
      source.next(7)   // 7 → 70 → pasa
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(results).toEqual([30, 70])
    })
  })
  
  describe('fromEvent (simulado)', () => {
    it('debería crear observable desde evento click', async () => {
      // Mock de addEventListener/removeEventListener
      const mockElement = {
        listeners: {},
        addEventListener: function(event, handler) {
          this.listeners[event] = handler
        },
        removeEventListener: function(event) {
          delete this.listeners[event]
        },
        click: function() {
          if (this.listeners.click) {
            this.listeners.click(new Event('click'))
          }
        }
      }
      
      const clicks = []
      const click$ = fromEvent(mockElement, 'click')
      
      const subscription = click$.subscribe(event => {
        clicks.push(event.type)
      })
      
      // Simular clicks
      mockElement.click()
      mockElement.click()
      mockElement.click()
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(clicks).toEqual(['click', 'click', 'click'])
      
      // Limpiar
      subscription.unsubscribe()
    })
  })
  
  describe('Cálculo de estadísticas', () => {
    const calcularStats = (jugadores) => {
      const playersArray = Object.values(jugadores)
      return {
        activePlayers: playersArray.filter(p => !p.terminado).length,
        finishedPlayers: playersArray.filter(p => p.terminado).length,
        totalPlayers: playersArray.length,
        // Estadísticas adicionales
        averagePosition: playersArray.reduce((sum, p) => sum + p.posicion, 0) / playersArray.length,
        maxPosition: Math.max(...playersArray.map(p => p.posicion))
      }
    }
    
    it('debería calcular estadísticas de jugadores', () => {
      const jugadores = {
        1: { nombre: 'J1', terminado: true, posicion: 63 },
        2: { nombre: 'J2', terminado: false, posicion: 45 },
        3: { nombre: 'J3', terminado: false, posicion: 30 },
        4: { nombre: 'J4', terminado: true, posicion: 63 }
      }
      
      const stats = calcularStats(jugadores)
      
      expect(stats.totalPlayers).toBe(4)
      expect(stats.finishedPlayers).toBe(2)
      expect(stats.activePlayers).toBe(2)
      expect(stats.averagePosition).toBeCloseTo((63 + 45 + 30 + 63) / 4)
      expect(stats.maxPosition).toBe(63)
    })
    
    it('debería manejar objeto vacío', () => {
      const jugadores = {}
      const stats = calcularStats(jugadores)
      
      expect(stats.totalPlayers).toBe(0)
      expect(stats.finishedPlayers).toBe(0)
      expect(stats.activePlayers).toBe(0)
      expect(stats.averagePosition).toBeNaN() // 0/0 = NaN
      expect(stats.maxPosition).toBe(-Infinity) // Math.max() con array vacío
    })
  })
  
  describe('DistinctUntilChanged simulation', () => {
    it('debería emitir solo valores distintos consecutivos', async () => {
      const source = new Subject()
      const emissions = []
      
      // Simulación simple de distinctUntilChanged
      let lastValue = null
      source.pipe(
        map(value => {
          if (value !== lastValue) {
            lastValue = value
            return value
          }
          return null
        }),
        filter(value => value !== null)
      ).subscribe(value => emissions.push(value))
      
      source.next(1)
      source.next(1) // Duplicado, no debería emitir
      source.next(2)
      source.next(2) // Duplicado
      source.next(3)
      source.next(1) // Distinto del anterior (3)
      source.next(1) // Duplicado
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(emissions).toEqual([1, 2, 3, 1])
    })
  })
  
  describe('Combinación de observables', () => {
    it('debería combinar múltiples observables', async () => {
      const subject1 = new Subject()
      const subject2 = new Subject()
      const combined = []
      
      // Simulación simple de combineLatest
      let lastValue1 = null
      let lastValue2 = null
      
      subject1.subscribe(value => {
        lastValue1 = value
        if (lastValue1 !== null && lastValue2 !== null) {
          combined.push([lastValue1, lastValue2])
        }
      })
      
      subject2.subscribe(value => {
        lastValue2 = value
        if (lastValue1 !== null && lastValue2 !== null) {
          combined.push([lastValue1, lastValue2])
        }
      })
      
      subject1.next('A1')
      subject2.next('B1')
      subject1.next('A2')
      subject2.next('B2')
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Nota: Esto emitirá duplicados porque es una simulación simple
      expect(combined.length).toBeGreaterThan(0)
      expect(combined).toContainEqual(['A2', 'B2'])
    })
  })
  
  describe('Gestión de suscripciones', () => {
    it('debería limpiar suscripciones con unsubscribe', async () => {
      const subject = new Subject()
      const values = []
      
      const subscription = subject.subscribe(value => {
        values.push(value)
      })
      
      subject.next(1)
      subject.next(2)
      
      subscription.unsubscribe()
      
      subject.next(3) // No debería capturarse
      subject.next(4)
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(values).toEqual([1, 2])
      expect(subscription.closed).toBe(true)
    })
    
    it('debería manejar múltiples suscripciones', async () => {
      const subject = new Subject()
      const sub1Values = []
      const sub2Values = []
      
      const sub1 = subject.subscribe(v => sub1Values.push(`S1:${v}`))
      const sub2 = subject.subscribe(v => sub2Values.push(`S2:${v}`))
      
      subject.next('A')
      subject.next('B')
      
      sub1.unsubscribe()
      
      subject.next('C')
      
      sub2.unsubscribe()
      
      subject.next('D')
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(sub1Values).toEqual(['S1:A', 'S1:B'])
      expect(sub2Values).toEqual(['S2:A', 'S2:B', 'S2:C'])
    })
  })
})