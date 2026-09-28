## 1. Icon and Data Layer

- [x] 1.1 Añadir el icono vectorial SVG `pencil` a `src/lib/components/Icon.svelte`.
- [x] 1.2 Implementar `eliminarTransaccion(id)` y `actualizarTransaccion(id, datos)` en `src/lib/transactions.js`.
- [x] 1.3 Agregar pruebas unitarias en `src/test/transactions.test.js` para eliminación y edición de transacciones.

## 2. UI Component and Interactions

- [x] 2.1 Añadir botones de editar y eliminar en cada fila de transacción dentro de `TransactionsView.svelte`.
- [x] 2.2 Implementar el modo edición en el formulario principal de `TransactionsView.svelte` con botones "Guardar cambios", "Cancelar edición" y recálculo automático del balance.
- [x] 2.3 Añadir estilos en `src/app.css` para el botón de edición y la fila de botones del formulario de edición.

## 3. Verification and Testing

- [x] 3.1 Ejecutar `npm test` para asegurar que todas las pruebas pasen al 100%.
- [x] 3.2 Probar en el navegador con Puppeteer la edición y eliminación de transacciones.
