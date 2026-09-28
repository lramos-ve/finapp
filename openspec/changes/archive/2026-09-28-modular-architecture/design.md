## Context

El proyecto FinApp ha crecido incorporando gestión de transacciones, deudas, gastos fijos, respaldo cifrado con sincronización P2P WebRTC, y estadísticas con gráficos visuales. Actualmente, todas las vistas residen en `src/lib/components/` como archivos monolíticos de gran tamaño (`BackupView.svelte` con 465 líneas, `TransactionsView.svelte` con 341 líneas, `DebtsView.svelte` con 275 líneas, `FixedExpensesView.svelte` con 243 líneas), y toda la lógica de dominio está en una carpeta plana `src/lib/`.

## Goals / Non-Goals

**Goals:**
- Estructurar el código fuente en módulos por dominio funcional bajo `src/modules/{transacciones, deudas, gastos-fijos, respaldo, estadisticas}` y un módulo transversal `src/modules/shared/`.
- Descomponer las vistas monolíticas en subcomponentes especializados y testeables (formularios, listas, modales, tarjetas).
- Proveer puntos de entrada públicos (`index.js`) por módulo con exportaciones explícitas y limpias.
- Preservar compatibilidad mediante re-exportaciones puente en `src/lib/` para evitar roturas abruptas.
- Mantener el 100% de las pruebas unitarias pasando (55/55 tests) y la misma apariencia y comportamiento visual.

**Non-Goals:**
- Alterar la lógica de negocio o la base de datos IndexedDB (Dexie).
- Modificar estilos visuales o la paleta del tema neumórfico.
- Añadir nuevas funcionalidades o librerías externas.

## Decisions

### 1. Arquitectura por Dominio Funcional (`src/modules/*`)
- **Decisión**: Agrupar componentes, lógica de negocio y utilidades específicas por feature/dominio, en lugar de una separación tradicional por capas (`components/`, `services/`, `utils/`).
- **Alternativas consideradas**:
  - *Separación por capas genéricas*: Dificulta navegar y entender todo lo relacionado a un feature cuando el proyecto crece.
  - *Mantener `src/lib/components` y solo dividir vistas*: No resuelve la dispersión de la lógica de dominio en `src/lib/`.
- **Estructura objetivo**:
  - `src/modules/transacciones/`:
    - `components/`: `TransactionsView.svelte`, `TransactionForm.svelte`, `TransactionList.svelte`, `CategoryModal.svelte`, `TransactionFilters.svelte`.
    - `logic/`: `transactions.js`, `categories.js`.
    - `index.js`
  - `src/modules/deudas/`:
    - `components/`: `DebtsView.svelte`, `DebtForm.svelte`, `DebtList.svelte`, `DebtPaymentModal.svelte`.
    - `logic/`: `debts.js`.
    - `index.js`
  - `src/modules/gastos-fijos/`:
    - `components/`: `FixedExpensesView.svelte`, `FixedExpenseForm.svelte`, `FixedExpenseList.svelte`.
    - `logic/`: `fixedExpenses.js`.
    - `index.js`
  - `src/modules/respaldo/`:
    - `components/`: `BackupView.svelte`, `BackupActions.svelte`, `BackupPasswordModal.svelte`, `P2PSyncModal.svelte`, `QRCodeDisplay.svelte`.
    - `logic/`: `backup.js`, `p2p.js`.
    - `index.js`
  - `src/modules/estadisticas/`:
    - `components/`: `StatisticsView.svelte`, `DonutChart.svelte`, `BarChart.svelte`, `MetricCards.svelte`.
    - `logic/`: `statistics.js`.
    - `index.js`
  - `src/modules/shared/`:
    - `components/`: `Icon.svelte`.
    - `services/`: `db.js`, `money.js`, `bcv.js`, `theme.svelte.js`.
    - `index.js`

### 2. Descomposición de Vistas y Props en Svelte 5
- **Decisión**: Los subcomponentes recibirán estado y callbacks explícitos mediante la sintaxis moderna de Svelte 5 (`let { ... } = $props()`), manteniendo los orquestadores de vista como contenedores ligeros de estado y coordinación.
- **Alternativas consideradas**: Estados globales/stores para todo el formulario. Descartado porque añadiría complejidad innecesaria para formularios simples.

### 3. Puentes de Compatibilidad en `src/lib/`
- **Decisión**: Los archivos existentes en `src/lib/` reexportarán temporalmente los módulos para asegurar que ninguna referencia o test existente falle durante la migración progresiva.

## Risks / Trade-offs

- **[Riesgo] Dispersión o rotura de rutas de importación en pruebas unitarias** → **Mitigación**: Mantener los archivos puente en `src/lib/` y actualizar progresivamente las suites de prueba en `src/test/`, ejecutando `npm test` tras migrar cada módulo.
- **[Riesgo] Inconsistencias en bindings reactivos de Svelte 5 al extraer subcomponentes** → **Mitigación**: Usar eventos/callbacks o variables de estado coordinadas en el componente contenedor y validar visualmente con Puppeteer.
