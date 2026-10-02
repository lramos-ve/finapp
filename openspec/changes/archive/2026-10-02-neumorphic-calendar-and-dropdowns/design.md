## Context

Actualmente la aplicación utiliza controles nativos HTML5 `<input type="date">` para capturar fechas en transacciones, deudas y gastos fijos, así como elementos `<select>` y `<input list="...">` para la selección de períodos y categorías. Al interactuar con estos elementos, los navegadores (especialmente móviles y navegadores basados en Chromium/WebKit) abren selectores con la interfaz estándar del sistema operativo, desentonando con el diseño neumórfico oscuro y claro de la aplicación.

## Goals / Non-Goals

**Goals:**
- Diseñar e implementar un componente reutilizable `DatePicker.svelte` en `src/modules/shared/components/` con estilo neumórfico (Soft UI).
- Proveer selección interactiva de año, mes y día, navegación anterior/siguiente y acceso rápido al día actual ("Hoy").
- Garantizar que el popup de calendario se adapte fluidamente a temas claro y oscuro, con sombras duales y resaltado accesible de la fecha seleccionada.
- Soportar interacción táctil y de ratón con cierre al hacer clic fuera (*click outside*) o presionar Escape.
- Reemplazar todos los `<input type="date">` en `TransactionForm.svelte`, `DebtForm.svelte`, `DebtPaymentModal.svelte` y `FixedExpenseList.svelte`.
- Estilizar de forma neumórfica los controles `<select>` y listas desplegables en `src/app.css`.

**Non-Goals:**
- Introducir librerías pesadas externas de terceros (como Flatpickr o date-fns); el componente se construirá puramente con Svelte 5 nativo y CSS neumórfico.
- Selección de rangos de fechas múltiples o selector de horas (fuera del alcance requerido por la aplicación).

## Decisions

### 1. Componente propio `DatePicker.svelte`
- **Decisión:** Implementar `DatePicker.svelte` en `src/modules/shared/components/` con enlace reactivo bidireccional `bind:value` en formato estándar `YYYY-MM-DD`.
- **Razón:** Mantiene cero dependencias externas, peso ligero, máxima coherencia visual con las variables CSS del proyecto (`--bg`, `--neu-elevated`, `--neu-inset`, `--acento`) y soporte óptimo para Svelte 5 Runes.
- **Alternativas consideradas:** Usar una librería externa como `flatpickr`. Descartada para evitar añadir dependencias innecesarias y estilos difíciles de acoplar al sistema neumórfico.

### 2. Estructura y comportamiento del DatePicker
- **Disparador:** Campo de texto estilizado que muestra la fecha seleccionada formateada (ej. `2 oct. 2026` o `YYYY-MM-DD`) junto a un icono vectorial `calendar`. Al hacer clic, abre o cierra el popup.
- **Panel emergente (*Popover*):**
  - Contenedor con sombra neumórfica elevada `var(--neu-elevated)`.
  - Barra superior con selector de mes y año con botones `chevron-left` y `chevron-right`.
  - Fila de días de la semana (`Lun`, `Mar`, `Mié`, `Jue`, `Vie`, `Sáb`, `Dom`).
  - Matriz de 35 a 42 casillas para los días del mes, con días fuera de rango atenuados.
  - Día seleccionado con estilo neumórfico hendido (`--neu-inset`) y acento de color.
  - Botón "Hoy" para seleccionar rápidamente la fecha actual.
- **Gestión de eventos:** Escucha global en `window` para detectar clics exteriores y tecla `Escape` para cerrar el calendario.

### 3. Iconos adicionales en `Icon.svelte`
- **Decisión:** Añadir `chevron-left` y `chevron-right` a `src/modules/shared/components/Icon.svelte` para la navegación mensual del calendario.

### 4. Estilos neumórficos para `<select>` y menús desplegables
- **Decisión:** En `src/app.css`, aplicar a los elementos `select`:
  - `appearance: none` con un icono SVG de flecha incrustado vía `background-image` en el extremo derecho.
  - Sombra interior `var(--neu-inset-sm)`.
  - Fondo `var(--bg)` y color `var(--texto)`.
  - Opciones (`option`) estilizadas con fondos adaptados a modo claro y oscuro.

## Risks / Trade-offs

- **[Riesgo]** Posicionamiento del popover en pantallas móviles pequeñas.
  - **Mitigación:** Usar posicionamiento relativo con límites máximos de ancho (`max-width: 100%`) y sombras contenidas, o despliegue flotante centrado en pantallas estrechas.
- **[Riesgo]** Compatibilidad de formularios con validación `required`.
  - **Mitigación:** `DatePicker` incluirá un input oculto o validación interna que reporta validez HTML5 en caso de requerir el campo.
