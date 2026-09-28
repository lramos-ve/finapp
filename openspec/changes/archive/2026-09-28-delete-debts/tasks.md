## 1. Icon Component

- [x] 1.1 Añadir el icono vectorial SVG `trash` a `src/lib/components/Icon.svelte`.

## 2. Data Layer and Persistence

- [x] 2.1 Implementar la función `eliminarDeuda(id)` en `src/lib/debts.js` utilizando una transacción Dexie para eliminar la deuda y sus abonos asociados en cascada.
- [x] 2.2 Agregar pruebas unitarias en `src/test/debts.test.js` verificando la eliminación de deudas con y sin abonos.

## 3. UI Component and Styles

- [x] 3.1 Añadir estilos para `.boton-accion.eliminar` en `src/app.css` con tonalidad de advertencia/peligro (`var(--rojo)`) y relieve neumórfico.
- [x] 3.2 Integrar el botón de eliminar con confirmación nativa `confirm` en cada fila de deuda en `src/lib/components/DebtsView.svelte` y refrescar datos y totales tras la eliminación.

## 4. Verification and Testing

- [x] 4.1 Ejecutar `npm test` para asegurar que las pruebas unitarias pasen al 100%.
- [x] 4.2 Probar visual y funcionalmente la eliminación de deudas en el navegador con Puppeteer.
