## 1. Iconos y Estilos Base

- [x] 1.1 Añadir iconos `chevron-left` y `chevron-right` a `src/modules/shared/components/Icon.svelte`.
- [x] 1.2 Actualizar `src/app.css` con estilos neumórficos para elementos `<select>` y el contenedor del popover de calendario.

## 2. Componente de Calendario Neumórfico

- [x] 2.1 Crear `src/modules/shared/components/DatePicker.svelte` con navegación de mes/año, selección de día, botón "Hoy" y control de visibilidad al hacer clic fuera o pulsar escape.
- [x] 2.2 Crear pruebas unitarias para `DatePicker` en `src/test/datepicker.test.js`.

## 3. Integración en Formularios

- [x] 3.1 Reemplazar `<input type="date">` por `<DatePicker />` en `src/modules/transacciones/components/TransactionForm.svelte`.
- [x] 3.2 Reemplazar `<input type="date">` por `<DatePicker />` en `src/modules/deudas/components/DebtForm.svelte` y `src/modules/deudas/components/DebtPaymentModal.svelte`.
- [x] 3.3 Reemplazar `<input type="date">` por `<DatePicker />` en `src/modules/gastos-fijos/components/FixedExpenseList.svelte`.

## 4. Verificación

- [x] 4.1 Ejecutar suite de pruebas con `npm test` verificando que el 100% pase sin errores.
- [x] 4.2 Probar con Puppeteer la apertura del calendario, selección de fecha, navegación de meses y renderizado neumórfico en modo claro y oscuro.
