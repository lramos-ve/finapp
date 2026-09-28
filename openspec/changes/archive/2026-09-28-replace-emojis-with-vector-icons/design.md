## Context

Véase `proposal.md` para la motivación. En el cambio previo se creó `src/lib/components/Icon.svelte` con iconos para la barra de navegación (`transactions`, `debts`, `fixedExpenses`, `backup`, `sun`, `moon`, `upload`, `file`). Aún persisten caracteres emoji en `src/App.svelte`, `src/lib/components/BackupView.svelte` y `src/lib/components/P2PSyncModal.svelte`.

## Goals / Non-Goals

**Goals:**
- Ampliar el catálogo de `Icon.svelte` con los iconos vectoriales necesarios: `wallet`, `zap`, `info`, `lock`, `alert-triangle`, `x`, `send`, `download`, `loader`, `check-circle`, `sparkles`.
- Reemplazar el 100% de los emojis restantes en el código fuente por instancias del componente `Icon`.
- Mantener una alineación vertical perfecta con el texto adyacente y los estilos neumórficos de botones e insignias.

**Non-Goals:**
- Modificar la lógica funcional o las comunicaciones WebRTC / IndexedDB existentes.
- Añadir bibliotecas de iconos de terceros a `package.json`.

## Decisions

### 1. Extensión del componente `Icon.svelte`
- **Decisión:** Mantener una arquitectura sin dependencias externas, añadiendo las nuevas rutas vectoriales SVG directamente dentro de `Icon.svelte` usando el estándar de 24x24 viewBox, `stroke="currentColor"` y `stroke-width="2"`.
- **Nuevos iconos:**
  - `wallet`: Billetera con tarjeta para el logotipo principal.
  - `zap`: Rayo estilizado para el encabezado de sincronización P2P directa.
  - `info`: Círculo con letra 'i' para avisos informativos.
  - `lock`: Candado para estados de archivo cifrado.
  - `alert-triangle`: Triángulo de advertencia para confirmaciones destructivas.
  - `x`: Cruz simétrica para el botón de cierre del modal.
  - `send`: Avión de papel / flecha de envío para transmisión P2P.
  - `download`: Bandeja de descarga para recepción P2P.
  - `loader`: Spinner / indicador de espera circular.
  - `check-circle`: Círculo con marca de verificación para estados conectados y exitosos.
  - `sparkles`: Destellos para la finalización exitosa de la sincronización.
  - `plus`: Signo de adición para el botón Abonar.
  - `check`: Marca de verificación para el botón Pagar.
  - `power`: Icono de apagado para el botón Desactivar.

### 2. Integración visual en botones y textos
- **Decisión:** Utilizar contenedores flex (`display: inline-flex; align-items: center; gap: 0.4rem;`) o clases auxiliares para que los iconos queden milimétricamente alineados con el texto en botones, títulos y badges sin desfasarse.

### 3. Botones de acción en filas (Abonar, Pagar, Desactivar)
- **Decisión:** Transformar los botones de acción en filas de lista en elegantes pastillas neumórficas (`border-radius: 999px`), con sombra suave `var(--neu-elevated-sm)`, fondo `var(--bg)`, icono vectorial acompañante (`plus` para Abonar, `check` para Pagar, `power` para Desactivar) y feedback cóncavo suave al hacer clic.

## Risks / Trade-offs

- **Alineación de texto e icono:**
  - *Riesgo:* Un icono SVG inline sin contenedor flex puede desalinearse con la línea base del texto.
  - *Mitigación:* Asegurar `vertical-align: -0.15em` o `display: inline-flex; align-items: center; gap: 0.4rem` donde convivan icono y texto.
