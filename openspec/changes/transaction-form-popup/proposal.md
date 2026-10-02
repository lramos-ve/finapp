## Why

En la vista principal de transacciones, el formulario de registro ocupaba un espacio estático fijo en la pantalla, restando protagonismo visual a las tarjetas de balance y dando una apariencia convencional. Convertir el formulario de registro en una tarjeta emergente (pop-up modal) con estética neumórfica eleva el estilo visual de la aplicación, permite una pantalla principal limpia y enfocada en el balance, y ofrece una experiencia de captura moderna y centrada mediante un botón de acción prominente.

## What Changes

- Rediseñar el acceso al formulario de registro en `TransactionsView.svelte` mediante un botón de acción neumórfico prominente ("+ Registrar Movimiento" o botón flotante / disparador de acción rápida).
- Transformar la tarjeta de registro `TransactionForm` en un modal / pop-up neumórfico centrado con fondo difuminado (*backdrop* con desenfoque suave), sombras duales elevadas, botón de cierre (icono `x`), y soporte para tecla `Escape` y clic exterior.
- Al confirmar el registro de una transacción, el pop-up se cierra automáticamente con una transición suave y actualiza de inmediato el balance en la pantalla principal.

## Capabilities

### Modified Capabilities
- `transactions`: Actualizar el requerimiento de registro para especificar que el formulario de transacciones se presenta de manera interactiva a través de una tarjeta emergente / pop-up neumórfico con control de apertura y cierre.

## Impact

- Componentes modificados:
  - `src/modules/transacciones/components/TransactionsView.svelte`: Incorporación del botón disparador y control de apertura del pop-up.
  - `src/modules/transacciones/components/TransactionForm.svelte` (o wrapper modal neumórfico): Soporte para presentación emergente, botón de cierre y emisión de evento de cancelación/cierre.
  - `src/app.css`: Estilos neumórficos para modales y ventanas emergentes (backdrop blur, sombras de elevación, centrado responsivo móvil).
- Pruebas:
  - Verificación visual interactiva y pruebas de la suite Vitest.
