## 1. Estilos y Variantes de Modal Neumórfico

- [ ] 1.1 Agregar en `src/app.css` estilos para modal de tamaño extendido (`.modal-lg` / scroll interno) y el contenedor de botones de acción (`.grupo-botones-acciones`, `.boton-accion-secundario`).

## 2. Componentes e Integración de Historial Pop-up

- [ ] 2.1 Actualizar `src/modules/transacciones/components/TransactionsView.svelte` para incorporar el botón disparador de historial con badge contador, el modal emergente con `TransactionList` y gestión de apertura/cierre (Escape, clic fuera, botón x).
- [ ] 2.2 Soportar edición y eliminación de transacciones dentro del modal de historial con actualización inmediata de la lista y del balance general.
- [ ] 2.3 Remover la tarjeta colapsable de transacciones y estados de edición/filtros en `src/modules/estadisticas/components/StatisticsView.svelte`.

## 3. Pruebas y Validación Visual

- [ ] 3.1 Ejecutar suite completa de pruebas unitarias con `npm test` verificando que pasen al 100%.
- [ ] 3.2 Verificar visualmente con Puppeteer en modo claro y oscuro la vista de transacciones con ambos botones, el despliegue del modal de historial con filtros y acciones, y el módulo de estadísticas simplificado.
