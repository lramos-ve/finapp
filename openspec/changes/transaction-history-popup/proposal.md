## Why

El módulo de transacciones actualmente cuenta con el balance general y un botón emergente para registrar transacciones. Sin embargo, para consultar, editar o eliminar movimientos previos, el usuario debía dirigirse al módulo de estadísticas y desplegar una tarjeta colapsable, lo cual fragmentaba el flujo de gestión transaccional cotidiano.

Mover el historial de transacciones de regreso al módulo principal de transacciones y presentarlo como un botón de acción neumórfico que abre una ventana emergente (pop-up modal) unifica la experiencia de administración financiera: la pantalla de transacciones se mantiene limpia y minimalista (mostrando balance y botones de acción), mientras que el módulo de estadísticas se reenfoca en visualizaciones analíticas (métricas clave, distribución por categoría y evolución mensual).

## What Changes

- **Botón disparador de historial en Transacciones**: En `TransactionsView.svelte`, agregar junto al botón de registro un botón neumórfico táctil ("Ver Historial" o "Historial de Transacciones") con icono alusivo y contador/badge de movimientos.
- **Pop-up modal de historial**: Al presionar dicho botón, desplegar un modal neumórfico centrado con fondo difuminado (`backdrop-filter`), animación de entrada suave, botón de cierre (`x`), cierre con tecla `Escape` y clic exterior, que contiene `TransactionList` con sus filtros de tipo, moneda y categoría, así como soporte para editar y eliminar transacciones con actualización en tiempo real.
- **Limpieza del módulo de Estadísticas**: Remover la tarjeta colapsable de transacciones de `StatisticsView.svelte`, dejando la vista de estadísticas enfocada puramente en sus tarjetas de métricas analíticas y gráficos (dona y barras).
- **Consistencia modal**: Ajustar el tamaño y scroll del modal emergente para soportar listas extensas con scrollbar interna neumórfica y visualización responsive en pantallas móviles y escritorio.

## Capabilities

### Modified Capabilities
- `transactions`: Modificar el requerimiento de listado y filtrado de transacciones para estipular que el acceso al historial se realiza mediante un botón de acción en la vista principal que abre un pop-up modal neumórfico con todas las funcionalidades de filtrado, edición y eliminación.
- `statistics`: Remover el requerimiento de tarjeta colapsable de historial en estadísticas, reenfocando el módulo exclusivamente en métricas y gráficos.

## Impact

- `src/modules/transacciones/components/TransactionsView.svelte`: Incorporación del botón disparador y el contenedor modal para el historial de transacciones.
- `src/modules/transacciones/components/TransactionList.svelte`: Integración óptima dentro de la ventana emergente.
- `src/modules/estadisticas/components/StatisticsView.svelte`: Eliminación de la sección colapsable del historial y simplificación del componente.
- `src/app.css`: Estilos para modales de tamaño extendido / con scroll interno si aplica.
