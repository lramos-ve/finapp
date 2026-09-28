## Why

FinApp cuenta actualmente con una interfaz plana oscura básica con bordes lineales estáticos, sin soporte para modo claro ni una jerarquía visual táctil. El diseño neumórfico (*Soft UI*) proporciona una sensación física tridimensional y fluida donde los elementos parecen esculpidos directamente en la superficie. Incorporar este sistema visual junto con un selector de tema Claro / Oscuro mejora drásticamente la ergonomía, accesibilidad y experiencia de usuario en dispositivos móviles y de escritorio.

## What Changes

- **Sistema de diseño Neumórfico completo en CSS:**
  - Variables semánticas para sombras duales convexas (elementos elevados: paneles, tarjetas, botones en reposo) y cóncavas (elementos hundidos: inputs, botones activos/presionados, controles segmentados seleccionados).
  - Suavizado de bordes y esquinas redondeadas táctiles.
- **Soporte de Tema Dual (Claro y Oscuro):**
  - **Modo Claro Neumórfico:** Paleta clásica Soft UI (base gris claro neutro `#e2e8f0` / `#e0e5ec`) con sombras de luz blanca y sombras oscuras suaves de alto contraste táctil.
  - **Modo Oscuro Neumórfico:** Paleta grafito/pizarra mate (`#181e29` / `#1e2430`) con luces tenues y sombras profundas, eliminando bordes toscos.
- **Selector de Tema:**
  - Botón selector en la cabecera (Header) para alternar entre Modo Claro y Modo Oscuro, con detección automática inicial según la preferencia del sistema operativo (`prefers-color-scheme`) y persistencia en `localStorage`.
- **Actualización de componentes:**
  - Tarjetas de balance y paneles con elevación neumórfica convexa.
  - Controles segmentados con efecto táctil: botón activo visiblemente hundido con relieve interior.
  - Inputs con hendidura cóncava natural.
  - Botones de acción con microinteracciones al tacto/clic (`:active` pasa de relieve a hundido).

## Capabilities

### New Capabilities
- `neumorphic-theme`: Sistema visual neumórfico con soporte para temas claro y oscuro, sombras duales convexas/cóncavas y control interactivo de cambio de tema con persistencia.

### Modified Capabilities
<!-- No se modifican las especificaciones funcionales existentes de transacciones, deudas o respaldos. -->

## Impact

- **Código afectado:**
  - Refactorización de variables de diseño y reglas base en `src/app.css`.
  - Creación de un servicio o store de tema en `src/lib/theme.js`.
  - Inclusión del botón de cambio de tema en `src/App.svelte`.
  - Ajustes de estilo en componentes (`TransactionsView`, `DebtsView`, `FixedExpensesView`, `BackupView`, `P2PSyncModal`).
- **Dependencias:**
  - Ninguna dependencia externa adicional (100% CSS puro y JavaScript vanilla reactivo con Svelte 5).
