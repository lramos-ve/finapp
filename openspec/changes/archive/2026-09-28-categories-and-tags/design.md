## Context

Véase `proposal.md` para la motivación. Actualmente las transacciones y gastos fijos no cuentan con un campo de categorización ni clasificación por rubros. Se requiere una solución liviana, compatible con IndexedDB y el diseño neumórfico existente, que permita tanto elegir de una lista predefinida como crear categorías personalizadas de manera intuitiva y sin fricciones.

## Goals / Non-Goals

**Goals:**
- Soportar categorización en transacciones (ingresos y gastos) y en gastos fijos.
- Proveer un conjunto base de categorías predeterminadas comunes para Venezuela / finanzas personales cotidianas (Alimentación, Servicios, Transporte, Vivienda, Salud, Entretenimiento, Educación, Ingreso / Sueldo, Otros).
- Permitir la especificación libre de categorías personalizadas directamente desde el formulario.
- Filtrar transacciones por categoría en la vista de transacciones.
- Mostrar una etiqueta visual (badge) elegante con la categoría en cada movimiento y gasto fijo.
- Retrocompatibilidad total con registros anteriores existentes (donde `categoria` puede estar ausente o vacía).

**Non-Goals:**
- Gestión CRUD avanzada de categorías independientes (crear colores hexadecimales personalizados, iconos por categoría, etc.).
- Subcategorías anidadas multinivel.

## Decisions

### 1. Módulo centralizado `src/lib/categories.js`
- **Decisión**: Centralizar las categorías base y funciones de consulta en `src/lib/categories.js`.
- **Razón**: Permite compartir la lista de categorías predeterminadas y la extracción de categorías únicas utilizadas entre `TransactionsView.svelte` y `FixedExpensesView.svelte`.
- **Alternativas consideradas**: Hardcodear las opciones en cada componente Svelte (lleva a duplicación y desincronización).

### 2. Entrada combinada mediante `<input list="categorias-lista">` (datalist)
- **Decisión**: Utilizar `<input list="categorias-lista" bind:value={categoria} ... />` respaldado por un `<datalist>` que contiene las categorías predefinidas más las categorías personalizadas ya empleadas en la base de datos.
- **Razón**: Ofrece selector desplegable nativo en móviles y navegadores modernos con autocompletado rápido, pero permite escribir cualquier texto nuevo sin necesidad de abrir modales secundarios ni cambiar de vista.
- **Alternativas consideradas**: 
  - `<select>` estándar: Obliga a trucos de "Otro..." para mostrar campos adicionales.
  - Librería externa de tags: Aumenta peso innecesario cuando HTML5 ya provee datalist nativo.

### 3. Modelo de datos en IndexedDB
- **Decisión**: Agregar `categoria` opcional en los registros de `transacciones` y `gastosFijos`. Incrementar la versión de Dexie en `src/lib/db.js` indexando `categoria` para habilitar búsquedas eficientes.
- **Razón**: Dexie migra esquemas automáticamente sin pérdida de datos. Si una transacción vieja no tiene categoría, se maneja como valor vacío o `Otros`.

### 4. Filtro por categoría en `TransactionsView.svelte`
- **Decisión**: Añadir un selector de categoría en la barra de filtros de transacciones (`Todas`, `Alimentación`, `Servicios`, etc.) que actualiza dinámicamente la lista.
- **Razón**: Permite al usuario auditar y revisar sus gastos por rubro rápidamente.

## Risks / Trade-offs

- **[Riesgo] Dispersión de nombres de categorías personalizadas (ej. mayúsculas/minúsculas o espacios accidentales)**:
  - *Mitigación*: Normalizar (`trim()`) las categorías al guardar y al listar las opciones disponibles en el datalist.
- **[Riesgo] Registros antiguos sin categoría**:
  - *Mitigación*: Considerar `categoria || 'Otros'` o simplemente omitir el badge si está vacío, asegurando que `listarTransacciones` maneje valores `undefined` sin lanzar excepciones.
