## Context

Ver `proposal.md` para la motivación. Actualmente, el flujo de transacciones combina el formulario de alta y el listado completo en la misma vista (`TransactionsView.svelte`). Por otro lado, `StatisticsView.svelte` ya carga y procesa las transacciones del período seleccionado para mostrar gráficos y métricas, convirtiéndose en el lugar natural para consultar el desglose detallado de movimientos.

## Goals / Non-Goals

**Goals:**
- Mover `TransactionList` y `TransactionFilters` desde `TransactionsView` hacia `StatisticsView`.
- Implementar una tarjeta neumórfica desplegable (acordeón colapsable) en `StatisticsView` que muestre en su cabecera el título "Historial de Transacciones", el número de transacciones del período seleccionado y una flecha indicadora de apertura/cierre.
- Mantener la vista principal `TransactionsView` limpia y concisa, mostrando el balance general y el formulario de captura.
- Conectar las operaciones de eliminación y edición de transacciones en la tarjeta desplegable de estadísticas, asegurando que cualquier cambio recalcule en tiempo real las métricas analíticas y los gráficos.
- Asegurar una animación suave y un acabado visual neumórfico consistente en tema claro y tema oscuro.

**Non-Goals:**
- No se modificará la estructura de datos en IndexedDB ni la lógica matemática de cálculo de balances y gráficos.
- No se eliminarán los filtros de transacciones (tipo, moneda, categoría), sino que se integrarán dentro de la tarjeta desplegable en estadísticas.

## Decisions

### 1. Ubicación de la Tarjeta Desplegable en Estadísticas
- **Decisión**: Colocar la tarjeta colapsable después del gráfico de distribución por categorías y antes o después de la evolución mensual en `StatisticsView.svelte`.
- **Razón**: Permite al usuario revisar primero el resumen ejecutivo y los gráficos, y abrir la tarjeta desplegable cuando desee auditar los movimientos individuales que componen dichos totales.

### 2. Estado de Apertura y Filtrado por Período
- **Decisión**: La tarjeta estará colapsada por defecto (`expandido = false`) para evitar scroll innecesario al entrar en estadísticas. Las transacciones listadas estarán acotadas al período seleccionado en la cabecera de estadísticas (`desde` y `hasta` del mes), permitiendo al usuario filtrar adicionalmente por tipo, moneda o categoría.
- **Razón**: Máxima coherencia analítica: lo que se ve en los gráficos corresponde exactamente a las transacciones del historial desplegable.

### 3. Edición de Transacciones desde Estadísticas
- **Decisión**: Incluir un modal de edición neumórfico (`TransactionEditModal.svelte`) o reutilizar `TransactionForm` en un modal emergente cuando el usuario pulse el botón de editar en el historial de estadísticas.
- **Razón**: Evita tener que redirigir al usuario a otra pantalla y perder el contexto de análisis del mes que estaba revisando.

## Risks / Trade-offs

- **[Riesgo] Rendimiento al listar transacciones con muchos registros** → **Mitigación**: Al estar acotadas al período seleccionado en estadísticas, el conjunto de datos por mes es reducido y su renderizado es inmediato.
- **[Riesgo] Desfase de estado entre estadísticas y transacciones** → **Mitigación**: Al editar o eliminar una transacción desde la tarjeta de estadísticas, se vuelve a invocar `cargar()` refrescando métricas, gráficos y lista en la misma vista.
