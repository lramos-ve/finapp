## Why

La app se usa principalmente para registrar movimientos al momento (una transacción, un abono, un pago de gasto fijo), algo que ocurre sobre todo desde el teléfono. Hoy la interfaz es responsive de forma básica (una sola columna, `max-width` centrado) pero no está pensada para uso táctil: los botones de navegación y de formularios son pequeños (padding ~0.4-0.55rem), algunos inputs usan `font-size` menor a 16px (dispara zoom automático en iOS Safari al enfocar), y no hay una navegación optimizada para alcance con el pulgar. Esto hace que registrar un movimiento desde el teléfono sea más lento y propenso a toques accidentales de lo que debería.

## What Changes

- Rediseño mobile-first de la capa de presentación de la app: se define el layout, la navegación y el tamaño de los controles interactivos priorizando el uso desde teléfono, con el layout de escritorio actual (`max-width: 720px` centrado) como una adaptación hacia arriba, no el punto de partida.
- Navegación entre las tres vistas (`Transacciones`, `Deudas`, `Gastos fijos`) rediseñada para alcance cómodo con el pulgar en pantallas de teléfono (p. ej. barra inferior fija), en lugar de la barra superior actual.
- Todos los controles interactivos (botones de navegación, botones de acción, elementos de lista/tarjeta accionables) cumplen un tamaño mínimo de toque de 44x44px.
- Todos los inputs y selects de formulario usan `font-size` de al menos 16px para evitar el zoom automático de iOS Safari al enfocarlos.
- Los formularios de las tres vistas (registrar transacción, registrar/abonar deuda, crear/pagar gasto fijo) se reorganizan a una sola columna en viewports estrechos, con campos y botones de ancho completo.
- No se modifica el comportamiento funcional de ninguna de las tres capacidades existentes (`transactions`, `debts`, `fixed-expenses`): los mismos datos, cálculos y flujos, solo cambia cómo se presentan e interactúan en pantallas pequeñas.
- Fuera de alcance: rediseño visual/de marca (colores, tipografía más allá del tamaño mínimo), soporte de gestos avanzados (swipe, long-press), y cualquier cambio a la lógica de negocio de transacciones, deudas o gastos fijos.

## Capabilities

### New Capabilities
- `mobile-ui`: requisitos de presentación e interacción mobile-first que aplican a toda la app (navegación entre vistas, tamaño mínimo de controles táctiles, comportamiento responsive de formularios y listas), independientes del comportamiento funcional de cada capacidad existente.

### Modified Capabilities
<!-- Ninguna: transactions, debts y fixed-expenses no cambian su comportamiento funcional, solo su presentación, cubierta por la nueva capacidad `mobile-ui`. -->

## Impact

- Código afectado: `src/App.svelte` (header/nav global), `src/app.css` (estilos globales, tamaños de botones e inputs), y los tres componentes de vista (`TransactionsView.svelte`, `DebtsView.svelte`, `FixedExpensesView.svelte`) en cuanto a estructura de sus formularios y listas para viewports estrechos.
- No afecta `src/lib/db.js`, `transactions.js`, `debts.js`, `fixedExpenses.js`, `money.js` ni el modelo de datos: es un cambio de presentación, no de dominio.
- Nota de organización: las specs base (`transactions`, `debts`, `fixed-expenses`) todavía viven como delta specs dentro del change `add-finance-tracking-pwa` (no archivadas aún en `openspec/specs/`). Este change no las modifica; introduce `mobile-ui` como capacidad nueva e independiente para no acoplarse a ese archivado pendiente.
