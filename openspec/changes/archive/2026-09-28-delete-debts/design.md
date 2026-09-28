## Context

El sistema gestiona deudas y abonos en tablas separadas de Dexie (`db.deudas` y `db.abonos`). Actualmente, no existe operación para eliminar registros de deudas. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Implementar `eliminarDeuda(id)` de forma transaccional (`db.transaction('rw', [db.deudas, db.abonos], ...)`), asegurando que tanto la deuda como sus abonos asociados se eliminen atómicamente.
- Incorporar el icono vectorial SVG `trash` en `src/lib/components/Icon.svelte`.
- Añadir un botón con icono de papelera al final de cada fila de deuda en `DebtsView.svelte`.
- Solicitar confirmación explícita mediante `window.confirm` indicando la persona y el saldo de la deuda antes de proceder.
- Refrescar reactivamente la lista de deudas y los totales pendientes (`obtenerTotalesPorDireccion`) tras la eliminación.
- Mantener la cobertura de pruebas unitarias al 100%.

**Non-Goals:**
- Implementar una papelera de reciclaje o recuperación de registros eliminados (soft-delete).
- Eliminación masiva o por lotes de deudas.

## Decisions

### 1. Transacción atómica en Dexie para borrado en cascada
- **Decisión:** Utilizar `db.transaction('rw', [db.deudas, db.abonos], async () => { ... })` para eliminar primero los abonos vinculados mediante `db.abonos.where('deudaId').equals(id).delete()` y seguidamente la deuda con `db.deudas.delete(id)`.
- **Alternativa descartada:** Eliminar solo la deuda dejando abonos huérfanos en `db.abonos`, lo cual contaminaría el almacenamiento IndexedDB y los backups.

### 2. Confirmación previa mediante diálogo nativo
- **Decisión:** Usar `window.confirm(`¿Eliminar la deuda de ${d.persona}? Se eliminarán también sus abonos registrados.`)`.
- **Alternativa descartada:** Modal flotante personalizado. El diálogo nativo bloquea de forma limpia y evita estados intermedios complejos en el componente.

### 3. Estilo del botón de eliminación en la fila
- **Decisión:** Botón con clase `.boton-accion.eliminar` ubicado al final de `.deuda-fila`, con icono `trash`, padding adaptado y feedback de color de peligro (`var(--rojo)`).
- **Alternativa descartada:** Texto explicativo largo dentro de la fila, lo que sobrecargaría visualmente la vista en pantallas móviles.

## Risks / Trade-offs

- **[Pérdida accidental de datos]** → Mitigación: El diálogo de confirmación describe de forma clara que la acción es definitiva y menciona la eliminación de los abonos asociados.
