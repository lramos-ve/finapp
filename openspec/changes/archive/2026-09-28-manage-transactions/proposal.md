## Why

Al registrar transacciones de ingresos o gastos cotidianos, los usuarios pueden cometer errores tipográficos en el monto, la fecha, la descripción o la tasa de cambio utilizada, o registrar entradas duplicadas por accidente. Actualmente, la aplicación solo permite crear transacciones, sin posibilidad de corregirlas ni eliminarlas, lo que distorsiona el balance neto y las estadísticas acumuladas.

## What Changes

- Se añaden las funciones `eliminarTransaccion(id)` y `actualizarTransaccion(id, datos)` en la capa de datos (`src/lib/transactions.js`), recalculando los equivalentes en USD y persistiendo los cambios en IndexedDB.
- Se incorpora el icono vectorial SVG `pencil` / `edit` en `src/lib/components/Icon.svelte`.
- Cada fila en la lista de transacciones (`TransactionsView.svelte`) incluye botones de acción neumórficos para editar y eliminar.
- La eliminación solicita confirmación explícita mediante diálogo nativo (`window.confirm`).
- Al pulsar editar, el formulario superior entra en modo de edición ("Editar transacción"), precargando los valores correspondientes, permitiendo guardar los cambios o cancelar para volver al modo de registro habitual.
- Tras cualquier edición o borrado, el balance (ingresos, gastos, saldo neto) y la lista se actualizan inmediatamente de forma reactiva.

## Capabilities

### New Capabilities

<!-- No new capabilities -->

### Modified Capabilities

- `transactions`: Añade los requerimientos para actualizar y eliminar transacciones registradas previamente.

## Impact

- `src/lib/transactions.js`: Nuevas funciones `eliminarTransaccion(id)` y `actualizarTransaccion(id, datos)`.
- `src/lib/components/Icon.svelte`: Icono vectorial `pencil`.
- `src/lib/components/TransactionsView.svelte`: Gestión del estado de edición en el formulario principal y acciones en cada fila.
- `src/app.css`: Estilos para botones de edición en fila y controles de cancelación.
- `src/test/transactions.test.js`: Pruebas unitarias para la actualización y eliminación de transacciones.
