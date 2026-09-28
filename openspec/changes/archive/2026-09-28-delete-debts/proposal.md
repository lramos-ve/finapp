## Why

Los usuarios necesitan poder eliminar deudas que hayan sido registradas por error, duplicadas o que ya no deseen conservar en su historial financiero local. Actualmente, la aplicación permite registrar deudas y realizar abonos, pero carece de un mecanismo para descartar o eliminar registros existentes y sus pagos asociados.

## What Changes

- Se añade la función `eliminarDeuda(id)` en la capa de datos (`debts.js`), la cual elimina el registro de la deuda en IndexedDB y borra en cascada todos los abonos vinculados en `db.abonos`.
- Se incorpora el icono vectorial `trash` al componente `Icon.svelte`.
- Se añade un botón de acción con icono de papelera en cada fila de la lista de deudas (`DebtsView.svelte`).
- Se solicita confirmación explícita al usuario mediante el diálogo nativo del navegador (`confirm`) antes de efectuar la eliminación definitiva.
- Se actualizan reactivamente las métricas de saldo pendiente (`Debo` / `Me deben`) y el listado visible tras la eliminación.

## Capabilities

### New Capabilities

<!-- No new capabilities -->

### Modified Capabilities

- `debts`: Añade el requerimiento de eliminación de una deuda y la limpieza en cascada de sus abonos.

## Impact

- `src/lib/debts.js`: Nueva función exportada `eliminarDeuda(id)`.
- `src/lib/components/Icon.svelte`: Nuevo icono vectorial SVG `trash`.
- `src/lib/components/DebtsView.svelte`: Integración del botón de eliminación en la fila y manejo del evento de borrado.
- `src/app.css`: Estilos para el botón de eliminación con acento de peligro/alerta acorde a la paleta neumórfica.
- `src/test/debts.test.js`: Pruebas unitarias para validar la eliminación de deudas y la limpieza de abonos asociados.
