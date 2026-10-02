## Why

Actualmente, el historial de transacciones se encuentra al final de la pantalla principal de transacciones, haciendo que la vista sea extensa y requiera scroll excesivo en dispositivos móviles para registrar nuevos movimientos. Mover el historial al módulo de estadísticas y presentarlo dentro de una tarjeta desplegable colapsable optimiza la vista principal para un registro rápido y centraliza la consulta analítica y el desglose de transacciones en la sección de estadísticas.

## What Changes

- Trasladar el componente de listado y filtros de transacciones (`TransactionList` y `TransactionFilters`) desde la vista de transacciones (`TransactionsView`) hacia la vista de estadísticas (`StatisticsView`).
- Crear un contenedor de tarjeta desplegable neumórfica (acordeón/colapsable) en `StatisticsView` con cabecera interactiva, contador de transacciones del período y flecha animada para expandir/colapsar el historial.
- En la vista principal de transacciones, simplificar el diseño para centrarse en el balance consolidado y el formulario de registro rápido.
- Sincronizar el historial de transacciones con el período seleccionado en estadísticas, permitiendo adicionalmente refinar la búsqueda mediante los filtros de tipo, moneda y categoría.
- Permitir la edición y eliminación de transacciones directamente desde la tarjeta desplegable en estadísticas, manteniendo actualizado en tiempo real tanto el balance como las métricas analíticas.

## Capabilities

### Modified Capabilities
- `statistics`: Incorporar el requerimiento de tarjeta desplegable para consultar y gestionar el historial detallado de transacciones del período seleccionado.
- `transactions`: Actualizar el requerimiento de consulta y listado para reflejar que la vista principal está enfocada en balance y registro, mientras que la exploración histórica se realiza en la vista analítica de estadísticas.

## Impact

- Componentes modificados:
  - `src/modules/transacciones/components/TransactionsView.svelte`
  - `src/modules/estadisticas/components/StatisticsView.svelte`
  - `src/modules/transacciones/components/TransactionList.svelte`
  - `src/app.css` (estilos para tarjeta colapsable / acordeón neumórfico)
- Compatibilidad y pruebas:
  - Todas las operaciones CRUD sobre transacciones se conservan.
  - Se actualizarán o añadirán pruebas para validar el comportamiento colapsable y la integración de transacciones en estadísticas.
