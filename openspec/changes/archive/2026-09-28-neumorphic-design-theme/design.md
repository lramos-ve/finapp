## Context

Ver `proposal.md` para la motivación. Actualmente los estilos residen en `src/app.css` y asumen un esquema de color oscuro estático (`--bg: #0f172a`, `--panel: #1e293b`) basado en bordes delgados de 1px. Este diseño establece la arquitectura de tokens CSS para soportar Neumorfismo (Soft UI) tridimensional en Modo Claro y Modo Oscuro con alternancia dinámica en tiempo de ejecución.

## Goals / Non-Goals

**Goals:**
- Definir un sistema de tokens CSS semánticos (`--neu-elevated`, `--neu-inset`, `--neu-flat`) para luz y sombra.
- Soportar Modo Claro Neumórfico (paleta marfil/pizarra clara con alto relieve) y Modo Oscuro Neumórfico (paleta azul noche/carbón mate).
- Módulo `src/lib/theme.js` que gestione la inicialización, detección de `prefers-color-scheme` y persistencia en `localStorage`.
- Integrar botón de alternancia de tema (☀️/🌙) en el header de `src/App.svelte`.
- Rediseñar paneles, cards de balance, campos de texto, botones y controles segmentados con estética neumórfica consistente.

**Non-Goals:**
- Múltiples paletas de color personalizables por el usuario (más allá de claro/oscuro).
- Animaciones complejas 3D de GPU que puedan degradar el rendimiento móvil.

## Decisions

### 1. Variables de Tokens CSS Neumórficos
Se definen variables compartidas calculadas según el atributo `data-theme` en la raíz `<html>`:

- **Tokens Neumórficos:**
  - `--neu-elevated`: Doble sombra exterior (luz arriba-izquierda, sombra abajo-derecha) para tarjetas, paneles y botones en reposo.
  - `--neu-inset`: Doble sombra interior para inputs y botones presionados.
  - `--neu-hover`: Elevación pronunciada sutil al pasar el puntero.

- **Paletas:**
  - **Claro (`[data-theme='light']`):**
    - Fondo y Superficie: `#e4e9f2`
    - Sombra de Luz: `-6px -6px 14px rgba(255, 255, 255, 0.95)`
    - Sombra Oscura: `6px 6px 14px rgba(166, 178, 196, 0.7)`
    - Texto principal: `#1e293b`
  - **Oscuro (`[data-theme='dark']`):**
    - Fondo y Superficie: `#161c26`
    - Sombra de Luz: `-5px -5px 12px rgba(255, 255, 255, 0.04)`
    - Sombra Oscura: `6px 6px 14px rgba(0, 0, 0, 0.75)`
    - Texto principal: `#f1f5f9`

### 2. Módulo de Gestión de Tema (`src/lib/theme.js`)
- Clave de persistencia: `finapp_theme` (`'light'` | `'dark'`).
- En la carga: Si existe en `localStorage`, se usa; de lo contrario, se lee `window.matchMedia('(prefers-color-scheme: dark)').matches`.
- Modifica directamente el atributo `document.documentElement.setAttribute('data-theme', theme)` para evitar parpadeos (FOUC).

### 3. Transformación de Componentes a Soft UI
- **Paneles y Tarjetas:** Se sustituye el borde plano de 1px por `--neu-elevated` y bordes redondeados orgánicos (`border-radius: 16px`).
- **Inputs:** Fondo transparente/superficie con `--neu-inset`, brindando sensación de hendidura en la pantalla.
- **Controles Segmentados:** Contenedor con `--neu-inset`; el botón seleccionado adquiere relieve `--neu-elevated` con acento distintivo.
- **Botones de Envío / Acción:** Relieve convexo con transición instantánea a cóncavo (`:active { box-shadow: var(--neu-inset); }`).

## Risks / Trade-offs

- **[Riesgo] Contraste en modo claro:** El neumorfismo en modo claro puede perder contraste si las sombras son muy tenues o el texto no es suficientemente oscuro.
  - *Mitigación:* Se usan sombras oscuras con opacidad adecuada (`0.7`) y texto en slate-800 (`#1e293b`) que supera los ratios WCAG AA.
