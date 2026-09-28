## Context

`src/lib/transactions.js` gestiona los registros de `db.transacciones`. Actualmente cuenta con `registrarTransaccion`, `obtenerBalance` y `listarTransacciones`. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Implementar `eliminarTransaccion(id)` y `actualizarTransaccion(id, datos)` en `src/lib/transactions.js`.
- Añadir el icono vectorial SVG `pencil` en `src/lib/components/Icon.svelte`.
- Integrar botones de edición y eliminación en cada elemento de la lista de transacciones dentro de `.acciones-fila`.
- Habilitar el modo de edición en el formulario superior de `TransactionsView.svelte`, permitiendo modificar los campos y guardar los cambios con actualización reactiva del balance y la lista.
- Permitir cancelar la edición en cualquier momento mediante un botón secundario.
- Solicitar confirmación nativa con `window.confirm` antes de borrar una transacción.
- Garantizar que las pruebas unitarias cubran las nuevas funciones con 100% de éxito.

**Non-Goals:**
- Historial de revisiones o auditoría de cambios anteriores de una transacción.
- Papelera de reciclaje temporal (el borrado es directo y definitivo tras la confirmación).

## Decisions

### 1. Modo edición en el formulario principal
- **Decisión:** Al pulsar editar en una fila, los datos de esa transacción se cargan en el formulario superior, el título cambia a "Editar transacción", el botón de acción pasa a "Guardar cambios" y se añade un botón "Cancelar edición".
- **Razón:** Aprovecha la infraestructura existente del formulario (incluyendo validaciones, selector de moneda y consulta de tasa BCV), evitando duplicar campos en formularios inline dentro de listas largas.

### 2. Recálculo consistente del equivalente en USD
- **Decisión:** `actualizarTransaccion` vuelve a ejecutar `calcularMovimientoDeDinero({ monto, moneda, tasaBCV })` y actualiza atómicamente todos los campos en `db.transacciones.update(id, ...)`.
- **Razón:** Garantiza que si el usuario corrige el monto o la tasa BCV, el equivalente en USD se actualice de forma exacta para el cálculo del balance.

### 3. Confirmación nativa de borrado
- **Decisión:** Usar `window.confirm` indicando la descripción y el monto de la transacción a eliminar.
- **Razón:** Ligero, seguro y previene pérdidas accidentales.

## Risks / Trade-offs

- **[Cambio de moneda durante la edición]** → Mitigación: Si la transacción se cambia de USD a VES, el sistema solicita la tasa BCV requerida; si se cambia a USD, se limpia la tasa automáticamente.
