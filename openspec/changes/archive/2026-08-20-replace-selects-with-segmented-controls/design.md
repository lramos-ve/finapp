## Context

Ver `proposal.md` - Why. Los componentes `TransactionsView.svelte`, `DebtsView.svelte` y `FixedExpensesView.svelte` contienen elementos `<select>` HTML nativos para seleccionar opciones fijas.

## Goals / Non-Goals

**Goals:**
- Reemplazar todos los elementos `<select>` en formularios y filtros por grupos de botones de control segmentado.
- Definir en `app.css` las reglas de estilo reutilizables (`.control-segmentado`, `.control-segmentado button`, etc.).
- Garantizar que los eventos de clic utilicen `type="button"` para evitar la activación involuntaria del `submit` de los formularios.

**Non-Goals:**
- No se introducen librerías UI de terceros (permanece 100% Svelte + CSS nativo).
- No se modifica la lógica de estado (`$state`), validaciones ni llamadas a la base de datos IndexedDB.

## Decisions

### Patrón HTML/CSS para Control Segmentado
Se empleará un contenedor `.control-segmentado` con botones hijo en lugar de una librería externa:
```html
<div class="control-segmentado">
  <button type="button" class:activo={tipo === 'gasto'} onclick={() => (tipo = 'gasto')}>
    Gasto
  </button>
  <button type="button" class:activo={tipo === 'ingreso'} onclick={() => (tipo = 'ingreso')}>
    Ingreso
  </button>
</div>
```
*Razón*: Mantiene la aplicación ligera, aprovecha la reactividad con Runes de Svelte 5 (`$state` y `class:activo`) y no añade peso al bundle.

### Soporte en Filtros de Búsqueda
En la sección de filtros de transacciones, se sustituyen los `<select>` de Filtro por Tipo (`Todos` | `Gasto` | `Ingreso`) y Moneda (`Todas` | `USD` | `VES`).

## Risks / Trade-offs

- **[Riesgo] Adaptabilidad en pantallas muy pequeñas.** → Mitigación: Se aplica `display: flex` con `flex: 1` a los botones del grupo segmentado para ajustarse al ancho del contenedor.
