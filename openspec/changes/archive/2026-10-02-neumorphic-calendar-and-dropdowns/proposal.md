## Why

Actualmente, los campos de fecha de la aplicación utilizan el control nativo del navegador (`<input type="date">`), el cual despliega un cuadro de diálogo del sistema operativo ajeno a la identidad visual de la aplicación. Esto rompe la inmersión en la estética neumórfica (Soft UI), especialmente en modo oscuro y en dispositivos móviles. Asimismo, las listas desplegables y menús de selección requieren una armonización completa con las sombras duales y acabados táctiles del sistema de diseño.

## What Changes

- Crear un componente reutilizable `DatePicker.svelte` en `src/modules/shared/components/` con calendario emergente interactivo, navegación de meses/años con botones de relieve suave, selección táctil de días, indicador del día actual y cierre al hacer clic fuera o pulsar escape.
- Reemplazar los controles `<input type="date">` nativos en los formularios de:
  - Transacciones (`TransactionForm.svelte`).
  - Deudas (`DebtForm.svelte` y `DebtPaymentModal.svelte`).
  - Gastos Fijos (`FixedExpenseList.svelte`).
- Estilizar menús desplegables (`<select>` y listas sugeridas) con estética neumórfica consistente (sombras interiores, bordes redondeados y tipografía adaptativa tanto en modo claro como en modo oscuro).

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad de dominio; se amplía el sistema visual de componentes -->

### Modified Capabilities
- `neumorphic-theme`: Incorpora requisitos de diseño e interacción para el selector de fechas emergente y el acabado de listas desplegables bajo estética neumórfica.

## Impact

- **Componentes creados/modificados:**
  - `src/modules/shared/components/DatePicker.svelte` (nuevo componente de fecha neumórfico).
  - `src/modules/transacciones/components/TransactionForm.svelte`.
  - `src/modules/deudas/components/DebtForm.svelte`.
  - `src/modules/deudas/components/DebtPaymentModal.svelte`.
  - `src/modules/gastos-fijos/components/FixedExpenseList.svelte`.
  - `src/app.css` (estilos neumórficos para el calendario y selects).
- **Pruebas:**
  - `src/test/datepicker.test.js` (pruebas unitarias de selección de fecha, formateo y navegación de calendario).
