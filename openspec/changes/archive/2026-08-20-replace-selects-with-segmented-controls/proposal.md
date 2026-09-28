## Why

Actualmente los formularios y filtros de la aplicación utilizan menús desplegables HTML tradicionales (`<select>`). En dispositivos móviles y de escritorio, esto exige múltiples toques/clics (abrir el desplegable y seleccionar la opción), dificultando el registro rápido de movimientos cotidianos.

## What Changes

- Sustitución de los menús desplegables (`<select>`) por controles segmentados táctiles de selección directa (Segmented Controls / grupos de botones tipo radio estilizados).
- Aplicación de selección con un solo toque para:
  - Tipo de transacción (`Gasto` / `Ingreso`).
  - Moneda (`USD` / `VES`) en transacciones, abonos y pagos de gastos fijos.
  - Dirección de deuda (`Debo` / `Me deben`).
  - Filtros por tipo y moneda en la lista de transacciones.
- Feedback visual claro indicando el estado activo de cada opción.

## Capabilities

### New Capabilities
- `ui-segmented-controls`: Define el estándar de selección rápida mediante controles segmentados interactivos para opciones binarias y de selección fija en formularios y filtros.

### Modified Capabilities
<!-- Ninguna especificación lógica previa cambia; los requerimientos de datos permanecen intactos. -->

## Impact

- **Componentes Svelte**: `TransactionsView.svelte`, `DebtsView.svelte`, `FixedExpensesView.svelte`.
- **Estilos**: `src/app.css` (estilos para botones de control segmentado).
- **Sin impacto en datos**: No modifica esquemas de Dexie (IndexedDB), ni la lógica de cálculo financiero.
