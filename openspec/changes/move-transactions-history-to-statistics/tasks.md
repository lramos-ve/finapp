## 1. Estilos de Tarjeta Desplegable Neumórfica

- [x] 1.1 Añadir estilos para tarjetas colapsables (`.panel-colapsable`, `.panel-colapsable-header`, `.badge-contador`, `.chevron-rotatorio`) en `src/app.css` para temas claro y oscuro.

## 2. Refactorización de Vistas

- [x] 2.1 Modificar `src/modules/transacciones/components/TransactionsView.svelte` para remover `TransactionList` y mantener la vista enfocada exclusivamente en el balance y el formulario de registro.
- [x] 2.2 Integrar la tarjeta desplegable neumórfica con `TransactionList` y `TransactionFilters` en `src/modules/estadisticas/components/StatisticsView.svelte`, vinculando las transacciones al período seleccionado.
- [x] 2.3 Implementar modal o soporte de edición y eliminación de transacciones en `StatisticsView.svelte` refrescando métricas y gráficos en tiempo real.

## 3. Pruebas y Validación Visual

- [x] 3.1 Ejecutar suite completa de pruebas con `npm test` verificando que pasen al 100%.
- [x] 3.2 Verificar visualmente con Puppeteer la vista limpia de transacciones y el despliegue interactivo de la tarjeta de historial en estadísticas en modo claro y oscuro.
