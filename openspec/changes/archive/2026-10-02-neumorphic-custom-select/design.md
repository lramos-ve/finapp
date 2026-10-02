## Context

Ver `proposal.md` para la motivación. Actualmente en la aplicación existen selectores desplegables nativos (`<select>` en `TransactionFilters.svelte` y `StatisticsView.svelte`) y campos de autocompletado nativos (`<input list="...">` con `<datalist>` en `TransactionForm.svelte`). Estos elementos delegan el menú emergente al sistema operativo móvil o de escritorio, generando ventanas emergentes genéricas sin sombras ni colores neumórficos.

## Goals / Non-Goals

**Goals:**
- Crear un componente universal `Select.svelte` en `src/modules/shared/components/` que soporte tanto selección simple (reemplazo de `<select>`) como selección con edición y autocompletado (reemplazo de `<datalist>`).
- Diseñar el menú emergente con elevación neumórfica, respetando las variables CSS de superficie y sombras duales en temas Claro y Oscuro.
- Integrar el componente en el formulario de transacciones, filtros de transacciones y vista de estadísticas.
- Soporte táctil y de accesibilidad por teclado (Escape, Flechas arriba/abajo, Enter, Tab) y cierre automático al pulsar fuera del componente.
- Crear pruebas automatizadas y asegurar que no se rompan las suites de pruebas existentes.

**Non-Goals:**
- No se crearán selectores multiselección complejos o librerías de etiquetas tipo tags con pills dentro del input, ya que excede el alcance del selector de categoría y período de la app.
- No se añadirán librerías externas de UI (manteniendo cero dependencias externas adicionales).

## Decisions

### 1. Componente Unificado `Select.svelte` con prop `allowCustom`
- **Decisión**: Un único componente `Select.svelte` que maneja tanto el caso de uso de desplegable rígido (`allowCustom: false`, disparado por botón/campo) como el de sugerencias editables (`allowCustom: true`, con `<input>` interactivo y filtrado en tiempo real).
- **Razón**: Evita duplicar código de posicionamiento, popover, detección de clics externos y estilos neumórficos entre dos componentes distintos.
- **Alternativas consideradas**: Crear dos componentes separados (`Dropdown.svelte` y `ComboBox.svelte`). Se descartó para mantener una API limpia y coherente en `src/modules/shared/components/`.

### 2. Estructura y Estilos Neumórficos
- **Decisión**: El menú emergente `.neumorphic-dropdown-menu` usará `background: var(--bg-surface)` y la sombra dual de elevación estándar neumórfica (`box-shadow: 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)`), bordes redondeados (`12px`) y opciones de lista con feedback táctil.
- **Razón**: Se sincroniza perfectamente con la estética lograda previamente en el `DatePicker` y en los paneles de la aplicación.

### 3. Normalización de Opciones
- **Decisión**: La prop `options` aceptará tanto arrays simples de strings `['Comida', 'Transporte']` como arrays de objetos `[{ value: 'mes', label: 'Este mes' }]`. Si se reciben strings, se proyectan automáticamente a `{ value, label }`.
- **Razón**: Permite compatibilidad transparente con listas simples (categorías) y listas con claves internas (períodos de estadísticas).

## Risks / Trade-offs

- **[Riesgo] Desbordamiento o solapamiento en modales o contenedores con `overflow: hidden`** → **Mitigación**: Los contenedores de formularios en FinApp usan `overflow: visible` en sus filas o suficiente padding; el menú emergente utiliza `z-index: 50` y posición relativa limpia en su contenedor base.
- **[Riesgo] Interferencia con eventos de teclado en formularios** → **Mitigación**: Cuando el dropdown está abierto, `keydown` captura `ArrowDown`, `ArrowUp`, `Enter` y `Escape`, previniendo el envío involuntario del formulario (`preventDefault`) al seleccionar una opción con Enter.
