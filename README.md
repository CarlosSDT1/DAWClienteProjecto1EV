# DAWClienteProjecto1EV

Juego de la Oca - Reactivo
Un juego de la Oca moderno implementado con JavaScript, RxJS y programación reactiva, con autenticación y estadísticas en tiempo real.

Características Principales
Juego Completo
Tablero 8x8 en formato serpiente

Todas las casillas especiales: Ocas, Puentes, Posada, Pozo, Cárcel, Laberinto, Calavera, Meta

Sistema de acumulación de dados (estrategia)

Animaciones de movimiento suaves

Guardado automático de partidas

Autenticación Flexible
Usuarios registrados: Guardan estadísticas en Supabase

Modo invitado: Juegan sin registro con datos locales

Control de acceso por roles

Login y registro con validación en tiempo real

Estadísticas Reactivas
Historial de partidas completas

Ratio de victorias/derrotas

Gestión manual de resultados

Estadísticas en tiempo real con RxJS

Tecnologías Modernas
RxJS para programación reactiva

SPA (Single Page Application) con enrutamiento

Bootstrap 5 para UI responsive

Supabase para backend y autenticación

Vite para desarrollo y construcción

Vitest para testing

Enlace de Producción
La aplicación está desplegada en Vercel y puede accederse desde:
URL de producción: https://daw-cliente-projecto1-ev.vercel.app

Estructura del Proyecto
text
project/
├── src/
│   ├── components/
│   │   ├── header.js        # Navegación con control de acceso
│   │   ├── login.js         # Formularios de login/registro
│   │   ├── stats.js         # Panel de estadísticas
│   │   └── footer.js        # Pie de página
│   │
│   ├── game/
│   │   ├── juego.js         # Lógica principal del juego
│   │   ├── state/
│   │   │   └── gameState.js # Gestión del estado y guardado
│   │   ├── board/
│   │   │   └── boardManager.js # Creación del tablero
│   │   ├── ui/
│   │   │   ├── boardRenderer.js # Renderizado del tablero
│   │   │   └── gameUI.js    # Interfaz de usuario del juego
│   │   ├── players/
│   │   │   └── playerManager.js # Gestión de jugadores
│   │   ├── dice/
│   │   │   └── diceManager.js # Lógica de los dados
│   │   ├── specialCells/
│   │   │   └── specialCells.js # Casillas especiales
│   │   ├── animations/
│   │   │   └── animationManager.js # Animaciones
│   │   └── stats/
│   │       └── gameStats.js # Estadísticas del juego
│   │
│   ├── services/
│   │   ├── supaservice.js   # Integración con Supabase
│   │   ├── gameObservables.js # Observables del juego
│   │   ├── statsObservables.js # Observables de estadísticas
│   │   └── statsService.js  # Servicio de estadísticas
│   │
│   ├── router.js            # Enrutador SPA
│   ├── main.js              # Punto de entrada
│   ├── env.js               # Variables de entorno
│   └── scss/
│       └── style.scss       # Estilos principales
│
├── public/                  # Recursos estáticos
├── tests/                   # Tests unitarios
├── package.json
├── vite.config.js
├── vitest.config.js
└── README.md
Instalación Local
Requisitos Previos
Node.js 16 o superior

NPM 8 o superior

Pasos de Instalación
Clonar el repositorio

bash
git clone https://github.com/CarlosSDT1/DAWClienteProjecto1EV.git
Instalar dependencias

bash
npm install
Configurar Supabase (opcional para desarrollo)

npm run dev
La aplicación estará disponible en http://localhost:5173

Construir para producción

bash
npm run build
npm run preview
Uso de la Aplicación
Como Invitado
Acceder a la aplicación desde el enlace de producción

Hacer clic en "Jugar como Invitado"

Puedes jugar partidas completas

Los datos se guardan localmente en el navegador

Como Usuario Registrado
Crear una cuenta o iniciar sesión

Todas las partidas se sincronizan con Supabase

Acceso al historial completo de partidas

Estadísticas persistentes

Mecánicas del Juego
Tirar dado: Avanza el número de casillas indicado

Pasar turno: Acumula dados para el siguiente turno (máximo 3)

Casillas especiales: Siguen las reglas tradicionales del juego de la Oca

Guardado automático: La partida se guarda automáticamente cada vez que hay cambios

Errores Conocidos
Error de Bloqueo Permanente en Casillas Especiales
Descripción del problema: Cuando un jugador cae en las casillas de Posada (casilla 19), Pozo (casilla 31) o Cárcel (casilla 52), la ficha puede quedar permanentemente bloqueada y no recuperar su turno.

Casos específicos:

Posada (casilla 19): El jugador debería perder solo 1 turno, pero queda bloqueado indefinidamente.

Pozo (casilla 31): El jugador debería quedar inactivo hasta que otro jugador pase por la misma casilla, pero la liberación no funciona desde que lo hize reactivo.

Cárcel (casilla 52): El jugador debería perder 2 turnos, pero puede quedar bloqueado indefinidamente.

Posibles causas:

El sistema de contadores de inactividad no se reinicia correctamente

Problemas en la función procesarInactividades() en specialCells.js

Errores en la lógica de liberación del pozo

Solución temporal:

Reiniciar la partida desde el botón "Nueva Partida"

Como alternativa, el modo invitado reinicia automáticamente al recargar la página

Estado: Este error está siendo investigado y se espera resolver en futuras actualizaciones.

Configuración de Supabase
El proyecto ya está configurado con una base de datos Supabase que incluye:

Tablas Configuradas
oca_games: Almacena el historial de partidas

player_stats: Guarda estadísticas de usuarios

auth.users: Gestión de usuarios (proporcionada por Supabase)

Políticas de Seguridad
RLS (Row Level Security) habilitado

Usuarios solo pueden acceder a sus propios datos

Políticas de INSERT, SELECT, UPDATE, DELETE configuradas

Testing
El proyecto incluye configuración para pruebas unitarias:

bash
# Ejecutar tests
npm run test

Características Técnicas
Programación Reactiva con RxJS
Observables para estado del juego

Eventos reactivos para interacciones del usuario

Actualizaciones en tiempo real de la interfaz

Gestión de suscripciones automática

Gestión de Estado
Estado centralizado del juego

Guardado automático en localStorage

Restauración de partidas interrumpidas

Serialización/deserialización eficiente

Arquitectura Modular
Separación clara de responsabilidades

Componentes reutilizables

Servicios independientes

Enrutamiento SPA

Despliegue
La aplicación está desplegada en Vercel con las siguientes configuraciones:

Configuración de Vercel
Build Command: npm run build

Output Directory: dist

Environment Variables:

SUPABASE_KEY: Configurada en el dashboard de Vercel

SUPABASE_URL: Configurada en el dashboard de Vercel

Dominio Personalizado
La aplicación está disponible en: daw-cliente-projecto1-ev-48ig.vercel.app

Licencia
Este proyecto está desarrollado como parte de un proyecto educativo. Ver archivo LICENSE para más detalles.

Autor
Carlos Sigüenza de Toro - 2025

Notas de Desarrollo
El código sigue principios de programación reactiva

Uso de ES6+ modules

Bootstrap 5 para estilos responsivos

Compatible con navegadores modernos

Optimizado para rendimiento

Nota importante: Se ha identificado un error en el sistema de inactividad de casillas especiales (Posada, Pozo, Cárcel) que puede causar bloqueos de la ficha permanentes. Se recomienda reiniciar la partida si ocurre este problema o que continuen el resto de fichas no bloqueadas.