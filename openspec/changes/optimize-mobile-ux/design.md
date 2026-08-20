## Context

App Svelte + Vite de una sola página (`App.svelte` con `header`/`nav` fijos arriba y `main` centrado a `max-width: 720px`), estilos globales en `src/app.css`, sin preprocesador ni sistema de diseño. Tres vistas (`TransactionsView`, `DebtsView`, `FixedExpensesView`) comparten las mismas clases utilitarias (`.panel`, `.fila`, `.lista`, `form`, `button`). No hay tests de componente ni de regresión visual (`src/test/` solo cubre lógica de dominio con Vitest); la verificación de este change es necesariamente manual. Ver `proposal.md` - Why/What Changes para la motivación y el alcance.

## Goals / Non-Goals

**Goals:**
- Definir el breakpoint y la estrategia CSS (mobile-first) que va a usar toda la app.
- Definir cómo se resuelve la navegación inferior en móvil sin romper la navegación superior actual en desktop.
- Definir una convención reutilizable para que los botones/controles cumplan el mínimo de 44x44px sin duplicar CSS en cada componente.
- Definir cómo se verifica manualmente el cumplimiento de `specs/mobile-ui` (anchos de referencia).

**Non-Goals:**
- No se introduce un framework CSS ni un sistema de diseño (design tokens más allá de las variables `:root` ya existentes).
- No se agregan tests automatizados de UI/visuales (fuera de alcance; ver Risks).
- No se cambia la paleta de colores ni la tipografía, solo tamaños mínimos de controles e inputs.

## Decisions

### Mobile-first con un único breakpoint en 480px
Los estilos base en `app.css` y en cada componente se escriben para viewport angosto (layout de una columna, nav inferior); un único `@media (min-width: 480px)` adapta a tablet/desktop (nav superior, `.fila` en fila). Se elige un solo breakpoint (en vez de varios) porque el layout real solo tiene dos estados relevantes: "teléfono en mano" y "todo lo demás" (tablet apaisada, desktop) - más breakpoints agregarían complejidad sin un caso de uso que lo justifique.
Alternativa considerada: breakpoints separados para tablet (768px) y desktop (1024px). Descartada por ahora porque no hay diferencias de layout previstas entre esos dos tamaños; se puede añadir después si aparece esa necesidad.

### Navegación: `nav` pasa a barra inferior fija por defecto
`nav` se mueve fuera de `header` y se renderiza como barra fija (`position: fixed; bottom: 0`) a todo el ancho, por debajo de 480px; sobre 480px vuelve a integrarse en `header` arriba, replicando el layout actual. `main` gana `padding-bottom` suficiente (alto de la barra + `env(safe-area-inset-bottom)`) para que el contenido no quede oculto detrás de la barra en teléfonos con gesto de inicio (notch inferior).
Alternativa considerada: mantener nav arriba en todas las resoluciones y solo agrandar los botones. Descartada porque no resuelve el alcance con el pulgar en teléfonos grandes, que es el problema real que reporta el usuario (`ARGUMENTS`: "manejada desde teléfonos, con botones simples").

### Controles táctiles: clase utilitaria compartida en vez de reglas por componente
Se define una convención única en `app.css` (selector compartido, p. ej. aplicado a `nav button`, `form button[type='submit']`, y botones de acción dentro de `.lista li` / `.deuda-fila`) que fija `min-height: 44px` y `min-width: 44px` donde aplique, en lugar de repetir la regla dentro de cada uno de los tres componentes de vista. Mantiene una sola fuente de verdad para el tamaño mínimo de toque y evita que una vista quede desalineada si cambia el criterio más adelante.

### Formularios: una columna en móvil vía `.fila` sin `flex-wrap` en vez de reescribir markup
`.fila` (usado por los tres formularios) pasa de `flex-wrap: wrap` a `flex-direction: column` por defecto (debajo de 480px), y vuelve a fila en el breakpoint desktop. Como los tres componentes ya usan `.fila` para agrupar sus campos, el cambio se resuelve en `app.css` sin tocar el markup de `TransactionsView`, `DebtsView` ni `FixedExpensesView` salvo donde haga falta ajustar clases puntuales (p. ej. `.abono-form`, que hoy fuerza `flex-direction: row`).
Alternativa considerada: reescribir cada formulario con un grid de una columna explícito por componente. Descartada por duplicar trabajo tres veces cuando el cambio centralizado en `.fila` cubre los tres casos.

### Verificación manual en anchos de referencia
Dado que no hay infraestructura de test visual, la verificación de `specs/mobile-ui` se hace manualmente con las devtools del navegador (emulación de dispositivo) en 320px, 375px y 414px (teléfono) y 1024px (desktop), revisando las tres vistas en cada ancho. Esto se refleja como pasos explícitos en `tasks.md`, no como tests automatizados.

## Risks / Trade-offs

- **[Riesgo] Sin tests automatizados de UI, una regresión de layout en un cambio futuro no se detecta en CI.** → Mitigación: fuera de alcance agregar esa infraestructura en este change; la verificación manual en los anchos de referencia queda documentada en `tasks.md` para repetirla en cambios futuros a estos componentes.
- **[Riesgo] La barra de navegación inferior fija puede superponerse con la barra de gestos/UI del navegador móvil (Safari/Chrome) en algunos dispositivos.** → Mitigación: usar `env(safe-area-inset-bottom)` en el padding de la barra y de `main`, y verificar explícitamente en la emulación de iPhone (con notch) durante la revisión manual.
- **[Riesgo] Agrandar botones y pasar `.fila` a columna en móvil puede alargar visualmente formularios que hoy caben en una pantalla sin scroll.** → Mitigación: es el comportamiento deseado (prioriza tocar sin error sobre densidad visual); se acepta más scroll vertical a cambio de controles más grandes.

## Migration Plan

No aplica migración de datos (cambio puramente de presentación). Se despliega como cualquier otro cambio de frontend: build y publicación de la PWA; no requiere pasos de rollback especiales más allá de revertir el commit si se detecta una regresión visual.
