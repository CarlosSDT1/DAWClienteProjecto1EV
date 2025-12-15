# DAWClienteProjecto1EV

**Juego de la Oca - Reactivo**
Un juego de la Oca moderno implementado con JavaScript, RxJS y programación reactiva, con autenticación y estadísticas en tiempo real.

## Características Principales

### Juego Completo
- Tablero 8x8 en formato serpiente
- Todas las casillas especiales: Ocas, Puentes, Posada, Pozo, Cárcel, Laberinto, Calavera, Meta
- Sistema de acumulación de dados (estrategia)
- Animaciones de movimiento suaves
- Guardado automático de partidas

### Autenticación Flexible
- Usuarios registrados: Guardan estadísticas en Supabase
- Modo invitado: Juegan sin registro con datos locales
- Control de acceso por roles
- Login y registro con validación en tiempo real

### Estadísticas Reactivas
- Historial de partidas completas
- Ratio de victorias/derrotas
- Gestión manual de resultados
- Estadísticas en tiempo real con RxJS

## Tecnologías Modernas
- RxJS para programación reactiva
- SPA (Single Page Application) con enrutamiento
- Bootstrap 5 para UI responsive
- Supabase para backend y autenticación
- Vite para desarrollo y construcción
- Vitest para testing
- ESLint configurado para mantener código limpio y consistente

## Enlace de Producción
La aplicación está desplegada en Vercel y puede accederse desde:
URL de producción: https://daw-cliente-projecto1-ev.vercel.app

## Instalación Local

### Requisitos Previos
- Node.js 16 o superior
- NPM 8 o superior

### Pasos de Instalación
1. Clonar el repositorio
git clone https://github.com/CarlosSDT1/DAWClienteProjecto1EV.git

text

2. Instalar dependencias
npm install

text

3. Configurar Supabase (opcional para desarrollo)
- Copiar .env.example a .env y configurar las variables

4. Ejecutar en desarrollo
npm run dev

text
La aplicación estará disponible en http://localhost:5173

5. Construir para producción
npm run build
npm run preview

text

## Uso de la Aplicación

### Como Invitado
1. Acceder a la aplicación desde el enlace de producción
2. Hacer clic en "Jugar como Invitado"
3. Puedes jugar partidas completas
4. Los datos se guardan localmente en el navegador

### Como Usuario Registrado
1. Crear una cuenta o iniciar sesión
2. Todas las partidas se sincronizan con Supabase
3. Acceso al historial completo de partidas
4. Estadísticas persistentes

**Nota sobre autenticación:** El registro funciona correctamente. También puedes entrar en modo invitado, pero en este modo no se mostrarán estadísticas.

## Mecánicas del Juego
- Tirar dado: Avanza el número de casillas indicado
- Pasar turno: Acumula dados para el siguiente turno (máximo 3)
- Casillas especiales: Siguen las reglas tradicionales del juego de la Oca
- Guardado automático: La partida se guarda automáticamente cada vez que hay cambios

**Nota sobre persistencia:** Los datos de la partida en curso se guardan en localStorage. Solo se envían a la base de datos Supabase al finalizar la partida.

**Condición de victoria:** Solo cuenta como victoria si gana el jugador azul.

## Configuración de Supabase
El proyecto ya está configurado con una base de datos Supabase que incluye:

### Tablas Configuradas
- oca_games: Almacena el historial de partidas
- player_stats: Guarda estadísticas de usuarios
- auth.users: Gestión de usuarios (proporcionada por Supabase)

### Políticas de Seguridad
- RLS (Row Level Security) habilitado
- Usuarios solo pueden acceder a sus propios datos
- Políticas de INSERT, SELECT, UPDATE, DELETE configuradas

## Testing
El proyecto incluye configuración para pruebas unitarias:
npm run test

text

## Características Técnicas

### Programación Reactiva con RxJS
- Observables para estado del juego
- Eventos reactivos para interacciones del usuario
- Actualizaciones en tiempo real de la interfaz
- Gestión de suscripciones automática

### Gestión de Estado
- Estado centralizado del juego
- Guardado automático en localStorage
- Restauración de partidas interrumpidas
- Serialización/deserialización eficiente

### Arquitectura Modular
- Separación clara de responsabilidades
- Componentes reutilizables
- Servicios independientes
- Enrutamiento SPA

## Despliegue
La aplicación está desplegada en Vercel con las siguientes configuraciones:

### Configuración de Vercel
- Build Command: npm run build
- Output Directory: dist
- Environment Variables:
  - SUPABASE_KEY: Configurada en el dashboard de Vercel
  - SUPABASE_URL: Configurada en el dashboard de Vercel

### Dominio Personalizado
La aplicación está disponible en: daw-cliente-projecto1-ev-48ig.vercel.app

## Licencia
Este proyecto está desarrollado como parte de un proyecto educativo. Ver archivo LICENSE para más detalles.

## Autor
Carlos Sigüenza de Toro - 2025

## Notas de Desarrollo
- El código sigue principios de programación reactiva
- Uso de ES6+ modules
- Bootstrap 5 para estilos responsivos
- Compatible con navegadores modernos
- Optimizado para rendimiento

**Nota importante:** Se ha identificado un error en el sistema de inactividad de casillas especiales (Posada, Pozo, Cárcel) que puede causar bloqueos de la ficha permanentes. Se recomienda reiniciar la partida si ocurre este problema o que continúen el resto de fichas no bloqueadas.