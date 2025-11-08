# 🌲 Aventura en el Bosque de los Desafíos 🌲

Un juego educativo interactivo desarrollado con Next.js 16, React 19 y shadcn/ui, diseñado para desarrollar la concentración, flexibilidad mental y motricidad fina en niños de 4 a 6 años.

## 🚀 Tecnologías

- **Next.js 16** - Framework de React con App Router (última versión)
- **React 19** - Biblioteca de UI (última versión)
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes de UI
- **pnpm** - Gestor de paquetes

## 📋 Características

- ✅ **Tablero de juego interactivo** con un bosque ilustrado
- ✅ **Sistema de turnos** con dados
- ✅ **Desafíos variados**:
  - 🎯 Clasificación: Arrastra objetos a sus categorías correctas
  - 🔢 Secuencias: Completa patrones lógicos
  - 🧩 Puzzles: Ordena elementos correctamente
- ✅ **Niveles de dificultad** (Fácil, Medio, Difícil)
- ✅ **Tiempo límite** configurable para desafíos
- ✅ **Modo individual y equipos**
- ✅ **Sistema de recompensas** por completar desafíos
- ✅ **Interfaz colorida y amigable** para niños

## 🛠️ Instalación

1. Clona el repositorio o descarga el código
2. Instala las dependencias:

```bash
pnpm install
```

3. Ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📦 Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción
- `pnpm lint` - Ejecuta el linter

## 🎮 Cómo Jugar

1. **Inicio**: Selecciona el número de jugadores (2-4)
2. **Configuración**: 
   - Elige el nivel de dificultad
   - Selecciona modo individual o equipos
   - Activa/desactiva el tiempo límite
3. **Turnos**: Cada jugador lanza el dado y avanza su ficha
4. **Desafíos**: Al caer en una casilla con desafío, resuelve el problema
5. **Recompensa**: Si completas el desafío correctamente, avanzas un espacio adicional
6. **Meta**: El primer jugador (o equipo) en llegar al final gana

## 🎯 Beneficios Educativos

- **Concentración**: Los niños deben enfocarse en resolver los desafíos
- **Flexibilidad mental**: Los desafíos variados ayudan a desarrollar el pensamiento flexible
- **Motricidad fina**: La manipulación de objetos en pantalla fomenta el desarrollo de la motricidad fina
- **Resolución de problemas**: Los desafíos promueven el pensamiento crítico

## 📁 Estructura del Proyecto

```
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página principal del juego
│   └── globals.css         # Estilos globales
├── components/
│   ├── game/               # Componentes del juego
│   │   ├── GameBoard.tsx
│   │   ├── StartModal.tsx
│   │   ├── ChallengeModal.tsx
│   │   ├── PlayerList.tsx
│   │   └── WinModal.tsx
│   └── ui/                 # Componentes de shadcn/ui
├── hooks/
│   └── useGame.ts          # Hook principal del juego
├── lib/
│   ├── types.ts            # Tipos TypeScript
│   ├── game-config.ts      # Configuración del juego
│   ├── challenge-generator.ts  # Generador de desafíos
│   └── utils.ts            # Utilidades
└── public/                 # Archivos estáticos
```

## 🎨 Personalización

Puedes personalizar el juego modificando:
- `lib/game-config.ts`: Tamaño del tablero, posiciones de desafíos, colores, etc.
- `lib/challenge-generator.ts`: Dificultad y tipos de desafíos
- `components/game/`: Componentes visuales del juego

## 📝 Notas

- El juego está optimizado para navegadores modernos
- Requiere JavaScript habilitado
- Responsive design para diferentes tamaños de pantalla
- Utiliza Next.js 16 con React 19 (últimas versiones)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para cualquier mejora.

---

¡Disfruta del juego! 🎉