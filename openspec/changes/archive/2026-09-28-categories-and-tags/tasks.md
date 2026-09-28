## 1. Data Model and Module

- [x] 1.1 Crear `src/lib/categories.js` con la lista de categorías predeterminadas y función utilitaria para extraer categorías únicas disponibles.
- [x] 1.2 Actualizar `src/lib/db.js` para indexar `categoria` en los almacenes `transacciones` y `gastosFijos`.
- [x] 1.3 Actualizar `src/lib/transactions.js` para persistir, editar y filtrar por `categoria`.
- [x] 1.4 Actualizar `src/lib/fixedExpenses.js` para persistir `categoria` en gastos fijos.
- [x] 1.5 Añadir pruebas unitarias en `src/test/transactions.test.js` y `src/test/fixedExpenses.test.js` para validar la persistencia y filtrado de categorías.

## 2. UI and Interactions

- [x] 2.1 Actualizar `TransactionsView.svelte` para añadir selector con datalist de categorías en el formulario y filtro de categoría en la barra de filtros.
- [x] 2.2 Actualizar `TransactionsView.svelte` para mostrar la insignia (badge) de categoría en cada fila de transacción.
- [x] 2.3 Actualizar `FixedExpensesView.svelte` para incluir selector de categoría en el formulario y mostrar la insignia en la lista de gastos fijos.
- [x] 2.4 Añadir estilos en `src/app.css` para las insignias de categoría (`.badge-categoria`).

## 3. Verification and Testing

- [x] 3.1 Ejecutar `npm test` y asegurar que todas las pruebas unitarias pasen al 100%.
- [x] 3.2 Verificar en el navegador mediante Puppeteer el flujo de registro con categoría, filtro por rubro y badges visuales.
