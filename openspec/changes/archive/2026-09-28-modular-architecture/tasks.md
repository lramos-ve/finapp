## 1. Módulo Transversal y Compartido (`src/modules/shared/`)

- [x] 1.1 Crear directorio `src/modules/shared/` con `services/` (`db.js`, `money.js`, `bcv.js`, `theme.svelte.js`), `components/` (`Icon.svelte`), y su `index.js`.
- [x] 1.2 Configurar archivos puente en `src/lib/` que reexporten desde `src/modules/shared/` para compatibilidad.


## 2. Módulo de Estadísticas (`src/modules/estadisticas/`)

- [x] 2.1 Crear `src/modules/estadisticas/` con `logic/statistics.js`, componentes (`StatisticsView.svelte`, `DonutChart.svelte`, `BarChart.svelte`), y `index.js`.
- [x] 2.2 Mantener reexportación en `src/lib/statistics.js` y `src/lib/components/StatisticsView.svelte`.


## 3. Módulo de Gastos Fijos (`src/modules/gastos-fijos/`)

- [x] 3.1 Crear `src/modules/gastos-fijos/` con `logic/fixedExpenses.js`, descomponer la vista en `FixedExpenseForm.svelte`, `FixedExpenseList.svelte` y el contenedor `FixedExpensesView.svelte`, y su `index.js`.
- [x] 3.2 Mantener reexportación en `src/lib/fixedExpenses.js` y `src/lib/components/FixedExpensesView.svelte`.


## 4. Módulo de Deudas (`src/modules/deudas/`)

- [x] 4.1 Crear `src/modules/deudas/` con `logic/debts.js`, descomponer la vista en `DebtForm.svelte`, `DebtList.svelte`, `DebtPaymentModal.svelte` y el contenedor `DebtsView.svelte`, y su `index.js`.
- [x] 4.2 Mantener reexportación en `src/lib/debts.js` y `src/lib/components/DebtsView.svelte`.


## 5. Módulo de Respaldo y Sincronización (`src/modules/respaldo/`)

- [x] 5.1 Crear `src/modules/respaldo/` con `logic/` (`backup.js`, `p2p.js`), descomponer la vista en `BackupActions.svelte`, `BackupPasswordModal.svelte`, `P2PSyncModal.svelte`, `QRCodeDisplay.svelte` y el contenedor `BackupView.svelte`, y su `index.js`.
- [x] 5.2 Mantener reexportación en `src/lib/backup.js`, `src/lib/p2p.js` y `src/lib/components/BackupView.svelte`.


## 6. Módulo de Transacciones (`src/modules/transacciones/`)

- [x] 6.1 Crear `src/modules/transacciones/` con `logic/` (`transactions.js`, `categories.js`), descomponer la vista en `TransactionForm.svelte`, `TransactionList.svelte`, `TransactionFilters.svelte`, `CategoryModal.svelte` y el contenedor `TransactionsView.svelte`, y su `index.js`.
- [x] 6.2 Mantener reexportación en `src/lib/transactions.js`, `src/lib/categories.js` y `src/lib/components/TransactionsView.svelte`.


## 7. Integración, Pruebas y Verificación

- [x] 7.1 Actualizar imports en `src/App.svelte` para consumir directamente los módulos desde `src/modules/`.
- [x] 7.2 Ejecutar `npm test` y verificar que el 100% de las pruebas unitarias pasen sin errores.
- [x] 7.3 Probar la aplicación en el navegador con Puppeteer en modo claro y modo oscuro, verificando la reactividad de todas las vistas.


