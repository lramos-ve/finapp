## Context

Ver `proposal.md` para la motivación. Actualmente, `TransactionsView.svelte` cuenta con las tarjetas de balance y el botón para registrar movimientos vía pop-up modal. El historial de transacciones (`TransactionList`) reside dentro de un panel colapsable en `StatisticsView.svelte`. Se busca trasladar este historial al módulo de transacciones como un botón de acción que active una ventana emergente neumórfica, optimizando la vista y unificando el ciclo de vida de las transacciones.

## Goals / Non-Goals

**Goals:**
- En `TransactionsView.svelte`, agregar junto al botón de registro un botón de acción neumórfico para abrir el historial ("Historial de Transacciones" con contador/badge numérico).
- Renderizar `TransactionList` dentro de una tarjeta emergente `.modal-neumorphic` de ancho extendido (`max-width: 640px`) con scroll interno, cabecera modal con botón `x` y filtros de búsqueda.
- Permitir la edición y eliminación de transacciones dentro del modal con actualización inmediata del balance general y de la lista.
- Remover la tarjeta colapsable del historial en `StatisticsView.svelte`, dejando dicho módulo enfocado exclusivamente en gráficos (dona, barras) y tarjetas de métricas analíticas.
- Mantener compatibilidad total con temas claro y oscuro y responsive design en móviles.

**Non-Goals:**
- No se alterarán los algoritmos de cálculo de equivalencias en USD, tasas BCV ni lógica de base de datos de transacciones.
- No se añadirá paginación compleja en servidor, ya que los datos operan de manera local e instantánea con IndexedDB.

## Decisions

### 1. Disposición de Botones de Acción en `TransactionsView`
- **Decisión**: Colocar un grupo de acciones neumórficas debajo del balance:
  - Botón principal: "+ Registrar Transacción"
  - Botón complementario: "Historial de Transacciones" con icono `transactions` y badge con el total de movimientos registrados.
- **Razón**: Permite acceso directo y evidente a ambas operaciones esenciales sin sobrecargar la pantalla con listas visibles por defecto.

### 2. Estructura del Modal de Historial
- **Decisión**: Utilizar la infraestructura de modales neumórficos existente (`.modal-backdrop` y `.modal-neumorphic`), agregando una variante `.modal-lg` o `.modal-historial`:
  - Ancho máximo de 640px (94vw en móviles).
  - Altura máxima de 85vh con estructura flex (`display: flex; flex-direction: column;`).
  - Cabecera fija con título y botón de cierre (`x`), área de contenido con scroll suave (`overflow-y: auto`).
- **Razón**: Asegura que en pantallas pequeñas o con cientos de registros la cabecera y el botón de cierre sigan siempre visibles y accesibles.

### 3. Flujo de Edición de Transacciones
- **Decisión**: Si el usuario pulsa editar en una fila del listado dentro del modal de historial:
  - Se puede desplegar el formulario de edición `TransactionForm` en la parte superior del listado o alternar a una vista de edición dentro del mismo modal.
  - Al guardar o cancelar la edición, se refresca la lista y el balance, retornando a la visualización del listado.
- **Razón**: Evita abrir modales anidados sobre modales, manteniendo la interacción limpia y contenida.

### 4. Limpieza en `StatisticsView`
- **Decisión**: Remover la sección `panel-colapsable` de transacciones en `StatisticsView.svelte` junto con sus estados locales de filtros de historial y edición de transacciones.
- **Razón**: Simplifica el módulo de estadísticas, eliminando duplicidad y enfocándolo 100% en analítica visual.

## Risks / Trade-offs

- **[Riesgo] Tamaño del modal de historial en pantallas móviles pequeñas** → **Mitigación**: `max-height: 88vh; width: 94vw;` con scroll vertical interno neumórfico y padding adaptado (`padding: 1.25rem` en móviles).
- **[Riesgo] Desfase de balance al editar o borrar desde el historial** → **Mitigación**: Al ejecutar `onGuardar` o `onEliminar` dentro del modal, invocar `cargar()` en `TransactionsView` para recalcular el balance en segundo plano de forma inmediata.
