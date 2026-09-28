## Context

Véase `proposal.md` para la motivación. Actualmente, la navegación en `src/App.svelte` utiliza botones con texto plano ("Transacciones", "Deudas", "Gastos fijos", "Respaldo") y un botón de tema con emojis (`☀️`/`🌙`). La navegación en móvil ya está fija en la parte inferior con altura y áreas táctiles de 44px según `openspec/specs/mobile-ui/spec.md`.

## Goals / Non-Goals

**Goals:**
- Sustituir el texto de los botones de navegación por iconos vectoriales SVG limpios y consistentes.
- Implementar tooltips con relieve neumórfico flotante que se adapten a la orientación y ubicación de la barra (arriba en móvil para no taparse con el dedo ni salirse de pantalla; abajo en desktop).
- Reemplazar los emojis de tema por iconos vectoriales SVG de sol y luna.
- Garantizar accesibilidad completa (`aria-label`, contraste y foco por teclado).

**Non-Goals:**
- Reemplazar formularios internos o listas de transacciones/deudas por iconos en esta fase.
- Instalar paquetes pesados de iconos en `package.json` (mantener cero dependencias externas innecesarias).

## Decisions

### 1. Componente dedicado `Icon.svelte` con catálogo SVG optimizado
- **Decisión:** Crear un componente Svelte (`src/lib/components/Icon.svelte`) que reciba `name`, `size = 22` y atributos SVG estándar, conteniendo rutas vectoriales trazadas (`stroke="currentColor"`, `stroke-width="2"`, `viewBox="0 0 24 24"`).
- **Iconos requeridos:**
  - `transactions` / `arrows-up-down`: Flechas verticales/bidireccionales opuestas de flujo de dinero.
  - `debts` / `scale`: Balanza de obligaciones y préstamos.
  - `fixedExpenses` / `calendar`: Calendario con fecha/indicador.
  - `backup` / `database`: Bóveda / disco de almacenamiento local.
  - `sun` y `moon`: Sol y Luna con trazos lineales geométricos.
- **Alternativas consideradas:**
  - *Lucide-svelte / FontAwesome:* Agregan paquetes y dependencias adicionales en `package.json`. No son necesarios para 6 iconos bien optimizados.

### 2. Tooltips neumórficos flotantes con posicionamiento dinámico
- **Decisión:** Implementar el tooltip mediante pseudo-elementos o estructura CSS encapsulada con soporte de hover y teclado (`:focus-visible`).
  - En desktop (nav superior): el tooltip flota **hacia abajo** del botón (`bottom: auto; top: calc(100% + 8px)`).
  - En móvil (nav inferior fija): el tooltip flota **hacia arriba** del botón (`top: auto; bottom: calc(100% + 8px)`).
  - Estilo: `background: var(--bg)`, sombra `var(--neu-raised-sm)`, texto `var(--texto)`, bordes redondeados (`8px`), padding compacto y micro-animación de opacidad y desplazamiento.
- **Alternativas consideradas:**
  - *Atributo `title` nativo del navegador:* Es visualmente tosco, tarda varios segundos en aparecer en algunos navegadores y no tiene estética neumórfica.

### 3. Preservación del área táctil y respuesta física
- **Decisión:** Mantener los botones de la barra de navegación con tamaño mínimo de 48x48px (superando los 44px de accesibilidad), centrando el icono vectorial. Al estar activa una vista, el botón adopta la sombra cóncava interior neumórfica (`var(--neu-inset-sm)`) y el color de acento (`var(--acento)`).

## Risks / Trade-offs

- **Comprensión de iconos sin texto en móvil:**
  - *Riesgo:* Un usuario nuevo en teléfono táctil no tiene cursor para disparar hover y podría no reconocer los iconos de inmediato.
  - *Mitigación:* Se eligen metáforas universales (flechas de flujo, balanza, calendario, base de datos) y cada botón cuenta con `aria-label`. El estado activo y el título de la vista en el encabezado proporcionan contexto inmediato.
