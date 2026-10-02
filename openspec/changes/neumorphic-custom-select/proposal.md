## Why

Actualmente, controles como la selección de categorías en el formulario de transacciones (que utiliza `<input list="...">` con `<datalist>`) y los selectores de filtros o períodos (`<select>`) abren listas desplegables nativas del sistema operativo/navegador. Estas listas emergentes nativas rompen la consistencia visual de la aplicación, carecen de efectos neumórficos (sombras duales, elevación táctil) y tienen problemas de contraste o apariencia dispar entre diferentes dispositivos móviles y navegadores.

## What Changes

- Crear un componente reutilizable `Select.svelte` (o `CustomSelect.svelte`) en `src/modules/shared/components/` con menú desplegable emergente neumórfico.
- Soportar modo selección estándar (estilo `<select>`) y modo autocompletable/escribible (estilo `combobox` / `<datalist>`), permitiendo al usuario tanto elegir una opción existente con relieve táctil como escribir un valor personalizado (ideal para categorías de transacciones).
- Integrar el componente en:
  - Formulario de transacciones (`TransactionForm.svelte`) para el campo de categoría (con opciones predeterminadas y sugerencias).
  - Filtros de transacciones (`TransactionFilters.svelte`) para la selección de categoría.
  - Módulo de estadísticas (`StatisticsView.svelte`) para la selección de período.
- Proveer soporte completo para navegación con teclado (flechas arriba/abajo, Enter, Escape, Tab), accesibilidad y cierre al hacer clic fuera.
- Aplicar diseño neumórfico coherente tanto en Modo Claro como en Modo Oscuro (superficie emergente elevada, opciones destacadas al interactuar y bordes suaves).

## Capabilities

### Modified Capabilities
- `neumorphic-theme`: Actualizar el requisito de menús y listas desplegables para exigir que los desplegables de selección y autocompletado utilicen componentes emergentes neumórficos integrados en lugar de menús desplegables nativos del sistema operativo.

## Impact

- Componentes afectados:
  - `src/modules/shared/components/Select.svelte` (nuevo).
  - `src/modules/transacciones/components/TransactionForm.svelte`.
  - `src/modules/transacciones/components/TransactionFilters.svelte`.
  - `src/modules/estadisticas/components/StatisticsView.svelte`.
  - `src/app.css` (estilos neumórficos complementarios para menús desplegables).
- Pruebas y verificación:
  - Nuevas pruebas unitarias para `Select.svelte`.
  - Validación con Vitest y verificación visual en navegadores/móvil con Puppeteer en modo claro y oscuro.
