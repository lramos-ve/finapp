## Why

Actualmente el código del proyecto concentra componentes complejos de vista en archivos individuales extensos (ej. `BackupView.svelte` con 465 líneas, `TransactionsView.svelte` con 341 líneas) y toda la lógica de dominio en una carpeta plana `src/lib/`. Esta concentración incrementa la fricción para el mantenimiento, dificulta la legibilidad y limita la escalabilidad del proyecto. Reorganizar la aplicación bajo una arquitectura modular orientada a features (`src/modules/*` y `src/modules/shared/*`), descomponiendo además las vistas grandes en subcomponentes especializados (formularios, listas, modales), permitirá una separación de responsabilidades clara, testeable y profesional sin alterar las funcionalidades ni contratos externos del sistema.

## What Changes

- **Estructura modular orientada a features**: Se crean módulos dedicados en `src/modules/` para cada dominio funcional:
  - `src/modules/transacciones/`: Vista principal, subcomponentes (`TransactionForm`, `TransactionList`, `CategoryModal`, `TransactionFilters`), lógica (`transactions.js`, `categories.js`) y sus pruebas.
  - `src/modules/estadisticas/`: Vista principal, gráficos (`DonutChart`, `BarChart`), tarjetas métricas, lógica (`statistics.js`) y sus pruebas.
  - `src/modules/deudas/`: Vista principal, subcomponentes (`DebtForm`, `DebtList`, `PaymentModal`), lógica (`debts.js`) y sus pruebas.
  - `src/modules/gastos-fijos/`: Vista principal, subcomponentes (`FixedExpenseForm`, `FixedExpenseList`), lógica (`fixedExpenses.js`) y sus pruebas.
  - `src/modules/respaldo/`: Vista principal, subcomponentes (`BackupActions`, `P2PSyncModal`, `QRCodeDisplay`, `PasswordModal`), lógica (`backup.js`, `p2p.js`) y sus pruebas.
  - `src/modules/shared/`: Componentes comunes (`Icon`), utilidades transversales (`money.js`, `db.js`, `bcv.js`, `theme.svelte.js`, etc.).
- **Descomposición de vistas monolíticas**: Se dividen vistas complejas en subcomponentes de responsabilidad única para mejorar legibilidad y mantenimiento.
- **Puntos de entrada limpios (Barrel exports)**: Cada módulo expondrá su API pública e interfaces principales a través de un `index.js`.
- **Actualización de rutas de importación**: Ajuste de rutas en `src/App.svelte` y suites de prueba garantizando 100% de compatibilidad.

## Capabilities

### New Capabilities
<!-- No new capabilities are introduced in this refactoring change. -->

### Modified Capabilities
<!-- No spec-level requirement changes are introduced; behavior remains identical. -->

## Impact

- **Código afectado**:
  - `src/App.svelte`: Actualización de imports desde los nuevos módulos.
  - Reubicación y descomposición de archivos de `src/lib/components/` y `src/lib/` hacia `src/modules/`.
  - Rutas de imports en archivos de prueba.
- **Riesgo**: Bajo. Se trata de una refactorización interna estructurada que preserva el 100% de los tests unitarios (`vitest`) y funcionalidad verificada en navegador.
