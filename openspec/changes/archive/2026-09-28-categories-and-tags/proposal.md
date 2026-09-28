## Why

Actualmente las transacciones y gastos fijos solo se diferencian por tipo (ingreso/gasto o pagado/pendiente) y una descripción en texto libre. Esto dificulta que el usuario organice sus finanzas por rubros (alimentación, transporte, servicios, salud, etc.) o analice en qué áreas gasta más dinero. Agregar categorías con valores predefinidos y soporte para categorías personalizadas permitirá ordenar los movimientos y filtrar los gastos con facilidad tanto en transacciones como en gastos fijos.

## What Changes

- Definición de una lista inicial de categorías predeterminadas comunes (Comida, Servicios, Transporte, Vivienda, Salud, Entretenimiento, Educación, Ingresos / Sueldo, Otros) con posibilidad de ingresar o crear categorías personalizadas.
- Soporte para asociar una categoría (opcional o por defecto) al registrar y editar transacciones puntuales.
- Soporte para asociar una categoría al registrar y listar gastos fijos.
- Filtro por categoría en el listado de transacciones para consultar movimientos por rubro.
- Indicador visual / badge de la categoría en cada fila de transacción y gasto fijo.
- Preservación y retrocompatibilidad con transacciones y gastos fijos existentes (campo categoría opcional).

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad separada; se extienden las capacidades existentes -->

### Modified Capabilities
- `transactions`: Se agrega el soporte para categorizar transacciones (al crear y editar) y se añade el filtro por categoría en la consulta y listado.
- `fixed-expenses`: Se agrega el soporte para asociar categoría a un gasto fijo al crearlo y visualizarlo en la lista.

## Impact

- `src/lib/transactions.js`: `registrarTransaccion`, `actualizarTransaccion`, y `listarTransacciones` soportan el parámetro `categoria`.
- `src/lib/fixedExpenses.js`: `registrarGastoFijo` y `listarGastosFijos` soportan `categoria`.
- `src/lib/categories.js`: Nuevo módulo de utilidades con la lista base de categorías predefinidas y helpers para normalización / obtención de categorías usadas.
- `src/lib/components/TransactionsView.svelte`: Selector de categoría con opción para escribir personalizada en el formulario y filtro de categorías en la lista.
- `src/lib/components/FixedExpensesView.svelte`: Selector de categoría en el formulario y visualización de badge en la lista.
- Pruebas unitarias actualizadas en `src/test/transactions.test.js` y `src/test/fixedExpenses.test.js`.
