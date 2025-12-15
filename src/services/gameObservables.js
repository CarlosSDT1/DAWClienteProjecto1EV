// services/gameObservables.js - VERSIÓN SIMPLIFICADA Y FUNCIONAL
import { BehaviorSubject, Subject, combineLatest, fromEvent, merge, of } from 'rxjs';
import { map, filter, tap, debounceTime, distinctUntilChanged, shareReplay, switchMap, catchError } from 'rxjs/operators';

// Subject para eventos de juego
export const gameEvents$ = new Subject();

// BehaviorSubjects para estado reactivo
export const gameState$ = new BehaviorSubject(null);
export const currentPlayer$ = new BehaviorSubject(1);
export const gameActive$ = new BehaviorSubject(true);

// Observable para botones del juego
export const setupButtonObservables = () => {
  return fromEvent(document, 'DOMContentLoaded').pipe(
    switchMap(() => {
      const tirarDadoBtn = document.getElementById('tirar-dado');
      const pasarTurnoBtn = document.getElementById('pasar-turno');
      const reiniciarBtn = document.getElementById('reiniciar');
      const guardarBtn = document.getElementById('guardar-partida');
      
      if (!tirarDadoBtn || !pasarTurnoBtn || !reiniciarBtn) {
        console.warn('Botones no encontrados, reintentando en 500ms');
        return of(null);
      }
      
      const tirarDadoClick$ = fromEvent(tirarDadoBtn, 'click').pipe(
        debounceTime(300),
        tap(() => console.log('Botón tirar dado clickeado'))
      );
      
      const pasarTurnoClick$ = fromEvent(pasarTurnoBtn, 'click').pipe(
        debounceTime(300),
        tap(() => console.log('Botón pasar turno clickeado'))
      );
      
      const reiniciarClick$ = fromEvent(reiniciarBtn, 'click').pipe(
        debounceTime(300),
        tap(() => console.log('Botón reiniciar clickeado'))
      );
      
      const guardarClick$ = guardarBtn ? fromEvent(guardarBtn, 'click').pipe(
        debounceTime(300),
        tap(() => console.log('Botón guardar clickeado'))
      ) : of(null).pipe(filter(() => false));
      
      return merge(
        tirarDadoClick$.pipe(map(() => ({ type: 'BUTTON_CLICK', button: 'tirar-dado' }))),
        pasarTurnoClick$.pipe(map(() => ({ type: 'BUTTON_CLICK', button: 'pasar-turno' }))),
        reiniciarClick$.pipe(map(() => ({ type: 'BUTTON_CLICK', button: 'reiniciar' }))),
        guardarClick$.pipe(map(() => ({ type: 'BUTTON_CLICK', button: 'guardar' })))
      );
    }),
    filter(event => event !== null),
    catchError(error => {
      console.error('Error en setupButtonObservables:', error);
      return of(null).pipe(filter(() => false));
    })
  );
};

// Función para emitir eventos
export const emitGameEvent = (type, data) => {
  const event = { 
    type, 
    ...data, 
    timestamp: new Date().toISOString(),
    id: Math.random().toString(36).substr(2, 9)
  };
  gameEvents$.next(event);
  return event;
};

// Observable para teclas presionadas (accesibilidad)
export const keyPresses$ = fromEvent(document, 'keydown').pipe(
  filter(event => [' ', 'Enter', '1', '2', '3', '4'].includes(event.key)),
  map(event => ({
    key: event.key,
    code: event.code,
    timestamp: new Date().toISOString()
  })),
  tap(() => {
  })
);

// Suscripción para combinar teclas y clicks
export const userInteractions$ = merge(
  setupButtonObservables(),
  keyPresses$.pipe(map(key => ({ type: 'KEY_PRESS', key: key.key })))
).pipe(
  filter(event => event !== null),
  tap(interaction => {
    console.log('Interacción del usuario:', interaction.type);
  })
);

// Función para obtener estadísticas en tiempo real
export const getGameStats$ = () => {
  return gameState$.pipe(
    filter(state => state !== null),
    map(state => {
      const { jugadores, turnoActual, juegoActivo } = state; // Object destructuring
      const playersArray = Object.values(jugadores);
      
      return {
        activePlayers: playersArray.filter(p => !p.terminado).length,
        inactivePlayers: playersArray.filter(p => state.jugadoresInactivos.has(p.id)).length,
        finishedPlayers: playersArray.filter(p => p.terminado).length,
        currentTurn: turnoActual,
        gameActive: juegoActivo,
        averageTurns: playersArray.reduce((sum, p) => sum + p.turnos, 0) / playersArray.length,
        positions: playersArray.map(p => ({ 
          name: p.nombre, 
          position: p.posicion,
          turns: p.turnos 
        })).sort((a, b) => b.position - a.position)
      };
    }),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    shareReplay(1)
  );
};

// Suscripción automática para logs de eventos
const eventLogSubscription = gameEvents$.subscribe(event => {
  console.log('Evento de juego:', event.type, {
    playerId: event.playerId,
    timestamp: event.timestamp
  });
});

// Iniciar observables
export const initGameObservables = () => {
  // Configurar suscripción a interacciones
  const interactionsSub = userInteractions$.subscribe(interaction => {
    if (interaction.type === 'BUTTON_CLICK') {
      console.log(`Botón ${interaction.button} clickeado via rxjs`);
    }
  });
  
  console.log('Observables de juego inicializados con rxjs');
  
  return () => {
    eventLogSubscription.unsubscribe();
    interactionsSub.unsubscribe();
    console.log('Observables limpiados');
  };
};

// Exportar observable combinado si se necesita
export const allObservables$ = combineLatest([
  gameState$,
  currentPlayer$,
  gameActive$,
  getGameStats$()
]).pipe(
  map(([gameState, currentPlayer, gameActive, stats]) => ({
    gameState,
    currentPlayer,
    gameActive,
    stats,
    timestamp: new Date().toISOString()
  })),
  debounceTime(100),
  shareReplay(1)
);